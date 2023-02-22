package clusters

import (
	"net/http"
	"sort"

	"github.com/kobsio/kobs/pkg/hub/api/shared"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Config struct{}

type Router struct {
	*chi.Mux
	dbClient      db.Client
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

	namespaces, err := router.dbClient.GetNamespacesByClusters(r.Context(), clusterIDs)
	if err != nil {
		log.Error(r.Context(), "Failed to get namespaces", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get namespaces")
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
	crds, err := router.dbClient.GetCRDs(r.Context())
	if err != nil {
		log.Error(r.Context(), "Failed to get resources", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get resources")
		return
	}

	render.JSON(w, r, shared.GetResources(crds))
}

func Mount(config Config, dbClient db.Client, clusterClient clusters.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		dbClient,
		clusterClient,
	}

	router.Get("/", router.getClusters)
	router.Get("/namespaces", router.getNamespaces)
	router.Get("/resources", router.getResources)

	return router
}
