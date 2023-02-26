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

type Router struct {
	*chi.Mux
	dbClient      db.Client
	clusterClient clusters.Client
}

// getClusters returns a list of clusters. The list of clusters is retrieved from the `clustersClient`.
func (router *Router) getClusters(w http.ResponseWriter, r *http.Request) {
	clients := router.clusterClient.GetClusters()

	clusters := []string{}
	for _, client := range clients {
		clusters = append(clusters, client.GetName())
	}

	render.JSON(w, r, clusters)
}

// getNamespaces returns a list of namespaces for the provided clusters. For that we have to get the namespaces for all
// clusters from the database. If not cluster is provided we return all namespaces from the database. To not show a
// namespace twice in the frontend we create a unique list of namespaces, where each namespace occurs exactly one time.
func (router *Router) getNamespaces(w http.ResponseWriter, r *http.Request) {
	clusters := r.URL.Query()["cluster"]

	namespaces, err := router.dbClient.GetNamespacesByClusters(r.Context(), clusters)
	if err != nil {
		log.Error(r.Context(), "Failed to get namespaces", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get namespaces")
		return
	}

	uniqueNamespaces := []string{}

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

func Mount(dbClient db.Client, clusterClient clusters.Client) chi.Router {
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
