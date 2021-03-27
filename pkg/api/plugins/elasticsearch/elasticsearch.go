package elasticsearch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	elasticsearchProto "github.com/kobsio/kobs/pkg/api/plugins/elasticsearch/proto"
	pluginsProto "github.com/kobsio/kobs/pkg/api/plugins/plugins/proto"
	"github.com/kobsio/kobs/pkg/api/plugins/plugins/shared"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "elasticsearch"})
)

type Config struct {
	Name        string `yaml:"name"`
	Description string `yaml:"description"`
	Address     string `yaml:"address"`
	Username    string `yaml:"username"`
	Password    string `yaml:"password"`
	Token       string `yaml:"token"`
}

type Elasticsearch struct {
	elasticsearchProto.UnimplementedElasticsearchServer
	instances []*Instance
}

type Instance struct {
	name    string
	address string
	client  *http.Client
}

// Response is the structure of successful Elasticsearch API call.
type Response struct {
	ScrollID string `json:"_scroll_id"`
	Took     int64  `json:"took"`
	TimedOut bool   `json:"timed_out"`
	Shards   struct {
		Total      int64 `json:"total"`
		Successful int64 `json:"successful"`
		Skipped    int64 `json:"skipped"`
		Failed     int64 `json:"failed"`
	} `json:"_shards"`
	Hits struct {
		Total struct {
			Value    int64  `json:"value"`
			Relation string `json:"relation"`
		} `json:"total"`
		Hits []map[string]interface{} `json:"hits"`
	} `json:"hits"`
	Aggregations struct {
		LogCount struct {
			Buckets []struct {
				KeyAsString string `json:"key_as_string"`
				Key         int64  `json:"key"`
				DocCount    int64  `json:"doc_count"`
			} `json:"buckets"`
		} `json:"logcount"`
	} `json:"aggregations"`
}

// ResponseError is the structure of failed Elasticsearch API call.
type ResponseError struct {
	Error struct {
		RootCause []struct {
			Type   string `json:"type"`
			Reason string `json:"reason"`
		} `json:"root_cause"`
		Type     string `json:"type"`
		Reason   string `json:"reason"`
		CausedBy struct {
			Type   string `json:"type"`
			Reason string `json:"reason"`
		} `json:"caused_by"`
	} `json:"error"`
	Status int `json:"status"`
}

func (e *Elasticsearch) getInstace(name string) *Instance {
	for _, i := range e.instances {
		if i.name == name {
			return i
		}
	}

	return nil
}

func (e *Elasticsearch) GetLogs(ctx context.Context, getLogsRequest *elasticsearchProto.GetLogsRequest) (*elasticsearchProto.GetLogsResponse, error) {
	if getLogsRequest == nil {
		return nil, fmt.Errorf("request data is missing")
	}

	instance := e.getInstace(getLogsRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Prometheus plugin")
	}

	var err error
	var body []byte
	var url string

	if getLogsRequest.ScrollID == "" {
		url = fmt.Sprintf("%s/_search?scroll=15m", instance.address)
		body = []byte(fmt.Sprintf(`{"size":100,"sort":[{"@timestamp":{"order":"desc"}}],"query":{"bool":{"must":[{"range":{"@timestamp":{"gte":"%d","lte":"%d"}}},{"query_string":{"query":"%s"}}]}},"aggs":{"logcount":{"auto_date_histogram":{"field":"@timestamp","buckets":30}}}}`, getLogsRequest.TimeStart*1000, getLogsRequest.TimeEnd*1000, getLogsRequest.Query.Query))
	} else {
		url = fmt.Sprintf("%s/_search/scroll", instance.address)
		body = []byte(`{"scroll" : "15m", "scroll_id" : "` + getLogsRequest.ScrollID + `"}`)
	}

	log.WithFields(logrus.Fields{"query": string(body)}).Debugf("Query body.")

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Content-Type", "application/json")

	resp, err := instance.client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		var res Response

		err = json.NewDecoder(resp.Body).Decode(&res)
		if err != nil {
			return nil, err
		}

		log.WithFields(logrus.Fields{"took": res.Took, "hits": res.Hits.Total.Value}).Debugf("Query stats.")

		jsonString, err := json.Marshal(res.Hits.Hits)
		if err != nil {
			return nil, err
		}

		var buckets []*elasticsearchProto.Bucket

		for _, bucket := range res.Aggregations.LogCount.Buckets {
			buckets = append(buckets, &elasticsearchProto.Bucket{
				X: bucket.Key,
				Y: bucket.DocCount,
			})
		}

		return &elasticsearchProto.GetLogsResponse{
			ScrollID: res.ScrollID,
			Hits:     res.Hits.Total.Value,
			Took:     res.Took,
			Logs:     string(jsonString),
			Buckets:  buckets,
		}, nil
	}

	var res ResponseError

	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return nil, err
	}

	log.WithFields(logrus.Fields{"type": res.Error.Type, "reason": res.Error.Reason}).Error("The query returned an error.")

	return nil, fmt.Errorf("%s: %s", res.Error.Type, res.Error.Reason)
}

func Register(cfg []Config, grpcServer *grpc.Server) ([]*pluginsProto.PluginShort, error) {
	log.Tracef("Register Elasticsearch Plugin.")

	var pluginDetails []*pluginsProto.PluginShort
	var instances []*Instance

	for _, config := range cfg {
		roundTripper := shared.DefaultRoundTripper

		if config.Username != "" && config.Password != "" {
			roundTripper = shared.BasicAuthTransport{
				Transport: roundTripper,
				Username:  config.Username,
				Password:  config.Password,
			}
		}

		if config.Token != "" {
			roundTripper = shared.TokenAuthTransporter{
				Transport: roundTripper,
				Token:     config.Token,
			}
		}

		pluginDetails = append(pluginDetails, &pluginsProto.PluginShort{
			Name:        config.Name,
			Description: config.Description,
			Type:        "elasticsearch",
		})
		instances = append(instances, &Instance{
			name:    config.Name,
			address: config.Address,
			client: &http.Client{
				Transport: roundTripper,
			},
		})
	}

	elasticsearchProto.RegisterElasticsearchServer(grpcServer, &Elasticsearch{
		instances: instances,
	})

	return pluginDetails, nil
}
