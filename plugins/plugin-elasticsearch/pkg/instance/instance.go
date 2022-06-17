package instance

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/roundtripper"

	"github.com/mitchellh/mapstructure"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
	"go.uber.org/zap"
)

// Config is the structure of the configuration for a single Elasticsearch instance.
type Config struct {
	Address  string `json:"address"`
	Username string `json:"username"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

// Instance is the interface which must be implemented by each configured Elasticsearch instance.
type Instance interface {
	GetName() string
	GetLogs(ctx context.Context, query string, timeStart, timeEnd int64) (*Data, error)
}

type instance struct {
	name    string
	address string
	client  *http.Client
}

// Getname returns the name of the Elasticsearch instance, as it was configured by the user.
func (i *instance) GetName() string {
	return i.name
}

// GetLogs returns the raw log documents and the buckets for the distribution of the logs accross the selected time
// range. We have to pass a query, start and end time to the function.
func (i *instance) GetLogs(ctx context.Context, query string, timeStart, timeEnd int64) (*Data, error) {
	var err error
	var body []byte
	var url string

	url = fmt.Sprintf("%s/_search", i.address)
	body = []byte(fmt.Sprintf(`{"size":1000,"sort":[{"@timestamp":{"order":"desc"}}],"query":{"bool":{"must":[{"range":{"@timestamp":{"gte":"%d","lte":"%d"}}},{"query_string":{"query":"%s"}}]}},"aggs":{"logcount":{"auto_date_histogram":{"field":"@timestamp","buckets":30}}}}`, timeStart*1000, timeEnd*1000, strings.ReplaceAll(query, "\"", "\\\"")))

	log.Debug(ctx, "Run Elasticsearch query", zap.ByteString("query", body))

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))
	req.Header.Set("Content-Type", "application/json")

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

		log.Debug(ctx, "Elasticsearch query results", zap.Int64("took", data.Took), zap.Int64("hits", data.Hits), zap.Int("documentsCount", len(data.Documents)), zap.Int("bucketsCount", len(data.Buckets)))

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

// New returns a new Elasticsearch instance for the given configuration. If the configuration contains a username and
// password we will add a basic auth header to each request against the Elasticsearch api. If the config contains a
// token we are adding an authentication header with the token.
func New(name string, options map[string]interface{}) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

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

	return &instance{
		name:    name,
		address: config.Address,
		client: &http.Client{
			Transport: otelhttp.NewTransport(roundTripper),
		},
	}, nil
}
