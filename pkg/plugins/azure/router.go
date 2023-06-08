package azure

import (
	"encoding/json"
	"net/http"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/azure/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type getVariableRequest struct {
	Type                   string `json:"type"`
	ResourceGroup          string `json:"resourceGroup"`
	VirtualMachineScaleSet string `json:"virtualMachineScaleSet"`
}

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

func (router *Router) getVariable(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "getVariable", zap.String("name", name), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	var data getVariableRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	if data.Type == "Resource Groups" {
		values, err := i.ResourceGroupsClient().ListResourceGroups(r.Context())
		if err != nil {
			log.Error(r.Context(), "Failed to get resource groups", zap.Error(err))
			render.JSON(w, r, []string{})
			return
		}

		log.Debug(r.Context(), "getVariable", zap.Int("valuesCount", len(values)))
		render.JSON(w, r, values)
		return
	}

	if data.Type == "Kubernetes Services" {
		values, err := i.KubernetesServicesClient().ListManagedClusters(r.Context(), data.ResourceGroup)
		if err != nil {
			log.Error(r.Context(), "Failed to get managed clusters", zap.Error(err))
			render.JSON(w, r, []string{})
			return
		}

		log.Debug(r.Context(), "getVariable", zap.Int("valuesCount", len(values)))
		render.JSON(w, r, values)
		return
	}

	if data.Type == "Virtual Machine Scale Sets" {
		values, err := i.VirtualMachineScaleSetsClient().ListVirtualMachineScaleSets(r.Context(), data.ResourceGroup)
		if err != nil {
			log.Error(r.Context(), "Failed to get virtual machine scale sets", zap.Error(err))
			render.JSON(w, r, []string{})
			return
		}

		log.Debug(r.Context(), "getVariable", zap.Int("valuesCount", len(values)))
		render.JSON(w, r, values)
		return
	}

	if data.Type == "Virtual Machine Scale Sets - Virtual Machines" {
		values, err := i.VirtualMachineScaleSetsClient().ListVirtualMachines(r.Context(), data.ResourceGroup, data.VirtualMachineScaleSet)
		if err != nil {
			log.Error(r.Context(), "Failed to get virtual machines for virtual machine scale sets", zap.Error(err))
			render.JSON(w, r, []string{})
			return
		}

		log.Debug(r.Context(), "getVariable", zap.Int("valuesCount", len(values)))
		render.JSON(w, r, values)
		return
	}

	log.Error(r.Context(), "Invalid request type", zap.Error(err))
	errresponse.Render(w, r, http.StatusBadRequest, "Invalid request type")
}

func Mount(instances []plugin.Instance) (chi.Router, error) {
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

	router.Post("/variable", router.getVariable)
	router.Route("/costmanagement", func(costManagementRouter chi.Router) {
		costManagementRouter.Get("/actualcosts", router.getActualCosts)
	})
	router.Route("/monitor", func(monitorRouter chi.Router) {
		monitorRouter.Get("/metrics", router.getMetrics)
		monitorRouter.Get("/metricdefinitions", router.getMetricDefinitions)
	})

	return router, nil
}
