package instance

import (
	"context"
	"fmt"
	"net/http"

	"github.com/kobsio/kobs/pkg/middleware/roundtripper"

	"github.com/mitchellh/mapstructure"
)

// Config is the structure of the configuration for a single Grafana instance.
type Config struct {
	Address  string `json:"address"`
	Username string `json:"username"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

type Instance interface {
	GetName() string
	GetDashboards(ctx context.Context, query string) ([]Dashboard, error)
	GetDashboard(ctx context.Context, uid string) (*Dashboard, error)
}

type instance struct {
	name    string
	address string
	client  *http.Client
}

func (i *instance) GetName() string {
	return i.name
}

// GetDashboards returns a list of dashboards for the given query. To get the a list of dashboards we have to call the
// "/api/search" endpoint of the Grafana instance with the provided query parameter and an limit on how much dashboards,
// should be returned.
func (i *instance) GetDashboards(ctx context.Context, query string) ([]Dashboard, error) {
	dashboards, err := doRequest[[]Dashboard](ctx, i.client, fmt.Sprintf("%s/api/search?query=%s&limit=100", i.address, query))
	if err != nil {
		return nil, err
	}

	return dashboards, nil
}

// GetDashboard returns a single dashboard by it's uid. To get the dashboard the "/api/dashboards/uid/{uid}" endpoint of
// the Grafana instance can be used.
func (i *instance) GetDashboard(ctx context.Context, uid string) (*Dashboard, error) {
	dashboard, err := doRequest[SingleDashboardResponse](ctx, i.client, fmt.Sprintf("%s/api/dashboards/uid/%s", i.address, uid))
	if err != nil {
		return nil, err
	}

	return &Dashboard{
		DashboardData:     dashboard.Dashboard,
		DashboardMetadata: dashboard.Metadata,
	}, nil
}

// New returns a new Grafana instance for the given configuration.
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
