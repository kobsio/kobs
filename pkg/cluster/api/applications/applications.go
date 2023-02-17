package applications

import (
	"fmt"
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

// Router implements the chi.Router interface, but also contains a tracer and a Kubernetes client which can be used in
// all API routers.
type Router struct {
	*chi.Mux
	kubernetesClient kubernetes.Client
	tracer           trace.Tracer
}

// getApplications returns all applications from the provided Kubernetes client. The API endpoint requires a `cluster`
// parameter, to set the cluster for all returned applications. The `cluster` parameter is required, because the name of
// the cluster is only configured in the hub.
//
// If the `cluster` paramter is missing or if the [kubernetesClient.GetApplications] method returns an error the API
// endpoint returns an error. If we are able to get all applications the applications are returned.
func (router *Router) getApplications(w http.ResponseWriter, r *http.Request) {
	cluster := r.URL.Query().Get("cluster")

	ctx, span := router.tracer.Start(r.Context(), "getApplications")
	defer span.End()
	span.SetAttributes(attribute.Key("cluster").String(cluster))
	log.Debug(ctx, "Get applications", zap.String("cluster", cluster))

	if cluster == "" {
		err := fmt.Errorf("cluster parameter is missing")
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Failed to get applications", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "The 'cluster' parameter can not be empty")
		return
	}

	applications, err := router.kubernetesClient.GetApplications(ctx, cluster, "")
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Failed to get applications", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get applications")
		return
	}

	span.SetAttributes(attribute.Key("applicationsCount").Int(len(applications)))
	log.Debug(ctx, "Get applications results", zap.Int("applicationsCount", len(applications)))
	render.JSON(w, r, applications)
}

// Mount returns a chi.Router which handles all application related API endpoints.
func Mount(kubernetesClient kubernetes.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		kubernetesClient,
		otel.Tracer("applications"),
	}

	router.Get("/", router.getApplications)

	return router
}
