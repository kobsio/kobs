package flux

import (
	"fmt"
	"net/http"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/flux/sync"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	kubernetesClient kubernetes.Client
}

func (router *Router) sync(w http.ResponseWriter, r *http.Request) {
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")

	log.Debug(r.Context(), "Sync resource", zap.String("namespace", namespace), zap.String("name", name), zap.String("resource", resource))

	if resource == "kustomizations" {
		err := sync.Kustomization(r.Context(), router.kubernetesClient, namespace, name)
		if err != nil {
			log.Error(r.Context(), "Failed to sync Kustomization", zap.Error(err))
			errresponse.Render(w, r, http.StatusBadRequest, "Failed to sync Kustomization")
			return
		}

		render.JSON(w, r, nil)
		return
	}

	if resource == "helmreleases" {
		err := sync.HelmRelease(r.Context(), router.kubernetesClient, namespace, name)
		if err != nil {
			log.Error(r.Context(), "Failed to sync HelmRelease", zap.Error(err))
			errresponse.Render(w, r, http.StatusBadRequest, "Failed to sync HelmRelease")
			return
		}

		render.JSON(w, r, nil)
		return
	}

	errresponse.Render(w, r, http.StatusBadRequest, fmt.Sprintf("The sync operation is not supported for the provided resource: '%s'", resource))
}

func Mount(kubernetesClient kubernetes.Client) (chi.Router, error) {
	router := Router{
		chi.NewRouter(),
		kubernetesClient,
	}

	router.Get("/sync", router.sync)

	return router, nil
}
