package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/kobsio/kobs/pkg/utils/middleware/roundtripper"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/mitchellh/mapstructure"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
)

// Config is the structure of the configuration for a single Jaeger database instance.
type Config struct {
	Address  string `json:"address"`
	Username string `json:"username"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

// ResponseError is the structure for a failed Jaeger API request.
type ResponseError struct {
	Errors []struct {
		Code int    `json:"code"`
		Msg  string `json:"msg"`
	} `json:"errors"`
}

// Instance is the interface which must be implemented by a single SonarQube instance.
type Instance interface {
	GetName() string
	doRequest(ctx context.Context, w http.ResponseWriter, url string) error
	GetServices(ctx context.Context, w http.ResponseWriter) error
	GetOperations(ctx context.Context, w http.ResponseWriter, service string) error
	GetTraces(ctx context.Context, w http.ResponseWriter, limit, maxDuration, minDuration, operation, service, tags string, timeStart, timeEnd int64) error
	GetTrace(ctx context.Context, w http.ResponseWriter, traceID string) error
	GetMetrics(ctx context.Context, w http.ResponseWriter, metric, service, groupByOperation, quantile, ratePer, step string, spanKinds []string, timeStart, timeEnd int64) error
}

type instance struct {
	name    string
	address string
	client  *http.Client
}

func (i *instance) GetName() string {
	return i.name
}

// GetProjects returns a list of projects from SonarQube.
func (i *instance) doRequest(ctx context.Context, w http.ResponseWriter, url string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s%s", i.address, url), nil)
	if err != nil {
		return err
	}

	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))
	if requestID := middleware.GetReqID(ctx); requestID != "" {
		req.Header.Set("requestID", requestID)
	}

	resp, err := i.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		_, err = io.Copy(w, resp.Body)
		if err != nil {
			return err
		}
		return nil
	}

	var res ResponseError

	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return err
	}

	if len(res.Errors) > 0 {
		return fmt.Errorf(res.Errors[0].Msg)
	}

	return fmt.Errorf("%v", res)
}

func (i *instance) GetServices(ctx context.Context, w http.ResponseWriter) error {
	return i.doRequest(ctx, w, "/api/services")
}

func (i *instance) GetOperations(ctx context.Context, w http.ResponseWriter, service string) error {
	return i.doRequest(ctx, w, fmt.Sprintf("/api/operations?service=%s", url.QueryEscape(service)))
}

func (i *instance) GetTraces(ctx context.Context, w http.ResponseWriter, limit, maxDuration, minDuration, operation, service, tags string, timeStart, timeEnd int64) error {
	return i.doRequest(ctx, w, fmt.Sprintf("/api/traces?end=%d&limit=%s&lookback=custom&maxDuration=%s&minDuration=%s&operation=%s&service=%s&start=%d&tags=%s", timeEnd*1000000, limit, maxDuration, minDuration, url.QueryEscape(operation), url.QueryEscape(service), timeStart*1000000, tags))
}

func (i *instance) GetTrace(ctx context.Context, w http.ResponseWriter, traceID string) error {
	return i.doRequest(ctx, w, fmt.Sprintf("/api/traces/%s", traceID))
}

func (i *instance) GetMetrics(ctx context.Context, w http.ResponseWriter, metric, service, groupByOperation, quantile, ratePer, step string, spanKinds []string, timeStart, timeEnd int64) error {
	timeStart = timeStart * 1000
	timeEnd = timeEnd * 1000
	lookback := timeEnd - timeStart

	var spanKindsParameters string
	for _, spanKind := range spanKinds {
		spanKindsParameters = fmt.Sprintf("%s&spanKind=%s", spanKindsParameters, spanKind)
	}

	return i.doRequest(ctx, w, fmt.Sprintf("/api/metrics/%s?service=%s&endTs=%d&lookback=%d&groupByOperation=%s&quantile=%s&ratePer=%s&step=%s%s", metric, service, timeEnd, lookback, groupByOperation, quantile, ratePer, step, spanKindsParameters))
}

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
