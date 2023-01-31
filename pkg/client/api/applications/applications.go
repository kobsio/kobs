package applications

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

func (router *Router) getApplications(w http.ResponseWriter, r *http.Request) {
	cluster := r.URL.Query().Get("cluster")

	ctx, span := router.tracer.Start(r.Context(), "getApplications")
	defer span.End()
	span.SetAttributes(attribute.Key("cluster").String(cluster))
	log.Debug(ctx, "Get applications", zap.String("cluster", cluster))

	applications, err := router.kubernetesClient.GetApplications(ctx, cluster, "")
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not get applications", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}

	span.SetAttributes(attribute.Key("applicationsCount").Int(len(applications)))
	log.Debug(ctx, "Get applications results", zap.Int("applicationsCount", len(applications)))
	render.JSON(w, r, applications)
}

func Mount(config Config, kubernetesClient kubernetes.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
		kubernetesClient,
		otel.Tracer("applications"),
	}

	router.Get("/", router.getApplications)

	return router
}
