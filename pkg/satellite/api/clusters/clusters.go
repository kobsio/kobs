package clusters

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Config struct{}

type Router struct {
	*chi.Mux
	config         Config
	clustersClient clusters.Client
}

func (router *Router) getClusters(w http.ResponseWriter, r *http.Request) {
	var clusters []string
	for _, c := range router.clustersClient.GetClusters() {
		clusters = append(clusters, c.GetName())
	}

	render.JSON(w, r, clusters)
}

func (router *Router) getNamespaces(w http.ResponseWriter, r *http.Request) {
	var namespaces map[string][]string
	namespaces = make(map[string][]string)

	for _, c := range router.clustersClient.GetClusters() {
		clusterNamespaces, err := c.GetNamespaces(r.Context())
		if err != nil {
			log.Error(r.Context(), "Could not get namespaces", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get namespaces")
			return
		}

		namespaces[c.GetName()] = clusterNamespaces
	}

	render.JSON(w, r, namespaces)
}

func Mount(config Config, clustersClient clusters.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
		clustersClient,
	}

	router.Get("/", router.getClusters)
	router.Get("/namespaces", router.getNamespaces)

	return router
}
