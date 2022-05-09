package applications

import (
	"net/http"

	"github.com/go-chi/render"
	v1application "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"go.uber.org/zap"
)

func (router *Router) getApplications(w http.ResponseWriter, r *http.Request) {
	var applications []v1application.ApplicationSpec

	log.Debug(r.Context(), "Get applications")

	for _, cluster := range router.clustersClient.GetClusters() {
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
