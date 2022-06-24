package azure

import (
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance"

	"github.com/go-chi/chi/v5"
)

// PluginType is the type which must be used for the Azure plugin.
const PluginType = "azure"

// Router implements the router for the Azure plugin, which can be registered in the router for our rest api. It contains
// the api routes for the Azure plugin and it's configuration.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Azure instance by it's name. If we couldn't found an instance with the provided name and the
// provided name is "default" we return the first instance from the list. The first instance in the list is also the
// first one configured by the user and can be used as default one.
func (router *Router) getInstance(name string) instance.Instance {
	for _, i := range router.instances {
		if i.GetName() == name {
			return i
		}
	}

	if name == "default" && len(router.instances) > 0 {
		return router.instances[0]
	}

	return nil
}

// Mount mounts the Azure plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var azureInstances []instance.Instance

	for _, i := range instances {
		azureInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		azureInstances = append(azureInstances, azureInstance)
	}

	router := Router{
		chi.NewRouter(),
		azureInstances,
	}

	router.Get("/resourcegroups", router.getResourceGroups)

	router.Route("/containerinstances", func(containerInstancesRouter chi.Router) {
		containerInstancesRouter.Get("/containergroups", router.getContainerGroups)
		containerInstancesRouter.Get("/containergroup/details", router.getContainerGroup)
		containerInstancesRouter.Get("/containergroup/logs", router.getContainerLogs)
		containerInstancesRouter.Put("/containergroup/restart", router.restartContainerGroup)
	})

	router.Route("/costmanagement", func(costManagementRouter chi.Router) {
		costManagementRouter.Get("/actualcosts", router.getActualCosts)
	})

	router.Route("/kubernetesservices", func(kubernetesServicesRouter chi.Router) {
		kubernetesServicesRouter.Get("/managedclusters", router.getManagedClusters)
		kubernetesServicesRouter.Get("/managedcluster/details", router.getManagedCluster)
		kubernetesServicesRouter.Get("/managedcluster/nodepools", router.getNodePools)
	})

	router.Route("/virtualmachinescalesets", func(virtualMachineScaleSetsRouter chi.Router) {
		virtualMachineScaleSetsRouter.Get("/virtualmachinescalesets", router.getVirtualMachineScaleSets)
		virtualMachineScaleSetsRouter.Get("/virtualmachinescaleset/details", router.getVirtualMachineScaleSetDetails)
		virtualMachineScaleSetsRouter.Get("/virtualmachines", router.getVirtualMachines)
	})

	router.Route("/monitor", func(monitorRouter chi.Router) {
		monitorRouter.Get("/metrics", router.getMetrics)
	})

	return router, nil
}
