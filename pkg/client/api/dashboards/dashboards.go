package dashboards

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/client/kubernetes"
	"github.com/kobsio/kobs/pkg/hub/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/instrument/log"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

type Config struct{}

type Router struct {
	*chi.Mux
	config           Config
	kubernetesClient kubernetes.Client
	tracer           trace.Tracer
}

func (router *Router) getDashboards(w http.ResponseWriter, r *http.Request) {
	cluster := r.URL.Query().Get("cluster")

	ctx, span := router.tracer.Start(r.Context(), "getApplications")
	defer span.End()
	span.SetAttributes(attribute.Key("cluster").String(cluster))
	log.Debug(ctx, "Get dashboards", zap.String("cluster", cluster))

	dashboards, err := router.kubernetesClient.GetDashboards(ctx, cluster, "")
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not get dashboards", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}

	span.SetAttributes(attribute.Key("dashboardsCount").Int(len(dashboards)))
	log.Debug(ctx, "Get all dashboards result", zap.Int("dashboardsCount", len(dashboards)))
	render.JSON(w, r, dashboards)
}

func Mount(config Config, kubernetesClient kubernetes.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
		kubernetesClient,
		otel.Tracer("dashboards"),
	}

	router.Get("/", router.getDashboards)

	return router
}
