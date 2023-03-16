package helm

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/helm/client"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	kubernetesClient kubernetes.Client
}

var newHelmClient = client.New

func (router *Router) getReleases(w http.ResponseWriter, r *http.Request) {
	cluster := r.Header.Get("x-kobs-cluster")
	namespaces := r.URL.Query()["namespace"]

	log.Debug(r.Context(), "getReleases", zap.Strings("namespaces", namespaces))

	var helmReleases []*client.Release

	if namespaces == nil {
		tmpReleases, err := newHelmClient(cluster, router.kubernetesClient).List(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Failed to list Helm releases", zap.Error(err))
			errresponse.Render(w, r, http.StatusBadRequest, "Failed to list Helm releases")
			return
		}

		helmReleases = append(helmReleases, tmpReleases...)
	} else {
		for _, namespace := range namespaces {
			tmpReleases, err := newHelmClient(cluster, router.kubernetesClient).List(r.Context(), namespace)
			if err != nil {
				log.Error(r.Context(), "Failed to list Helm releases", zap.Error(err))
				errresponse.Render(w, r, http.StatusBadRequest, "Failed to list Helm releases")
				return
			}

			helmReleases = append(helmReleases, tmpReleases...)
		}
	}

	log.Debug(r.Context(), "getReleases", zap.Int("releasesCount", len(helmReleases)))
	render.JSON(w, r, helmReleases)
}

// getRelease returns a single Helm release.
func (router *Router) getRelease(w http.ResponseWriter, r *http.Request) {
	cluster := r.Header.Get("x-kobs-cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	version := r.URL.Query().Get("version")

	log.Debug(r.Context(), "getRelease", zap.String("namespace", namespace), zap.String("name", name))

	parsedVersion, err := strconv.Atoi(version)
	if err != nil {
		log.Error(r.Context(), "Failed to parse 'version' parameter", zap.Error(err), zap.String("version", version))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse 'version' parameter")
		return
	}

	release, err := newHelmClient(cluster, router.kubernetesClient).Get(r.Context(), namespace, name, parsedVersion)
	if err != nil {
		log.Error(r.Context(), "Failed to get Helm release", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get Helm release")
		return
	}

	render.JSON(w, r, release)
}

// getReleaseHistory returns the history of a single Helm release.
func (router *Router) getReleaseHistory(w http.ResponseWriter, r *http.Request) {
	cluster := r.Header.Get("x-kobs-cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")

	log.Debug(r.Context(), "getReleaseHistory", zap.String("namespace", namespace), zap.String("name", name))

	releases, err := newHelmClient(cluster, router.kubernetesClient).History(r.Context(), namespace, name)
	if err != nil {
		log.Error(r.Context(), "Failed to get Helm release history", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get Helm release history")
		return
	}

	log.Debug(r.Context(), "getReleaseHistory", zap.Int("releasesCount", len(releases)))
	render.JSON(w, r, releases)
}

func Mount(kubernetesClient kubernetes.Client) (chi.Router, error) {
	router := Router{
		chi.NewRouter(),
		kubernetesClient,
	}

	router.Get("/releases", router.getReleases)
	router.Get("/release", router.getRelease)
	router.Get("/release/history", router.getReleaseHistory)

	return router, nil
}
