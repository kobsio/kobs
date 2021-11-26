package azure

import (
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const (
	Route = "/azure"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "azure"})
)

// Config is the structure of the configuration for the Azure plugin.
type Config []instance.Config

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clusters  *clusters.Clusters
	instances []*instance.Instance
}

func (router *Router) getInstance(name string) *instance.Instance {
	for _, i := range router.instances {
		if i.Name == name {
			return i
		}
	}

	return nil
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"name": cfg.Name}).Fatalf("Could not create Azure instance")
		}

		instances = append(instances, instance)

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "azure",
		})
	}

	router := Router{
		chi.NewRouter(),
		clusters,
		instances,
	}

	router.Route("/containerinstances", func(r chi.Router) {
		r.Get("/containergroups/{name}", router.getContainerGroups)
		r.Get("/containergroup/details/{name}", router.getContainerGroup)
		r.Get("/containergroup/metrics/{name}", router.getContainerMetrics)
		r.Get("/containergroup/logs/{name}", router.getContainerLogs)
		r.Get("/containergroup/restart/{name}", router.restartContainerGroup)
	})

	return router
}
