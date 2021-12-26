package markdown

import (
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/markdown"

// Config is the structure of the configuration for the markdown plugin.
type Config struct{}

// Router implements the router for the markdown plugin, which can be registered in the router for our rest api. It
// contains the api routes for the markdown plugin and it's configuration.
type Router struct {
	*chi.Mux
	config Config
}

// Register returns a new router which can be used in the router for the kobs rest api. The markdown plugin has always
// the same configuration and no api routes.
func Register(plugins *plugin.Plugins, config Config) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "markdown",
		DisplayName: "Markdown",
		Description: "Render static text using Markdown.",
		Type:        "markdown",
	})

	router := Router{
		chi.NewRouter(),
		config,
	}

	return router
}
