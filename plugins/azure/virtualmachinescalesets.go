package azure

import (
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/log"

	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/compute/armcompute"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func (router *Router) getVirtualMachineScaleSets(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroups := r.URL.Query()["resourceGroup"]

	log.Debug(r.Context(), "Get virtual machine scale sets parameters", zap.String("name", name), zap.Strings("resourceGroups", resourceGroups))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to list virtual machine scale sets", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to list virtual machine scale sets")
		return
	}

	var virtualMachineScaleSets []*armcompute.VirtualMachineScaleSet

	for _, resourceGroup := range resourceGroups {
		err := i.CheckPermissions(name, user, "virtualmachinescalesets", resourceGroup, r.Method)
		if err == nil {
			vsss, err := i.VirtualMachineScaleSetsClient().ListVirtualMachineScaleSets(r.Context(), resourceGroup)
			if err != nil {
				log.Error(r.Context(), "Could not list virtual machine scale sets", zap.Error(err))
				errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not list virtual machine scale sets")
				return
			}

			virtualMachineScaleSets = append(virtualMachineScaleSets, vsss...)
		} else {
			log.Warn(r.Context(), "User is not authorized to get virtual machine scale sets", zap.String("resourceGroup", resourceGroup), zap.String("name", name), zap.String("user", user.ID), zap.String("method", r.Method), zap.Error(err))
		}
	}

	render.JSON(w, r, virtualMachineScaleSets)
}

func (router *Router) getVirtualMachineScaleSetDetails(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	virtualMachineScaleSet := r.URL.Query().Get("virtualMachineScaleSet")

	log.Debug(r.Context(), "Get virtual machine scale set details parameters", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("virtualMachineScaleSet", virtualMachineScaleSet))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get virtual machine scale set", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get virtual machine scale set")
		return
	}

	err = i.CheckPermissions(name, user, "virtualmachinescalesets", resourceGroup, r.Method)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the virtual machine scale set", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the virtual machine scale set")
		return
	}

	vmss, err := i.VirtualMachineScaleSetsClient().GetVirtualMachineScaleSet(r.Context(), resourceGroup, virtualMachineScaleSet)
	if err != nil {
		log.Error(r.Context(), "Could not get virtual machine scale set", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get virtual machine scale set")
		return
	}

	render.JSON(w, r, vmss)
}

func (router *Router) getVirtualMachines(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	virtualMachineScaleSet := r.URL.Query().Get("virtualMachineScaleSet")

	log.Debug(r.Context(), "Get virtual machines parameters", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("virtualMachineScaleSet", virtualMachineScaleSet))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to list virtual machines", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to list virtual machines")
		return
	}

	err = i.CheckPermissions(name, user, "virtualmachinescalesets", resourceGroup, r.Method)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the virtual machines", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to list the virtual machines")
		return
	}

	vms, err := i.VirtualMachineScaleSetsClient().ListVirtualMachines(r.Context(), resourceGroup, virtualMachineScaleSet)
	if err != nil {
		log.Error(r.Context(), "Could not get virtual machines", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get virtual machines")
		return
	}

	render.JSON(w, r, vms)
}
