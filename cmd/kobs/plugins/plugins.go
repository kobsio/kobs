package plugins

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"

	// Import all plugins, which should be used with the kobs instance. By default this are all first party plugins from
	// the plugins folder.
	"github.com/kobsio/kobs/plugins/applications"
	"github.com/kobsio/kobs/plugins/clickhouse"
	"github.com/kobsio/kobs/plugins/dashboards"
	"github.com/kobsio/kobs/plugins/elasticsearch"
	"github.com/kobsio/kobs/plugins/flux"
	"github.com/kobsio/kobs/plugins/istio"
	"github.com/kobsio/kobs/plugins/jaeger"
	"github.com/kobsio/kobs/plugins/kiali"
	"github.com/kobsio/kobs/plugins/markdown"
	"github.com/kobsio/kobs/plugins/opsgenie"
	"github.com/kobsio/kobs/plugins/prometheus"
	"github.com/kobsio/kobs/plugins/resources"
	"github.com/kobsio/kobs/plugins/rss"
	"github.com/kobsio/kobs/plugins/sql"
	"github.com/kobsio/kobs/plugins/teams"
	"github.com/kobsio/kobs/plugins/users"
)

// Config holds the configuration for all plugins. We have to add the configuration for all the imported plugins.
type Config struct {
	Applications  applications.Config  `json:"applications"`
	Clickhouse    clickhouse.Config    `json:"clickhouse"`
	Dashboards    dashboards.Config    `json:"dashboards"`
	Elasticsearch elasticsearch.Config `json:"elasticsearch"`
	Flux          flux.Config          `json:"flux"`
	Istio         istio.Config         `json:"istio"`
	Jaeger        jaeger.Config        `json:"jaeger"`
	Kiali         kiali.Config         `json:"kiali"`
	Opsgenie      opsgenie.Config      `json:"opsgenie"`
	Prometheus    prometheus.Config    `json:"prometheus"`
	Markdown      markdown.Config      `json:"markdown"`
	Resources     resources.Config     `json:"resources"`
	RSS           rss.Config           `json:"rss"`
	SQL           sql.Config           `json:"sql"`
	Teams         teams.Config         `json:"teams"`
	Users         users.Config         `json:"users"`
}

// Router implements the router for the plugins package. This only registeres one route which is used to return all the
// configured plugins.
type Router struct {
	*chi.Mux
	plugins *plugin.Plugins
}

// getPlugins returns all registered plugin instances.
func (router *Router) getPlugins(w http.ResponseWriter, r *http.Request) {
	render.JSON(w, r, router.plugins)
}

// Register is used to register all api routes for plugins.
func Register(clusters *clusters.Clusters, config Config) chi.Router {
	router := Router{
		chi.NewRouter(),
		&plugin.Plugins{},
	}

	router.Get("/", router.getPlugins)

	// Initialize all plugins
	resourcesRouter := resources.Register(clusters, router.plugins, config.Resources)
	applicationsRouter := applications.Register(clusters, router.plugins, config.Applications)
	teamsRouter := teams.Register(clusters, router.plugins, config.Teams)
	usersRouter := users.Register(clusters, router.plugins, config.Users)
	dashboardsRouter := dashboards.Register(clusters, router.plugins, config.Dashboards)
	prometheusRouter, prometheusInstances := prometheus.Register(clusters, router.plugins, config.Prometheus)
	elasticsearchRouter := elasticsearch.Register(clusters, router.plugins, config.Elasticsearch)
	clickhouseRouter, clickhouseInstances := clickhouse.Register(clusters, router.plugins, config.Clickhouse)
	jaegerRouter := jaeger.Register(clusters, router.plugins, config.Jaeger)
	kialiRouter := kiali.Register(clusters, router.plugins, config.Kiali)
	istioRouter := istio.Register(clusters, router.plugins, config.Istio, prometheusInstances, clickhouseInstances)
	fluxRouter := flux.Register(clusters, router.plugins, config.Flux)
	opsgenieRouter := opsgenie.Register(clusters, router.plugins, config.Opsgenie)
	sqlRouter := sql.Register(clusters, router.plugins, config.SQL)
	markdownRouter := markdown.Register(clusters, router.plugins, config.Markdown)
	rssRouter := rss.Register(clusters, router.plugins, config.RSS)

	// Register all plugins
	router.Mount(resources.Route, resourcesRouter)
	router.Mount(applications.Route, applicationsRouter)
	router.Mount(teams.Route, teamsRouter)
	router.Mount(users.Route, usersRouter)
	router.Mount(dashboards.Route, dashboardsRouter)
	router.Mount(prometheus.Route, prometheusRouter)
	router.Mount(elasticsearch.Route, elasticsearchRouter)
	router.Mount(clickhouse.Route, clickhouseRouter)
	router.Mount(jaeger.Route, jaegerRouter)
	router.Mount(kiali.Route, kialiRouter)
	router.Mount(istio.Route, istioRouter)
	router.Mount(flux.Route, fluxRouter)
	router.Mount(opsgenie.Route, opsgenieRouter)
	router.Mount(sql.Route, sqlRouter)
	router.Mount(markdown.Route, markdownRouter)
	router.Mount(rss.Route, rssRouter)

	return router
}
