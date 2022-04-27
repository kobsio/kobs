package main

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

func Mount(instances []plugin.Instance, clustersClient clusters.Client) chi.Router {
	router := chi.NewRouter()
	router.Get("/clusters", func(w http.ResponseWriter, r *http.Request) {
		var clusters []string
		for _, c := range clustersClient.GetClusters() {
			clusters = append(clusters, c.GetName())
		}

		render.JSON(w, r, clusters)
	})

	router.Get("/instances", func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, r, instances)
	})

	return router
}
