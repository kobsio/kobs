package satellite

import (
	"context"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"go.uber.org/zap"
)

type Config struct {
	Name    string `json:"name"`
	Address string `json:"address"`
	Token   string `json:"token"`
}

type Client interface {
	GetName() string
	GetPlugins(ctx context.Context) ([]plugin.Instance, error)
	GetClusters(ctx context.Context) ([]string, error)
	GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error)
	GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error)
	GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error)
	GetUsers(ctx context.Context) ([]userv1.UserSpec, error)
	Proxy(w http.ResponseWriter, r *http.Request)
}

type client struct {
	config     Config
	httpClient *http.Client
	proxyURL   *url.URL
}

func (c *client) GetName() string {
	return c.config.Name
}

func (c *client) GetPlugins(ctx context.Context) ([]plugin.Instance, error) {
	return doRequest[plugin.Instance](ctx, c.httpClient, c.config.Address+"/api/plugins", c.config.Token)
}

func (c *client) GetClusters(ctx context.Context) ([]string, error) {
	return doRequest[string](ctx, c.httpClient, c.config.Address+"/api/clusters", c.config.Token)
}

func (c *client) GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error) {
	return doRequest[applicationv1.ApplicationSpec](ctx, c.httpClient, c.config.Address+"/api/applications", c.config.Token)
}

func (c *client) GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error) {
	return doRequest[dashboardv1.DashboardSpec](ctx, c.httpClient, c.config.Address+"/api/dashboards", c.config.Token)
}

func (c *client) GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error) {
	return doRequest[teamv1.TeamSpec](ctx, c.httpClient, c.config.Address+"/api/teams", c.config.Token)
}

func (c *client) GetUsers(ctx context.Context) ([]userv1.UserSpec, error) {
	return doRequest[userv1.UserSpec](ctx, c.httpClient, c.config.Address+"/api/users", c.config.Token)
}

func (c *client) Proxy(w http.ResponseWriter, r *http.Request) {
	proxy := httputil.NewSingleHostReverseProxy(c.proxyURL)
	proxy.FlushInterval = -1

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)

		req.Header.Add("Authorization", "Bearer "+c.config.Token)
		req.Header.Add("x-kobs-satellite", c.config.Name)
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Error(r.Context(), "Satellite request failed", zap.Error(err), zap.String("satelliteName", c.config.Name))
		errresponse.Render(w, r, err, http.StatusBadGateway, "Satellite request failed")
		return
	}

	proxy.ServeHTTP(w, r)
}

func NewClient(config Config) (Client, error) {
	proxyURL, err := url.Parse(config.Address)
	if err != nil {
		return nil, err
	}

	return &client{
		config: config,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
		proxyURL: proxyURL,
	}, nil
}
