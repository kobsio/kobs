package clusters

import (
	"fmt"
	"net/http"

	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/kobsio/kobs/pkg/hub/store/shared"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	storeClient store.Client
}

func (router *Router) getClusters(w http.ResponseWriter, r *http.Request) {
	clusters, err := router.storeClient.GetClusters(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not get clusters", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get clusters")
		return
	}

	var groupedClusters map[string][]shared.Cluster
	groupedClusters = make(map[string][]shared.Cluster)

	for _, cluster := range clusters {
		if _, ok := groupedClusters[cluster.Satellite]; ok {
			groupedClusters[cluster.Satellite] = append(groupedClusters[cluster.Satellite], cluster)
		} else {
			groupedClusters[cluster.Satellite] = []shared.Cluster{cluster}
		}
	}

	render.JSON(w, r, groupedClusters)
}

func (router *Router) getNamespaces(w http.ResponseWriter, r *http.Request) {
	clusterIDs := r.URL.Query()["clusterID"]

	namespaces, err := router.storeClient.GetNamespacesByClusterIDs(r.Context(), clusterIDs)
	if err != nil {
		log.Error(r.Context(), "Could not get namespaces", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get namespaces")
		return
	}

	var groupedNamespaces map[string][]shared.Namespace
	groupedNamespaces = make(map[string][]shared.Namespace)

	for _, namespace := range namespaces {
		key := fmt.Sprintf("%s (%s)", namespace.Cluster, namespace.Satellite)

		if _, ok := groupedNamespaces[key]; ok {
			groupedNamespaces[key] = append(groupedNamespaces[key], namespace)
		} else {
			groupedNamespaces[key] = []shared.Namespace{namespace}
		}
	}

	render.JSON(w, r, groupedNamespaces)
}

func (router *Router) getResources(w http.ResponseWriter, r *http.Request) {
	crds, err := router.storeClient.GetCRDs(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not get Custom Resource Definitions", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get Custom Resource Definitions")
		return
	}

	render.JSON(w, r, shared.GetResources(crds))
}

func Mount(storeClient store.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		storeClient,
	}

	router.Get("/", router.getClusters)
	router.Get("/namespaces", router.getNamespaces)
	router.Get("/resources", router.getResources)

	return router
}
