package clusters

import (
	"fmt"
	"net/http"
	"sort"

	"github.com/kobsio/kobs/pkg/hub/api/shared"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/hub/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Config struct{}

type Router struct {
	*chi.Mux
	storeClient   db.Client
	clusterClient clusters.Client
}

func (router *Router) getClusters(w http.ResponseWriter, r *http.Request) {
	clients := router.clusterClient.GetClusters()
	result := struct {
		Clusters []string `json:"clusters"`
	}{
		Clusters: make([]string, len(clients)),
	}
	for i, client := range clients {
		result.Clusters[i] = client.GetName()
	}

	render.JSON(w, r, result)
}

func (router *Router) getNamespaces(w http.ResponseWriter, r *http.Request) {
	clusterIDs := r.URL.Query()["clusterID"]

	namespaces, err := router.storeClient.GetNamespacesByClusters(r.Context(), clusterIDs)
	if err != nil {
		log.Error(r.Context(), "Could not get namespaces", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("could not get namespaces"))
		return
	}

	var uniqueNamespaces []string

	for _, namespace := range namespaces {
		uniqueNamespaces = utils.AppendIfStringIsMissing(uniqueNamespaces, namespace.Namespace)
	}

	sort.Strings(uniqueNamespaces)
	render.JSON(w, r, uniqueNamespaces)
}

func (router *Router) getResources(w http.ResponseWriter, r *http.Request) {
	crds, err := router.storeClient.GetCRDs(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not get Custom Resource Definitions", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("could not get Custom Resource Definitions"))
		return
	}

	render.JSON(w, r, shared.GetResources(crds))
}

func Mount(config Config, storeClient db.Client, clusterClient clusters.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		storeClient,
		clusterClient,
	}

	router.Get("/", router.getClusters)
	router.Get("/namespaces", router.getNamespaces)
	router.Get("/resources", router.getResources)

	return router
}
