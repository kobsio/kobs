package azure

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"

	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/compute/armcompute"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

func (router *Router) getVirtualMachineScaleSets(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroups := r.URL.Query()["resourceGroup"]

	log.WithFields(logrus.Fields{"name": name, "resourceGroups": resourceGroups}).Tracef("getVirtualMachineScaleSets")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var virtualMachineScaleSets []*armcompute.VirtualMachineScaleSet

	for _, resourceGroup := range resourceGroups {
		err := i.CheckPermissions(r, "virtualmachinescalesets", resourceGroup)
		if err == nil {
			vsss, err := i.VirtualMachineScaleSets.ListVirtualMachineScaleSets(r.Context(), resourceGroup)
			if err != nil {
				errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not list virtual machine scale sets")
				return
			}

			virtualMachineScaleSets = append(virtualMachineScaleSets, vsss...)
		}
	}

	render.JSON(w, r, virtualMachineScaleSets)
}

func (router *Router) getVirtualMachineScaleSetDetails(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	virtualMachineScaleSet := r.URL.Query().Get("virtualMachineScaleSet")

	log.WithFields(logrus.Fields{"name": name, "resourceGroup": resourceGroup, "virtualMachineScaleSet": virtualMachineScaleSet}).Tracef("getVirtualMachineScaleSetDetails")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "virtualmachinescalesets", resourceGroup)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the virtual machine scale set")
		return
	}

	vmss, err := i.VirtualMachineScaleSets.GetVirtualMachineScaleSet(r.Context(), resourceGroup, virtualMachineScaleSet)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get virtual machine scale set")
		return
	}

	render.JSON(w, r, vmss)
}

func (router *Router) getVirtualMachines(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	virtualMachineScaleSet := r.URL.Query().Get("virtualMachineScaleSet")

	log.WithFields(logrus.Fields{"name": name, "resourceGroup": resourceGroup, "virtualMachineScaleSet": virtualMachineScaleSet}).Tracef("getVirtualMachines")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "virtualmachinescalesets", resourceGroup)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to list the virtual machines")
		return
	}

	vms, err := i.VirtualMachineScaleSets.ListVirtualMachines(r.Context(), resourceGroup, virtualMachineScaleSet)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get virtual machines")
		return
	}

	render.JSON(w, r, vms)
}
