package clusters

import (
	"github.com/kobsio/kobs/pkg/kube/clusters"

	"github.com/go-chi/chi/v5"
)

type Config struct{}

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

	router.Get("/", router.getClusters)
	router.Get("/namespaces", router.getNamespaces)

	return router
}
