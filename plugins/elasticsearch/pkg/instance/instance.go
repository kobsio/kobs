package instance

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/kobsio/kobs/pkg/api/middleware/roundtripper"
	"github.com/kobsio/kobs/pkg/log"

	"go.uber.org/zap"
)

// Config is the structure of the configuration for a single Elasticsearch instance.
type Config struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Description string `json:"description"`
	Address     string `json:"address"`
	Username    string `json:"username"`
	Password    string `json:"password"`
	Token       string `json:"token"`
}

// Instance represents a single Elasticsearch instance, which can be added via the configuration file.
type Instance struct {
	Name    string
	address string
	client  *http.Client
}

// GetLogs returns the raw log documents and the buckets for the distribution of the logs accross the selected time
// range. We have to pass a query, start and end time to the function.
func (i *Instance) GetLogs(ctx context.Context, query string, timeStart, timeEnd int64) (*Data, error) {
	var err error
	var body []byte
	var url string

	url = fmt.Sprintf("%s/_search", i.address)
	body = []byte(fmt.Sprintf(`{"size":1000,"sort":[{"@timestamp":{"order":"desc"}}],"query":{"bool":{"must":[{"range":{"@timestamp":{"gte":"%d","lte":"%d"}}},{"query_string":{"query":"%s"}}]}},"aggs":{"logcount":{"auto_date_histogram":{"field":"@timestamp","buckets":30}}}}`, timeStart*1000, timeEnd*1000, strings.ReplaceAll(query, "\"", "\\\"")))

	log.Debug(ctx, "Run Elasticsearch query.", zap.ByteString("query", body))

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Content-Type", "application/json")

	resp, err := i.client.Do(req)
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

		var hits int64
		for _, bucket := range res.Aggregations.LogCount.Buckets {
			hits = hits + bucket.DocCount
		}

		data := &Data{
			Took:      res.Took,
			Hits:      hits,
			Documents: res.Hits.Hits,
			Buckets:   res.Aggregations.LogCount.Buckets,
		}

		log.Debug(ctx, "Elasticsearch query results.", zap.Int64("took", data.Took), zap.Int64("hits", data.Hits), zap.Int("documentsCount", len(data.Documents)), zap.Int("bucketsCount", len(data.Buckets)))

		return data, nil
	}

	var res ResponseError

	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return nil, err
	}

	log.Error(ctx, "The Elasticsearch query returned an error,", zap.String("type", res.Error.Type), zap.String("reason", res.Error.Reason))

	return nil, fmt.Errorf("%s: %s", res.Error.Type, res.Error.Reason)
}

// New returns a new Elasticsearch instance for the given configuration.
func New(config Config) (*Instance, error) {
	roundTripper := roundtripper.DefaultRoundTripper

	if config.Username != "" && config.Password != "" {
		roundTripper = roundtripper.BasicAuthTransport{
			Transport: roundTripper,
			Username:  config.Username,
			Password:  config.Password,
		}
	}

	if config.Token != "" {
		roundTripper = roundtripper.TokenAuthTransporter{
			Transport: roundTripper,
			Token:     config.Token,
		}
	}

	return &Instance{
		Name:    config.Name,
		address: config.Address,
		client: &http.Client{
			Transport: roundTripper,
		},
	}, nil
}
