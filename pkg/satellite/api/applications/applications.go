package applications

import (
	"net/http"

	v1application "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Config struct{}

type Router struct {
	*chi.Mux
	config         Config
	clustersClient clusters.Client
}

func (router *Router) getApplications(w http.ResponseWriter, r *http.Request) {
	var applications []v1application.ApplicationSpec

	log.Debug(r.Context(), "Get applications")

	for _, cluster := range router.clustersClient.GetClusters(r.Context()) {
		application, err := cluster.GetApplications(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Could not get applications", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get applications")
			return
		}

		applications = append(applications, application...)
	}

	log.Debug(r.Context(), "Get applications results", zap.Int("applicationsCount", len(applications)))
	render.JSON(w, r, applications)
}

func Mount(config Config, clustersClient clusters.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
		clustersClient,
	}

	router.Get("/", router.getApplications)

	return router
}
