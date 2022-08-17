package satellite

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/middleware/roundtripper"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"
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
	GetNamespaces(ctx context.Context) (map[string][]string, error)
	GetCRDs(ctx context.Context) ([]cluster.CRD, error)
	GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error)
	GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error)
	GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error)
	GetUsers(ctx context.Context) ([]userv1.UserSpec, error)
	GetResources(ctx context.Context, user *authContext.User, cluster, namespace, name, resource, path, paramName, param string) (map[string]any, error)
	Proxy(w http.ResponseWriter, r *http.Request)
}

type client struct {
	config     Config
	httpClient *http.Client
	proxyURL   *url.URL
	tracer     trace.Tracer
}

func (c *client) GetName() string {
	return c.config.Name
}

func (c *client) GetPlugins(ctx context.Context) ([]plugin.Instance, error) {
	ctx, span := c.tracer.Start(ctx, "satellite.GetPlugins")
	span.SetAttributes(attribute.Key("satellite").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]plugin.Instance](ctx, nil, c.httpClient, c.config.Address+"/api/plugins", c.config.Token)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetClusters(ctx context.Context) ([]string, error) {
	ctx, span := c.tracer.Start(ctx, "satellite.GetClusters")
	span.SetAttributes(attribute.Key("satellite").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]string](ctx, nil, c.httpClient, c.config.Address+"/api/clusters", c.config.Token)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetNamespaces(ctx context.Context) (map[string][]string, error) {

	ctx, span := c.tracer.Start(ctx, "satellite.GetNamespaces")
	span.SetAttributes(attribute.Key("satellite").String(c.config.Name))
	defer span.End()

	res, err := doRequest[map[string][]string](ctx, nil, c.httpClient, c.config.Address+"/api/clusters/namespaces", c.config.Token)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetCRDs(ctx context.Context) ([]cluster.CRD, error) {
	ctx, span := c.tracer.Start(ctx, "satellite.GetCRDs")
	span.SetAttributes(attribute.Key("satellite").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]cluster.CRD](ctx, nil, c.httpClient, c.config.Address+"/api/clusters/crds", c.config.Token)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error) {
	ctx, span := c.tracer.Start(ctx, "satellite.GetApplications")
	span.SetAttributes(attribute.Key("satellite").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]applicationv1.ApplicationSpec](ctx, nil, c.httpClient, c.config.Address+"/api/applications", c.config.Token)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error) {
	ctx, span := c.tracer.Start(ctx, "satellite.GetDashboards")
	span.SetAttributes(attribute.Key("satellite").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]dashboardv1.DashboardSpec](ctx, nil, c.httpClient, c.config.Address+"/api/dashboards", c.config.Token)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error) {
	ctx, span := c.tracer.Start(ctx, "satellite.GetTeams")
	span.SetAttributes(attribute.Key("satellite").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]teamv1.TeamSpec](ctx, nil, c.httpClient, c.config.Address+"/api/teams", c.config.Token)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetUsers(ctx context.Context) ([]userv1.UserSpec, error) {
	ctx, span := c.tracer.Start(ctx, "satellite.GetUsers")
	span.SetAttributes(attribute.Key("satellite").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]userv1.UserSpec](ctx, nil, c.httpClient, c.config.Address+"/api/users", c.config.Token)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetResources(ctx context.Context, user *authContext.User, cluster, namespace, name, resource, path, paramName, param string) (map[string]any, error) {
	ctx, span := c.tracer.Start(ctx, "satellite.GetResources")
	span.SetAttributes(attribute.Key("satellite").String(c.config.Name))
	defer span.End()

	res, err := doRequest[map[string]any](ctx, user, c.httpClient, fmt.Sprintf("%s/api/resources?cluster=%s&namespace=%s&name=%s&resource=%s&path=%s&paramName=%s&param=%s", c.config.Address, cluster, namespace, name, resource, path, paramName, param), c.config.Token)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) Proxy(w http.ResponseWriter, r *http.Request) {
	ctx, span := c.tracer.Start(r.Context(), "satellite.Proxy")
	span.SetAttributes(attribute.Key("satellite").String(c.config.Name))
	defer span.End()

	proxy := httputil.NewSingleHostReverseProxy(c.proxyURL)
	proxy.FlushInterval = -1

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))

		req.Host = req.URL.Host
		req.Header.Set("Authorization", "Bearer "+c.config.Token)
		req.Header.Set("x-kobs-satellite", c.config.Name)
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
			Transport: roundtripper.DefaultRoundTripper,
		},
		proxyURL: proxyURL,
		tracer:   otel.Tracer("satellite"),
	}, nil
}
