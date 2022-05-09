package dashboards

import (
	"net/http"

	v1dashboards "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"

	"github.com/go-chi/render"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"go.uber.org/zap"
)

func (router *Router) getDashboards(w http.ResponseWriter, r *http.Request) {
	log.Debug(r.Context(), "Get dashboards")

	var dashboards []v1dashboards.DashboardSpec

	for _, cluster := range router.clustersClient.GetClusters() {
		dashboard, err := cluster.GetDashboards(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Could not get dashboards", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get dashboards")
			return
		}

		dashboards = append(dashboards, dashboard...)
	}

	log.Debug(r.Context(), "Get all dashboards result", zap.Int("dashboardsCount", len(dashboards)))
	render.JSON(w, r, dashboards)
}
