package resources

import (
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters"

	"github.com/go-chi/chi/v5"
)

type Config struct {
	Forbidden []userv1.Resources `json:"forbidden"`
}

type Router struct {
	*chi.Mux
	config         Config
	clustersClient clusters.Client
}

func Mount(config Config, clustersClient clusters.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
		clustersClient,
	}

	router.Get("/", router.getResources)
	router.Delete("/", router.deleteResource)
	router.Put("/", router.patchResource)
	router.Post("/", router.createResource)
	router.Get("/logs", router.getLogs)
	router.HandleFunc("/terminal", router.getTerminal)
	router.Get("/file", router.getFile)
	router.Post("/file", router.postFile)

	return router
}
