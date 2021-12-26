package instance

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/api/middleware/roundtripper"
	"github.com/kobsio/kobs/pkg/log"

	"go.uber.org/zap"
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

// Instance is the interface which must be implemented by each configured Grafana instance.
type Instance interface {
	doRequest(ctx context.Context, url string) ([]byte, error)
	GetName() string
	GetDashboards(ctx context.Context, query string) ([]Dashboard, error)
	GetDashboard(ctx context.Context, uid string) (*Dashboard, error)
}

type instance struct {
	name    string
	address string
	client  *http.Client
}

// doRequest is a helper function to run a request against a Grafana instance for the given path. It returns the body
// or if the request failed an error message.
func (i *instance) doRequest(ctx context.Context, url string) ([]byte, error) {
	log.Debug(ctx, "Request URL.", zap.String("url", fmt.Sprintf("%s%s", i.address, url)))

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

func (i *instance) GetName() string {
	return i.name
}

// GetDashboards returns a list of dashboards for the given query. To get the a list of dashboards we have to call the
// "/api/search" endpoint of the Grafana instance with the provided query parameter and an limit on how much dashboards,
// should be returned.
func (i *instance) GetDashboards(ctx context.Context, query string) ([]Dashboard, error) {
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

// GetDashboard returns a single dashboard by it's uid. To get the dashboard the "/api/dashboards/uid/{uid}" endpoint of
// the Grafana instance can be used.
func (i *instance) GetDashboard(ctx context.Context, uid string) (*Dashboard, error) {
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

// New returns a new Grafana instance for the given configuration. If the configuration contains a username and
// password, we assume that the Grafana API is protected via basic auth. If the configuration contains a token we add
// a token based authentication to each request.
func New(config Config) Instance {
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
		name:    config.Name,
		address: config.InternalAddress,
		client: &http.Client{
			Timeout:   30 * time.Second,
			Transport: roundTripper,
		},
	}
}
