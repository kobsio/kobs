package plugins

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"

	// Import all plugins, which should be used with the kobs instance. By default this are all first party plugins from
	// the plugins folder.
	"github.com/kobsio/kobs/plugins/resources"
)

// Config holds the configuration for all plugins. We have to add the configuration for all the imported plugins.
type Config struct {
	Resources resources.Config `yaml:"resources"`
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
	router.Mount(resources.Route, resources.Register(clusters, router.plugins, config.Resources))

	return router
}
