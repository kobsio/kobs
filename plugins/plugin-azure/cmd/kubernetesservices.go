package main

import (
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/containerservice/armcontainerservice"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func (router *Router) getManagedClusters(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	resourceGroups := r.URL.Query()["resourceGroup"]

	log.Debug(r.Context(), "Get managed clusters parameters", zap.String("name", name), zap.Strings("resourceGroups", resourceGroups))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to list managed clusters", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to list managed clusters")
		return
	}

	var managedClusters []*armcontainerservice.ManagedCluster

	for _, resourceGroup := range resourceGroups {
		err := i.CheckPermissions(name, user, "kubernetesservices", resourceGroup, r.Method)
		if err == nil {
			clusters, err := i.KubernetesServicesClient().ListManagedClusters(r.Context(), resourceGroup)
			if err != nil {
				log.Error(r.Context(), "Could not list managed clusters", zap.Error(err))
				errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not list managed clusters")
				return
			}

			managedClusters = append(managedClusters, clusters...)
		} else {
			log.Warn(r.Context(), "User is not authorized to get managed clusters", zap.String("resourceGroup", resourceGroup), zap.String("name", name), zap.String("user", user.Email), zap.String("method", r.Method), zap.Error(err))
		}
	}

	render.JSON(w, r, managedClusters)
}

func (router *Router) getManagedCluster(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	managedCluster := r.URL.Query().Get("managedCluster")

	log.Debug(r.Context(), "Get managed cluster parameters", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("managedCluster", managedCluster))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get managed cluster", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get managed cluster")
		return
	}

	err = i.CheckPermissions(name, user, "kubernetesservices", resourceGroup, r.Method)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the managed cluster", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the managed cluster")
		return
	}

	ks, err := i.KubernetesServicesClient().GetManagedCluster(r.Context(), resourceGroup, managedCluster)
	if err != nil {
		log.Error(r.Context(), "Could not get managed cluster", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get managed cluster")
		return
	}

	render.JSON(w, r, ks)
}

func (router *Router) getNodePools(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	managedCluster := r.URL.Query().Get("managedCluster")

	log.Debug(r.Context(), "Get node pools parameters", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("managedCluster", managedCluster))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get node pools", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get node pools")
		return
	}

	err = i.CheckPermissions(name, user, "kubernetesservices", resourceGroup, r.Method)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the node pools", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the node pools of the managed cluster")
		return
	}

	nodePools, err := i.KubernetesServicesClient().ListNodePools(r.Context(), resourceGroup, managedCluster)
	if err != nil {
		log.Warn(r.Context(), "Could not get node pools", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get node pools")
		return
	}

	render.JSON(w, r, nodePools)
}
