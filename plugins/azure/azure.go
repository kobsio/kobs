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
		inst, err := instance.New(cfg)
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"name": cfg.Name}).Fatalf("Could not create Azure inst")
		}

		instances = append(instances, inst)

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

	router.Route("/{name}", func(r chi.Router) {
		r.Get("/resourcegroups", router.getResourceGroups)

		r.Route("/containerinstances", func(containerInstancesRouter chi.Router) {
			containerInstancesRouter.Get("/containergroups", router.getContainerGroups)
			containerInstancesRouter.Get("/containergroup/details", router.getContainerGroup)
			containerInstancesRouter.Get("/containergroup/logs", router.getContainerLogs)
			containerInstancesRouter.Put("/containergroup/restart", router.restartContainerGroup)
		})

		r.Route("/costmanagement", func(costManagementRouter chi.Router) {
			costManagementRouter.Get("/actualCost", router.getActualCost)
		})

		r.Route("/kubernetesservices", func(kubernetesServicesRouter chi.Router) {
			kubernetesServicesRouter.Get("/managedclusters", router.getManagedClusters)
			kubernetesServicesRouter.Get("/managedcluster/details", router.getManagedCluster)
			kubernetesServicesRouter.Get("/managedcluster/nodepools", router.getNodePools)
		})

		r.Route("/monitor", func(monitorRouter chi.Router) {
			monitorRouter.Get("/metrics", router.getMetrics)
		})
	})

	return router
}
