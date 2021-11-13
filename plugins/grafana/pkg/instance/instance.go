package instance

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/kobsio/kobs/pkg/api/middleware/roundtripper"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "grafana"})
)

// Config is the structure of the configuration for a single Grafana instance.
type Config struct {
	Name            string `json:"name"`
	DisplayName     string `json:"displayName"`
	Description     string `json:"description"`
	InternalAddress string `json:"internalAddress"`
	PublicAddress   string `json:"publicAddress"`
	Username        string `json:"username"`
	Password        string `json:"password"`
	Token           string `json:"token"`
}

// Instance represents a single Grafana instance, which can be added via the configuration file.
type Instance struct {
	Name    string
	address string
	client  *http.Client
}

// doRequest is a helper function to run a request against a Grafana instance for the given path. It returns the body
// or if the request failed the error message.
func (i *Instance) doRequest(ctx context.Context, url string) ([]byte, error) {
	log.WithFields(logrus.Fields{"url": i.address + url}).Tracef("request url")

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
		return ioutil.ReadAll(resp.Body)
	}

	var res ResponseError

	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return nil, err
	}

	if res.Message != "" {
		return nil, fmt.Errorf(res.Message)
	}

	return nil, fmt.Errorf("an unknown error occured")
}

// GetDashboards returns a list of dashboards for the given query.
func (i *Instance) GetDashboards(ctx context.Context, query string) ([]Dashboard, error) {
	body, err := i.doRequest(ctx, fmt.Sprintf("/api/search?query=%s&limit=100", query))
	if err != nil {
		return nil, err
	}

	var dashboards []Dashboard
	if err := json.Unmarshal(body, &dashboards); err != nil {
		return nil, err
	}

	return dashboards, nil
}

// GetDashboard returns a single dashboard by it's uid.
func (i *Instance) GetDashboard(ctx context.Context, uid string) (*Dashboard, error) {
	body, err := i.doRequest(ctx, fmt.Sprintf("/api/dashboards/uid/%s", uid))
	if err != nil {
		return nil, err
	}

	var dashboard SingleDashboardResponse
	if err := json.Unmarshal(body, &dashboard); err != nil {
		return nil, err
	}

	return &Dashboard{
		DashboardData:     dashboard.Dashboard,
		DashboardMetadata: dashboard.Metadata,
	}, nil
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
		address: config.InternalAddress,
		client: &http.Client{
			Transport: roundTripper,
		},
	}, nil
}
