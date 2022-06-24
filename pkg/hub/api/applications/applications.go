package applications

import (
	"fmt"
	"net/http"
	"strconv"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/store"
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	storeClient store.Client
	tracer      trace.Tracer
}

func (router *Router) getApplications(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getApplications")
	defer span.End()

	user, err := authContext.GetUser(ctx)
	if err != nil {
		log.Warn(ctx, "The user is not authorized to access the applications", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the applications")
		return
	}

	teams := user.Teams
	all := r.URL.Query().Get("all")
	clusterIDs := r.URL.Query()["clusterID"]
	namespaceIDs := r.URL.Query()["namespaceID"]
	tags := r.URL.Query()["tag"]
	searchTerm := r.URL.Query().Get("searchTerm")
	external := r.URL.Query().Get("external")
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")

	span.SetAttributes(attribute.Key("teams").StringSlice(teams))
	span.SetAttributes(attribute.Key("all").String(all))
	span.SetAttributes(attribute.Key("clusterIDs").StringSlice(clusterIDs))
	span.SetAttributes(attribute.Key("namespaceIDs").StringSlice(namespaceIDs))
	span.SetAttributes(attribute.Key("tags").StringSlice(tags))
	span.SetAttributes(attribute.Key("searchTerm").String(searchTerm))
	span.SetAttributes(attribute.Key("external").String(external))
	span.SetAttributes(attribute.Key("limit").String(limit))
	span.SetAttributes(attribute.Key("offset").String(offset))

	parsedLimit, err := strconv.Atoi(limit)
	if err != nil {
		log.Error(ctx, "Could not parse limit parameter", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse limit parameter")
		return
	}

	parsedOffset, err := strconv.Atoi(offset)
	if err != nil {
		log.Error(ctx, "Could not parse offset parameter", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse offset parameter")
		return
	}

	parsedAll, _ := strconv.ParseBool(all)
	if parsedAll == true || (len(user.Teams) == 1 && user.Teams[0] == "*") {
		if !user.HasApplicationAccess("", "", "", []string{""}) {
			log.Warn(ctx, "The user is not authorized to view all applications")
			span.RecordError(fmt.Errorf("user is not authorized to view all applications"))
			span.SetStatus(codes.Error, "user is not authorized to view all applications")
			errresponse.Render(w, r, nil, http.StatusForbidden, "You are not allowed to view all applications")
			return
		}

		teams = nil
	}

	applications, err := router.storeClient.GetApplicationsByFilter(ctx, teams, clusterIDs, namespaceIDs, tags, searchTerm, external, parsedLimit, parsedOffset)
	if err != nil {
		log.Error(ctx, "Could not get applications", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get applications")
		return
	}

	render.JSON(w, r, applications)
}

func (router *Router) getApplicationsCount(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getApplicationsCount")
	defer span.End()

	user, err := authContext.GetUser(ctx)
	if err != nil {
		log.Warn(ctx, "The user is not authorized to access the applications", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the applications")
		return
	}

	teams := user.Teams
	all := r.URL.Query().Get("all")
	clusterIDs := r.URL.Query()["clusterID"]
	namespaceIDs := r.URL.Query()["namespaceID"]
	tags := r.URL.Query()["tag"]
	searchTerm := r.URL.Query().Get("searchTerm")
	external := r.URL.Query().Get("external")

	span.SetAttributes(attribute.Key("teams").StringSlice(teams))
	span.SetAttributes(attribute.Key("all").String(all))
	span.SetAttributes(attribute.Key("clusterIDs").StringSlice(clusterIDs))
	span.SetAttributes(attribute.Key("namespaceIDs").StringSlice(namespaceIDs))
	span.SetAttributes(attribute.Key("tags").StringSlice(tags))
	span.SetAttributes(attribute.Key("searchTerm").String(searchTerm))
	span.SetAttributes(attribute.Key("external").String(external))

	parsedAll, _ := strconv.ParseBool(all)
	if parsedAll == true || (len(user.Teams) == 1 && user.Teams[0] == "*") {
		if !user.HasApplicationAccess("", "", "", []string{""}) {
			log.Warn(ctx, "The user is not authorized to view all applications")
			span.RecordError(fmt.Errorf("user is not authorized to view all applications"))
			span.SetStatus(codes.Error, "user is not authorized to view all applications")
			errresponse.Render(w, r, nil, http.StatusForbidden, "You are not allowed to view all applications")
			return
		}

		teams = nil
	}

	count, err := router.storeClient.GetApplicationsByFilterCount(ctx, teams, clusterIDs, namespaceIDs, tags, searchTerm, external)
	if err != nil {
		log.Error(ctx, "Could not get applications count", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get applications count")
		return
	}

	data := struct {
		Count int `json:"count"`
	}{count}

	render.JSON(w, r, data)
}

func (router *Router) getTags(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getTags")
	defer span.End()

	tags, err := router.storeClient.GetTags(ctx)
	if err != nil {
		log.Error(ctx, "Could not get tags", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get tags")
		return
	}

	render.JSON(w, r, tags)
}

func (router *Router) getApplication(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getApplication")
	defer span.End()

	user, err := authContext.GetUser(ctx)
	if err != nil {
		log.Warn(ctx, "The user is not authorized to access the application", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the application")
		return
	}

	id := r.URL.Query().Get("id")

	span.SetAttributes(attribute.Key("id").String(id))

	application, err := router.storeClient.GetApplicationByID(ctx, id)
	if err != nil {
		log.Error(ctx, "Could not get application", zap.Error(err), zap.String("id", id))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get application")
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return
	}

	if application == nil {
		log.Error(ctx, "Application was not found", zap.Error(err), zap.String("id", id))
		span.RecordError(fmt.Errorf("application was not found"))
		span.SetStatus(codes.Error, "application was not found")
		errresponse.Render(w, r, err, http.StatusBadRequest, "Application was not found")
		return
	}

	if !user.HasApplicationAccess(application.Satellite, application.Cluster, application.Namespace, application.Teams) {
		log.Warn(ctx, "The user is not authorized to view the application", zap.String("id", id))
		span.RecordError(fmt.Errorf("user is not authorized to view the application"))
		span.SetStatus(codes.Error, "user is not authorized to view the application")
		errresponse.Render(w, r, nil, http.StatusForbidden, "You are not allowed to view the application")
		return
	}

	render.JSON(w, r, application)
}

func (router *Router) getApplicationsByTeam(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getApplications")
	defer span.End()

	user, err := authContext.GetUser(ctx)
	if err != nil {
		log.Warn(ctx, "The user is not authorized to access the applications", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the applications")
		return
	}

	team := r.URL.Query().Get("team")
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")

	span.SetAttributes(attribute.Key("team").String(team))
	span.SetAttributes(attribute.Key("limit").String(limit))
	span.SetAttributes(attribute.Key("offset").String(offset))

	parsedLimit, err := strconv.Atoi(limit)
	if err != nil {
		log.Error(ctx, "Could not parse limit parameter", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse limit parameter")
		return
	}

	parsedOffset, err := strconv.Atoi(offset)
	if err != nil {
		log.Error(ctx, "Could not parse offset parameter", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse offset parameter")
		return
	}

	if !user.HasTeamAccess(team) && !user.HasApplicationAccess("", "", "", []string{""}) {
		log.Warn(ctx, "The user is not authorized to view the applications", zap.String("team", team))
		span.RecordError(fmt.Errorf("user is not authorized to view all applications"))
		span.SetStatus(codes.Error, "user is not authorized to view all applications")
		errresponse.Render(w, r, nil, http.StatusForbidden, "You are not allowed to view the applications of this team")
		return
	}

	applications, err := router.storeClient.GetApplicationsByFilter(ctx, []string{team}, nil, nil, nil, "", "include", parsedLimit, parsedOffset)
	if err != nil {
		log.Error(ctx, "Could not get applications", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get applications")
		return
	}

	count, err := router.storeClient.GetApplicationsByFilterCount(ctx, []string{team}, nil, nil, nil, "", "include")
	if err != nil {
		log.Error(ctx, "Could not get applications", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get applications")
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

func Mount(storeClient store.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		storeClient,
		otel.Tracer("applications"),
	}

	router.Get("/", router.getApplications)
	router.Get("/count", router.getApplicationsCount)
	router.Get("/tags", router.getTags)
	router.Get("/application", router.getApplication)
	router.Get("/team", router.getApplicationsByTeam)
	router.Get("/topology", router.getApplicationsTopology)
	router.Get("/topology/application", router.getApplicationTopology)

	return router
}