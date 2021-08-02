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
	"github.com/kobsio/kobs/plugins/dashboards"
	"github.com/kobsio/kobs/plugins/elasticsearch"
	"github.com/kobsio/kobs/plugins/jaeger"
	"github.com/kobsio/kobs/plugins/kiali"
	"github.com/kobsio/kobs/plugins/markdown"
	"github.com/kobsio/kobs/plugins/opsgenie"
	"github.com/kobsio/kobs/plugins/prometheus"
	"github.com/kobsio/kobs/plugins/resources"
	"github.com/kobsio/kobs/plugins/rss"
	"github.com/kobsio/kobs/plugins/teams"
)

// Config holds the configuration for all plugins. We have to add the configuration for all the imported plugins.
type Config struct {
	Applications  applications.Config  `json:"applications"`
	Resources     resources.Config     `json:"resources"`
	Teams         teams.Config         `json:"teams"`
	Dashboards    dashboards.Config    `json:"dashboards"`
	Prometheus    prometheus.Config    `json:"prometheus"`
	Elasticsearch elasticsearch.Config `json:"elasticsearch"`
	Jaeger        jaeger.Config        `json:"jaeger"`
	Markdown      markdown.Config      `json:"markdown"`
	Kiali         kiali.Config         `json:"kiali"`
	Opsgenie      opsgenie.Config      `json:"opsgenie"`
	RSS           rss.Config           `json:"rss"`
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

	// Register all plugins
	router.Mount(applications.Route, applications.Register(clusters, router.plugins, config.Applications))
	router.Mount(resources.Route, resources.Register(clusters, router.plugins, config.Resources))
	router.Mount(teams.Route, teams.Register(clusters, router.plugins, config.Teams))
	router.Mount(dashboards.Route, dashboards.Register(clusters, router.plugins, config.Dashboards))
	router.Mount(prometheus.Route, prometheus.Register(clusters, router.plugins, config.Prometheus))
	router.Mount(elasticsearch.Route, elasticsearch.Register(clusters, router.plugins, config.Elasticsearch))
	router.Mount(jaeger.Route, jaeger.Register(clusters, router.plugins, config.Jaeger))
	router.Mount(markdown.Route, markdown.Register(clusters, router.plugins, config.Markdown))
	router.Mount(kiali.Route, kiali.Register(clusters, router.plugins, config.Kiali))
	router.Mount(opsgenie.Route, opsgenie.Register(clusters, router.plugins, config.Opsgenie))
	router.Mount(rss.Route, rss.Register(clusters, router.plugins, config.RSS))

	return router
}
