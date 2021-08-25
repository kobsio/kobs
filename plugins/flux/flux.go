package flux

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/flux/pkg/sync"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/flux"

var (
	log = logrus.WithFields(logrus.Fields{"package": "flux"})
)

// Config is the structure of the configuration for the Flux plugin.
type Config struct{}

// Router implements the router for the flux plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clusters *clusters.Clusters
	config   Config
}

func (router *Router) sync(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")

	log.WithFields(logrus.Fields{"cluster": clusterName, "namespace": namespace, "name": name, "resource": resource}).Tracef("sync")

	cluster := router.clusters.GetCluster(clusterName)
	if cluster == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	if resource == "kustomizations" {
		err := sync.Kustomization(r.Context(), cluster, namespace, name)
		if err != nil {
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not sync Kustomization")
			return
		}

		render.JSON(w, r, nil)
		return
	}

	if resource == "helmreleases" {
		err := sync.HelmRelease(r.Context(), cluster, namespace, name)
		if err != nil {
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not sync HelmRelease")
			return
		}

		render.JSON(w, r, nil)
		return
	}

	errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid resource")
	return
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "flux",
		DisplayName: "Flux",
		Description: "Flux is a set of continuous and progressive delivery solutions for Kubernetes.",
		Type:        "flux",
	})

	router := Router{
		chi.NewRouter(),
		clusters,
		config,
	}

	router.Get("/sync", router.sync)

	return router
}
