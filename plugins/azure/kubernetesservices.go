package azure

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"

	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/containerservice/armcontainerservice"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

func (router *Router) getManagedClusters(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroups := r.URL.Query()["resourceGroup"]

	log.WithFields(logrus.Fields{"name": name, "resourceGroups": resourceGroups}).Tracef("getManagedClusters")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var managedClusters []*armcontainerservice.ManagedCluster

	for _, resourceGroup := range resourceGroups {
		err := i.CheckPermissions(r, "kubernetesservices", resourceGroup)
		if err == nil {
			clusters, err := i.KubernetesServices.ListManagedClusters(r.Context(), resourceGroup)
			if err != nil {
				errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not list managed clusters")
				return
			}

			managedClusters = append(managedClusters, clusters...)
		}
	}

	render.JSON(w, r, managedClusters)
}

func (router *Router) getManagedCluster(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	managedCluster := r.URL.Query().Get("managedCluster")

	log.WithFields(logrus.Fields{"name": name, "resourceGroup": resourceGroup, "managedCluster": managedCluster}).Tracef("getManagedCluster")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "kubernetesservices", resourceGroup)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the managed clusters")
		return
	}

	ks, err := i.KubernetesServices.GetManagedCluster(r.Context(), resourceGroup, managedCluster)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get managed clusters")
		return
	}

	render.JSON(w, r, ks)
}

func (router *Router) getNodePools(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	managedCluster := r.URL.Query().Get("managedCluster")

	log.WithFields(logrus.Fields{"name": name, "resourceGroup": resourceGroup, "managedCluster": managedCluster}).Tracef("getNodePools")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "kubernetesservices", resourceGroup)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the node pools of the managed cluster")
		return
	}

	nodePools, err := i.KubernetesServices.ListNodePools(r.Context(), resourceGroup, managedCluster)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get node pools")
		return
	}

	render.JSON(w, r, nodePools)
}
