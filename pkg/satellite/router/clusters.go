package router

import (
	"net/http"

	"github.com/go-chi/render"
)

func (router *Router) getClusters(w http.ResponseWriter, r *http.Request) {
	var clusters []string
	for _, c := range router.clustersClient.GetClusters() {
		clusters = append(clusters, c.GetName())
	}

	render.JSON(w, r, clusters)
}
