package instance

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/kobsio/kobs/pkg/middleware/roundtripper"

	"github.com/mitchellh/mapstructure"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
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

type Instance interface {
	GetName() string
	doRequest(ctx context.Context, url string) (map[string]any, error)
	GetServices(ctx context.Context) (map[string]any, error)
	GetOperations(ctx context.Context, service string) (map[string]any, error)
	GetTraces(ctx context.Context, limit, maxDuration, minDuration, operation, service, tags string, timeStart, timeEnd int64) (map[string]any, error)
	GetTrace(ctx context.Context, traceID string) (map[string]any, error)
}

type instance struct {
	name    string
	address string
	client  *http.Client
}

func (i *instance) GetName() string {
	return i.name
}

// doRequest is a helper function to run a request against a Jaeger instance for the given path. It returns the body or
// if the request failed the error message.
func (i *instance) doRequest(ctx context.Context, url string) (map[string]any, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s%s", i.address, url), nil)
	if err != nil {
		return nil, err
	}

	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))

	resp, err := i.client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		var data map[string]any

		err = json.NewDecoder(resp.Body).Decode(&data)
		if err != nil {
			return nil, err
		}

		return data, nil
	}

	var res ResponseError

	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return nil, err
	}

	if len(res.Errors) > 0 {
		return nil, fmt.Errorf(res.Errors[0].Msg)
	}

	return nil, fmt.Errorf("%v", res)
}

func (i *instance) GetServices(ctx context.Context) (map[string]any, error) {
	return i.doRequest(ctx, "/api/services")
}

func (i *instance) GetOperations(ctx context.Context, service string) (map[string]any, error) {
	return i.doRequest(ctx, fmt.Sprintf("/api/operations?service=%s", url.QueryEscape(service)))
}

func (i *instance) GetTraces(ctx context.Context, limit, maxDuration, minDuration, operation, service, tags string, timeStart, timeEnd int64) (map[string]any, error) {
	return i.doRequest(ctx, fmt.Sprintf("/api/traces?end=%d&limit=%s&lookback=custom&maxDuration=%s&minDuration=%s&operation=%s&service=%s&start=%d&tags=%s", timeEnd*1000000, limit, maxDuration, minDuration, url.QueryEscape(operation), url.QueryEscape(service), timeStart*1000000, tags))
}

func (i *instance) GetTrace(ctx context.Context, traceID string) (map[string]any, error) {
	return i.doRequest(ctx, fmt.Sprintf("/api/traces/%s", traceID))
}

// New returns a new Jaeger instance for the given configuration.
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
			Transport: otelhttp.NewTransport(roundTripper),
		},
	}, nil
}
