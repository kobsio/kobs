package cluster

//go:generate mockgen -source=cluster.go -destination=./cluster_mock.go -package=cluster Client

import (
	"context"
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/utils/middleware/roundtripper"

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
	GetNamespaces(ctx context.Context) ([]string, error)
	GetCRDs(ctx context.Context) ([]kubernetes.CRD, error)
	GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error)
	GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error)
	GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error)
	GetUsers(ctx context.Context) ([]userv1.UserSpec, error)
	Request(ctx context.Context, method, url string, body io.Reader) (map[string]any, error)
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
	ctx, span := c.tracer.Start(ctx, "client.GetPlugins")
	span.SetAttributes(attribute.Key("client").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]plugin.Instance](c.httpClient, ctx, c.config.Token, http.MethodGet, c.config.Address+"/api/plugins", nil)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetNamespaces(ctx context.Context) ([]string, error) {
	ctx, span := c.tracer.Start(ctx, "client.GetNamespaces")
	span.SetAttributes(attribute.Key("client").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]string](c.httpClient, ctx, c.config.Token, http.MethodGet, c.config.Address+"/api/resources/namespaces", nil)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetCRDs(ctx context.Context) ([]kubernetes.CRD, error) {
	ctx, span := c.tracer.Start(ctx, "client.GetCRDs")
	span.SetAttributes(attribute.Key("client").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]kubernetes.CRD](c.httpClient, ctx, c.config.Token, http.MethodGet, c.config.Address+"/api/resources/crds", nil)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error) {
	ctx, span := c.tracer.Start(ctx, "client.GetApplications")
	span.SetAttributes(attribute.Key("client").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]applicationv1.ApplicationSpec](c.httpClient, ctx, c.config.Token, http.MethodGet, c.config.Address+"/api/applications?cluster="+c.GetName(), nil)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error) {
	ctx, span := c.tracer.Start(ctx, "client.GetDashboards")
	span.SetAttributes(attribute.Key("client").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]dashboardv1.DashboardSpec](c.httpClient, ctx, c.config.Token, http.MethodGet, c.config.Address+"/api/dashboards?cluster="+c.GetName(), nil)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error) {
	ctx, span := c.tracer.Start(ctx, "client.GetTeams")
	span.SetAttributes(attribute.Key("client").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]teamv1.TeamSpec](c.httpClient, ctx, c.config.Token, http.MethodGet, c.config.Address+"/api/teams?cluster="+c.GetName(), nil)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) GetUsers(ctx context.Context) ([]userv1.UserSpec, error) {
	ctx, span := c.tracer.Start(ctx, "client.GetUsers")
	span.SetAttributes(attribute.Key("client").String(c.config.Name))
	defer span.End()

	res, err := doRequest[[]userv1.UserSpec](c.httpClient, ctx, c.config.Token, http.MethodGet, c.config.Address+"/api/users?cluster="+c.GetName(), nil)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) Request(ctx context.Context, method, url string, body io.Reader) (map[string]any, error) {
	ctx, span := c.tracer.Start(ctx, "client.Request")
	span.SetAttributes(attribute.Key("client").String(c.config.Name))
	span.SetAttributes(attribute.Key("method").String(method))
	span.SetAttributes(attribute.Key("url").String(url))
	defer span.End()

	res, err := doRequest[map[string]any](c.httpClient, ctx, c.config.Token, method, url, body)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
	}

	return res, err
}

func (c *client) Proxy(w http.ResponseWriter, r *http.Request) {
	ctx, span := c.tracer.Start(r.Context(), "client.Proxy")
	span.SetAttributes(attribute.Key("client").String(c.config.Name))
	defer span.End()

	proxy := httputil.NewSingleHostReverseProxy(c.proxyURL)
	proxy.FlushInterval = -1

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))

		req.Host = req.URL.Host
		req.Header.Set("Authorization", "Bearer "+c.config.Token)
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Error(r.Context(), "client request failed", zap.Error(err), zap.String("clientName", c.config.Name))
		errresponse.Render(w, r, http.StatusBadGateway, err)
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
		tracer:   otel.Tracer("client"),
	}, nil
}
