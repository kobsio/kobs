package router

import (
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters"

	"github.com/go-chi/chi/v5"
)

// Config is the structure of the configuration for the clusters router.
type Config struct {
	Forbidden []userv1.Resources `json:"forbidden"`
}

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	config         Config
	clustersClient clusters.Client
}

// NewRouter returns a chi.Router which can be used to interact with the loaded Kubernetes clusters. It contains the
// routes to interact with the Kubernetes resources and our CRDs like applications, teams, etc.
func NewRouter(config Config, clustersClient clusters.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
		clustersClient,
	}

	router.Route("/clusters", func(r chi.Router) {
		r.Get("/", router.getClusters)

		r.Route("/resources", func(r chi.Router) {
			router.Get("/", router.getResources)
			router.Delete("/", router.deleteResource)
			router.Put("/", router.patchResource)
			router.Post("/", router.createResource)
			router.Get("/logs", router.getLogs)
			router.HandleFunc("/terminal", router.getTerminal)
			router.Get("/file", router.getFile)
			router.Post("/file", router.postFile)
		})
	})

	return router
}
