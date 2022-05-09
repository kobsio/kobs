package clusters

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

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
