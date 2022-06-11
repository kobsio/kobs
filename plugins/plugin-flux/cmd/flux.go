package main

import (
	"fmt"
	"net/http"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-flux/pkg/sync"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Router implements the router for the Helm plugin, which can be registered in the router for our rest api. It contains
// the api routes for the Helm plugin and it's configuration.
type Router struct {
	*chi.Mux
	clustersClient clusters.Client
}

// appendIfMissing appends a value to a slice, when this values doesn't exist in the slice already.
func appendIfMissing(items []string, item string) []string {
	for _, ele := range items {
		if ele == item {
			return items
		}
	}

	return append(items, item)
}

func (router *Router) getClusters(w http.ResponseWriter, r *http.Request) {
	clusters := router.clustersClient.GetClusters()

	var clusterNames []string
	for _, cluster := range clusters {
		clusterNames = append(clusterNames, cluster.GetName())
	}

	render.JSON(w, r, clusterNames)
}

func (router *Router) getNamespaces(w http.ResponseWriter, r *http.Request) {
	var namespaces []string
	clusterNames := r.URL.Query()["cluster"]

	for _, clusterName := range clusterNames {
		tmpNamespaces, err := router.clustersClient.GetCluster(clusterName).GetNamespaces(r.Context())
		if err != nil {
			log.Error(r.Context(), "Could not get namespaces", zap.Error(err), zap.String("cluster", clusterName))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get namespaces")
			return
		}

		for _, namespace := range tmpNamespaces {
			namespaces = appendIfMissing(namespaces, namespace)
		}
	}

	render.JSON(w, r, namespaces)
}

func (router *Router) sync(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")

	log.Debug(r.Context(), "Sync resource", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name), zap.String("resource", resource))

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	if resource == "kustomizations" {
		err := sync.Kustomization(r.Context(), cluster, namespace, name)
		if err != nil {
			log.Error(r.Context(), "Could not sync Kustomization", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not sync Kustomization")
			return
		}

		render.JSON(w, r, nil)
		return
	}

	if resource == "helmreleases" {
		err := sync.HelmRelease(r.Context(), cluster, namespace, name)
		if err != nil {
			log.Error(r.Context(), "Could not sync HelmRelease", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not sync HelmRelease")
			return
		}

		render.JSON(w, r, nil)
		return
	}

	log.Error(r.Context(), "invalid resource")
	errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid resource")
	return
}

// Mount mounts the Helm plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	if len(instances) != 1 {
		return nil, fmt.Errorf("invalid number of instances")
	}

	router := Router{
		chi.NewRouter(),
		clustersClient,
	}

	router.Get("/clusters", router.getClusters)
	router.Get("/namespaces", router.getNamespaces)
	router.Get("/sync", router.sync)

	return router, nil
}
