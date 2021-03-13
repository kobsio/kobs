package elasticsearch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/kobsio/kobs/pkg/api/datasources/datasource/shared"
	"github.com/kobsio/kobs/pkg/generated/proto"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "elasticsearch"})
)

// Config contains all required fields to create a new Elasticsearch datasource.
type Config struct {
	Address  string `yaml:"address"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
	Token    string `yaml:"token"`
}

// Elasticsearch implements the Elasticsearch datasource.
type Elasticsearch struct {
	name     string
	client   *http.Client
	endpoint string
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

// GetDatasource returns the details for the datasource. Currently this is only the name and the type of the datasource.
func (e *Elasticsearch) GetDatasource() (string, string) {
	return e.name, "elasticsearch"
}

// GetVariables is not implemented for Elasticsearch.
func (e *Elasticsearch) GetVariables(ctx context.Context, options *proto.DatasourceOptions, variables []*proto.ApplicationMetricsVariable) ([]*proto.ApplicationMetricsVariable, error) {
	return nil, fmt.Errorf("logs interface isn't implemented for elasticsearch")
}

// GetMetrics is not implemented for Elasticsearch.
func (e *Elasticsearch) GetMetrics(ctx context.Context, options *proto.DatasourceOptions, variables []*proto.ApplicationMetricsVariable, queries []*proto.ApplicationMetricsQuery) ([]*proto.DatasourceMetrics, []string, error) {
	return nil, nil, fmt.Errorf("logs interface isn't implemented for elasticsearch")
}

// GetLogs implements the GetLogs method for the Elasticsearch datasource. If the request contains a scrollID, we will
// use this ID to retrieve more logs for a previous request. If the scroll ID is an empty string we will perform a new
// search request against the Elasticsearch API.
// If the request succeeds we will return the hits as string in the logs field. We also set the buckets to render a bar
// chart with the distribution of the log lines over the selected time range. If the request fails we parse the returned
// body into the error struct and return the error.
func (e *Elasticsearch) GetLogs(ctx context.Context, scrollID string, options *proto.DatasourceOptions, query *proto.ApplicationLogsQuery) (int64, int64, string, string, []*proto.DatasourceLogsBucket, error) {
	var err error
	var body []byte
	var url string

	if scrollID == "" {
		url = fmt.Sprintf("%s/_search?scroll=15m", e.endpoint)
		body = []byte(fmt.Sprintf(`{"size":100,"sort":[{"@timestamp":{"order":"desc"}}],"query":{"bool":{"must":[{"range":{"@timestamp":{"gte":"%d","lte":"%d"}}},{"query_string":{"query":"%s"}}]}},"aggs":{"logcount":{"auto_date_histogram":{"field":"@timestamp","buckets":30}}}}`, options.TimeStart*1000, options.TimeEnd*1000, query.Query))
	} else {
		url = fmt.Sprintf("%s/_search/scroll", e.endpoint)
		body = []byte(`{"scroll" : "15m", "scroll_id" : "` + scrollID + `"}`)
	}

	log.WithFields(logrus.Fields{"query": string(body)}).Debugf("Query body.")

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		return 0, 0, "", "", nil, err
	}
	req.Header.Add("Content-Type", "application/json")

	resp, err := e.client.Do(req)
	if err != nil {
		return 0, 0, "", "", nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		var res Response

		err = json.NewDecoder(resp.Body).Decode(&res)
		if err != nil {
			return 0, 0, "", "", nil, err
		}

		log.WithFields(logrus.Fields{"took": res.Took, "hits": res.Hits.Total.Value}).Debugf("Query stats.")

		jsonString, err := json.Marshal(res.Hits.Hits)
		if err != nil {
			return 0, 0, "", "", nil, err
		}

		var buckets []*proto.DatasourceLogsBucket

		for _, bucket := range res.Aggregations.LogCount.Buckets {
			buckets = append(buckets, &proto.DatasourceLogsBucket{
				X: bucket.Key,
				Y: bucket.DocCount,
			})
		}

		return res.Hits.Total.Value, res.Took, res.ScrollID, string(jsonString), buckets, nil
	}

	var res ResponseError

	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return 0, 0, "", "", nil, err
	}

	log.WithFields(logrus.Fields{"type": res.Error.Type, "reason": res.Error.Reason}).Error("The query returned an error.")

	return 0, 0, "", "", nil, fmt.Errorf("%s: %s", res.Error.Type, res.Error.Reason)
}

// GetTraces is not implemented for Elasticsearch.
func (e *Elasticsearch) GetTraces(ctx context.Context, options *proto.DatasourceOptions) error {
	return fmt.Errorf("logs interface isn't implemented for elasticsearch")
}

// New returns a new Elasticsearch datasource. We are using a simular logic like for Prometheus to create the http
// client for the calls against the Elasticsearch API.
func New(name string, config Config) (*Elasticsearch, error) {
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

	return &Elasticsearch{
		name:     name,
		client:   &http.Client{Transport: roundTripper},
		endpoint: config.Address,
	}, nil
}
