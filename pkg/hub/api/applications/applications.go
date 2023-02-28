package applications

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"

	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
)

type Router struct {
	*chi.Mux
	dbClient db.Client
	tracer   trace.Tracer
}

func (router *Router) getApplications(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getApplications")
	defer span.End()

	user := authContext.MustGetUser(ctx)
	teams := user.Teams
	all := r.URL.Query().Get("all")
	clusters := r.URL.Query()["cluster"]
	namespaces := r.URL.Query()["namespace"]
	tags := r.URL.Query()["tag"]
	searchTerm := r.URL.Query().Get("searchTerm")
	external := r.URL.Query().Get("external")
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")

	span.SetAttributes(attribute.Key("teams").StringSlice(teams))
	span.SetAttributes(attribute.Key("all").String(all))
	span.SetAttributes(attribute.Key("clusters").StringSlice(clusters))
	span.SetAttributes(attribute.Key("namespaces").StringSlice(namespaces))
	span.SetAttributes(attribute.Key("tags").StringSlice(tags))
	span.SetAttributes(attribute.Key("searchTerm").String(searchTerm))
	span.SetAttributes(attribute.Key("external").String(external))
	span.SetAttributes(attribute.Key("limit").String(limit))
	span.SetAttributes(attribute.Key("offset").String(offset))

	parsedLimit, err := strconv.Atoi(limit)
	if err != nil {
		log.Error(ctx, "Failed to parse 'limit' parameter", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse 'limit' parameter")
		return
	}

	parsedOffset, err := strconv.Atoi(offset)
	if err != nil {
		log.Error(ctx, "Failed to parse 'offset' parameter", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse 'offset' parameter")
		return
	}

	// Check if the user requested to see all applications, if this is the case we have to check if he is alowed to do
	// so. If a team isn't part of any teams "user.Teams" is "nil" we handle it the same ways as he wants to see all
	// applications.
	parsedAll, _ := strconv.ParseBool(all)
	if parsedAll || teams == nil {
		if !user.HasApplicationAccess(&applicationv1.ApplicationSpec{}) {
			log.Warn(ctx, "The user is not authorized to view all applications")
			span.RecordError(fmt.Errorf("user is not authorized to view all applications"))
			span.SetStatus(codes.Error, "user is not authorized to view all applications")
			errresponse.Render(w, r, http.StatusForbidden, "You are not allowed to view all applications")
			return
		}

		teams = nil
	}

	applications, err := router.dbClient.GetApplicationsByFilter(ctx, teams, clusters, namespaces, tags, searchTerm, external, parsedLimit, parsedOffset)
	if err != nil {
		log.Error(ctx, "Failed to get applications", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get applications")
		return
	}

	count, err := router.dbClient.GetApplicationsByFilterCount(ctx, teams, clusters, namespaces, tags, searchTerm, external)
	if err != nil {
		log.Error(ctx, "Failed to get applications count", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get applications count")
		return
	}

	data := struct {
		Applications []applicationv1.ApplicationSpec `json:"applications"`
		Count        int                             `json:"count"`
	}{
		Applications: applications,
		Count:        count,
	}

	render.JSON(w, r, data)
}

func (router *Router) getTags(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getTags")
	defer span.End()

	tagObjects, err := router.dbClient.GetTags(ctx)
	if err != nil {
		log.Error(ctx, "Failed to get tags", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get tags")
		return
	}

	tags := []string{}
	for _, tag := range tagObjects {
		tags = append(tags, tag.Tag)
	}

	render.JSON(w, r, tags)
}

func (router *Router) getApplication(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getApplication")
	defer span.End()

	user := authContext.MustGetUser(ctx)
	id := r.URL.Query().Get("id")

	span.SetAttributes(attribute.Key("id").String(id))

	application, err := router.dbClient.GetApplicationByID(ctx, id)
	if err != nil {
		log.Error(ctx, "Failed to get application", zap.Error(err), zap.String("id", id))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get application")
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return
	}

	if application == nil {
		log.Error(ctx, "Application was not found", zap.Error(err), zap.String("id", id))
		span.RecordError(fmt.Errorf("application was not found"))
		span.SetStatus(codes.Error, "application was not found")
		errresponse.Render(w, r, http.StatusNotFound, "Application was not found")
		return
	}

	if !user.HasApplicationAccess(application) {
		log.Warn(ctx, "The user is not authorized to view the application", zap.String("id", id))
		span.RecordError(fmt.Errorf("user is not authorized to view the application"))
		span.SetStatus(codes.Error, "user is not authorized to view the application")
		errresponse.Render(w, r, http.StatusForbidden, "You are not allowed to view the application")
		return
	}

	render.JSON(w, r, application)
}

func (router *Router) getApplicationsByTeam(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getApplications")
	defer span.End()

	user := authContext.MustGetUser(ctx)
	team := r.URL.Query().Get("team")
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")

	span.SetAttributes(attribute.Key("team").String(team))
	span.SetAttributes(attribute.Key("limit").String(limit))
	span.SetAttributes(attribute.Key("offset").String(offset))

	parsedLimit, err := strconv.Atoi(limit)
	if err != nil {
		log.Error(ctx, "Failed to parse 'limit' parameter", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse 'limit' parameter")
		return
	}

	parsedOffset, err := strconv.Atoi(offset)
	if err != nil {
		log.Error(ctx, "Failed to parse 'offset' parameter", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse 'offset' parameter")
		return
	}

	if !user.HasTeamAccess(team) && !user.HasApplicationAccess(&applicationv1.ApplicationSpec{}) {
		log.Warn(ctx, "The user is not authorized to view the applications", zap.String("team", team))
		span.RecordError(fmt.Errorf("user is not authorized to view all applications"))
		span.SetStatus(codes.Error, "user is not authorized to view all applications")
		errresponse.Render(w, r, http.StatusForbidden, "You are not allowed to view the applications of this team")
		return
	}

	applications, err := router.dbClient.GetApplicationsByFilter(ctx, []string{team}, nil, nil, nil, "", "include", parsedLimit, parsedOffset)
	if err != nil {
		log.Error(ctx, "Failed to get applications", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get applications")
		return
	}

	count, err := router.dbClient.GetApplicationsByFilterCount(ctx, []string{team}, nil, nil, nil, "", "include")
	if err != nil {
		log.Error(ctx, "Failed to get applications count", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get applications count")
		return
	}

	data := struct {
		Count        int                             `json:"count"`
		Applications []applicationv1.ApplicationSpec `json:"applications"`
	}{
		count,
		applications,
	}

	render.JSON(w, r, data)
}

func Mount(dbClient db.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		dbClient,
		otel.Tracer("applications"),
	}

	router.Get("/", router.getApplications)
	router.Get("/tags", router.getTags)
	router.Get("/application", router.getApplication)
	router.Get("/team", router.getApplicationsByTeam)
	router.Get("/topology", router.getApplicationsTopology)
	router.Get("/topology/application", router.getApplicationTopology)

	return router
}
