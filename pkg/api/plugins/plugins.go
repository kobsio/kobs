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
	"github.com/kobsio/kobs/plugins/prometheus"
	"github.com/kobsio/kobs/plugins/resources"
	"github.com/kobsio/kobs/plugins/teams"
)

// Config holds the configuration for all plugins. We have to add the configuration for all the imported plugins.
type Config struct {
	Applications  applications.Config  `yaml:"applications"`
	Resources     resources.Config     `yaml:"resources"`
	Teams         teams.Config         `yaml:"teams"`
	Dashboards    dashboards.Config    `yaml:"dashboards"`
	Prometheus    prometheus.Config    `yaml:"prometheus"`
	Elasticsearch elasticsearch.Config `yaml:"elasticsearch"`
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

	return router
}
