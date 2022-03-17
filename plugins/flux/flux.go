package flux

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/flux/pkg/sync"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/flux"

// Config is the structure of the configuration for the Flux plugin.
type Config struct {
	Home bool `json:"home"`
}

// Router implements the router for the flux plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clustersClient clusters.Client
	config         Config
}

func (router *Router) sync(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")

	log.Debug(r.Context(), "Sync resource", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name), zap.String("resource", resource))

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	if resource == "kustomizations" {
		err := sync.Kustomization(r.Context(), cluster, namespace, name)
		if err != nil {
			log.Error(r.Context(), "Could not sync Kustomization", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not sync Kustomization")
			return
		}

		render.JSON(w, r, nil)
		return
	}

	if resource == "helmreleases" {
		err := sync.HelmRelease(r.Context(), cluster, namespace, name)
		if err != nil {
			log.Error(r.Context(), "Could not sync HelmRelease", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not sync HelmRelease")
			return
		}

		render.JSON(w, r, nil)
		return
	}

	log.Error(r.Context(), "invalid resource")
	errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid resource")
	return
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clustersClient clusters.Client, plugins *plugin.Plugins, config Config) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "flux",
		DisplayName: "Flux",
		Description: "Flux is a set of continuous and progressive delivery solutions for Kubernetes.",
		Home:        config.Home,
		Type:        "flux",
	})

	router := Router{
		chi.NewRouter(),
		clustersClient,
		config,
	}

	router.Get("/sync", router.sync)

	return router
}
