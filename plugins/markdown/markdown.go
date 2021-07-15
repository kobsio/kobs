package markdown

import (
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/markdown"

var (
	log = logrus.WithFields(logrus.Fields{"package": "markdown"})
)

// Config is the structure of the configuration for the markdown plugin.
type Config struct{}

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clusters *clusters.Clusters
	config   Config
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "markdown",
		DisplayName: "Markdown",
		Description: "Render static text using Markdown.",
		Type:        "markdown",
	})

	router := Router{
		chi.NewRouter(),
		clusters,
		config,
	}

	return router
}
