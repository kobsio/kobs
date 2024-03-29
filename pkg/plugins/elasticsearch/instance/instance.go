package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/roundtripper"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/mitchellh/mapstructure"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
	"go.uber.org/zap"
)

// Config is the structure of the configuration for a single Datadog instance.
type Config struct {
	Address  string `json:"address"`
	Username string `json:"username"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

type Instance interface {
	GetName() string
	GetLogs(ctx context.Context, query, indexPattern, timestampField string, timeStart, timeEnd int64) (*Data, error)
}

type instance struct {
	name    string
	address string
	client  *http.Client
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) GetLogs(ctx context.Context, query, indexPattern, timestampField string, timeStart, timeEnd int64) (*Data, error) {
	var err error

	url := fmt.Sprintf("%s/%s/_search", i.address, indexPattern)
	body := []byte(fmt.Sprintf(`{"size":1000,"query":{"bool":{"must":[{"query_string":{"query":"%s"}}]}}}`, strings.ReplaceAll(query, "\"", "\\\"")))
	if timestampField != "" {
		body = []byte(fmt.Sprintf(`{"size":1000,"sort":[{"%s":{"order":"desc"}}],"query":{"bool":{"must":[{"range":{"%s":{"gte":"%d","lte":"%d"}}},{"query_string":{"query":"%s"}}]}},"aggs":{"logcount":{"auto_date_histogram":{"field":"%s","buckets":30}}}}`, timestampField, timestampField, timeStart*1000, timeEnd*1000, strings.ReplaceAll(query, "\"", "\\\""), timestampField))
	}

	log.Debug(ctx, "Run Elasticsearch query", zap.ByteString("query", body))

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))
	req.Header.Set("Content-Type", "application/json")
	if requestID := middleware.GetReqID(ctx); requestID != "" {
		req.Header.Set("requestID", requestID)
	}

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
		if len(res.Aggregations.LogCount.Buckets) == 0 {
			hits = res.Hits.Total.Value
		} else {
			for _, bucket := range res.Aggregations.LogCount.Buckets {
				hits = hits + bucket.DocCount
			}
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

// New returns a new Datadog instance for the given configuration.
func New(name string, options map[string]any) (Instance, error) {
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
			Transport: roundTripper,
		},
	}, nil
}
