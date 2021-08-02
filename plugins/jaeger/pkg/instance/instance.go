package instance

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/kobsio/kobs/pkg/api/middleware/roundtripper"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "jaeger"})
)

// Config is the structure of the configuration for a single Jaeger instance.
type Config struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Description string `json:"description"`
	Address     string `json:"address"`
	Username    string `json:"username"`
	Password    string `json:"password"`
	Token       string `json:"token"`
}

// ResponseError is the structure for a failed Jaeger API request.
type ResponseError struct {
	Errors []struct {
		Code int    `json:"code"`
		Msg  string `json:"msg"`
	} `json:"errors"`
}

// Instance represents a single Jaeger instance, which can be added via the configuration file.
type Instance struct {
	Name    string
	address string
	client  *http.Client
}

// doRequest is a helper function to run a request against a Jaeger instance for the given path. It returns the body or
// if the request failed the error message.
func (i *Instance) doRequest(ctx context.Context, url string) (map[string]interface{}, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s%s", i.address, url), nil)
	if err != nil {
		return nil, err
	}

	resp, err := i.client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		var data map[string]interface{}

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

func (i *Instance) GetServices(ctx context.Context) (map[string]interface{}, error) {
	return i.doRequest(ctx, "/api/services")
}

func (i *Instance) GetOperations(ctx context.Context, service string) (map[string]interface{}, error) {
	return i.doRequest(ctx, fmt.Sprintf("/api/operations?service=%s", service))
}

func (i *Instance) GetTraces(ctx context.Context, limit, maxDuration, minDuration, operation, service, tags string, timeStart, timeEnd int64) (map[string]interface{}, error) {
	return i.doRequest(ctx, fmt.Sprintf("/api/traces?end=%d&limit=%s&lookback=custom&maxDuration=%s&minDuration=%s&operation=%s&service=%s&start=%d&tags=%s", timeEnd*1000000, limit, maxDuration, minDuration, operation, service, timeStart*1000000, tags))
}

func (i *Instance) GetTrace(ctx context.Context, traceID string) (map[string]interface{}, error) {
	return i.doRequest(ctx, fmt.Sprintf("/api/traces/%s", traceID))
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
