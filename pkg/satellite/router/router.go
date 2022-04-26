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

	router.Get("/clusters", router.getClusters)

	router.Get("/resources", router.getResources)
	router.Delete("/resources", router.deleteResource)
	router.Put("/resources", router.patchResource)
	router.Post("/resources", router.createResource)
	router.Get("/resources/logs", router.getLogs)
	router.HandleFunc("/resources/terminal", router.getTerminal)
	router.Get("/resources/file", router.getFile)
	router.Post("/resources/file", router.postFile)

	router.Get("/applications", router.getApplications)
	router.Get("/application", router.getApplication)

	router.Get("/dashboards", router.getAllDashboards)
	router.Post("/dashboards", router.getDashboards)
	router.Post("/dashboard", router.getDashboard)

	return router
}
