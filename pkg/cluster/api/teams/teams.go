package teams

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

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

func (router *Router) getTeams(w http.ResponseWriter, r *http.Request) {
	cluster := r.URL.Query().Get("cluster")

	ctx, span := router.tracer.Start(r.Context(), "getTeams")
	defer span.End()
	span.SetAttributes(attribute.Key("cluster").String(cluster))
	log.Debug(ctx, "Get teams", zap.String("cluster", cluster))

	teams, err := router.kubernetesClient.GetTeams(ctx, cluster, "")
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not get teams", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}

	span.SetAttributes(attribute.Key("teamsCount").Int(len(teams)))
	log.Debug(r.Context(), "Get teams result", zap.Int("teamsCount", len(teams)))
	render.JSON(w, r, teams)
}

func Mount(config Config, kubernetesClient kubernetes.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
		kubernetesClient,
		otel.Tracer("teams"),
	}

	router.Get("/", router.getTeams)

	return router
}
