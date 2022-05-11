package applications

import (
	"net/http"
	"strconv"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	storeClient store.Client
}

func (router *Router) getApplications(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the applications", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the applications")
		return
	}

	teams := user.Teams
	all := r.URL.Query().Get("all")
	clusterIDs := r.URL.Query()["clusterID"]
	namespaceIDs := r.URL.Query()["namespaceID"]
	tags := r.URL.Query()["namespaces"]
	searchTerm := r.URL.Query().Get("searchTerm")
	external := r.URL.Query().Get("external")
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")

	parsedLimit, err := strconv.Atoi(limit)
	if err != nil {
		log.Error(r.Context(), "Could not parse limit parameter", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse limit parameter")
		return
	}

	parsedOffset, err := strconv.Atoi(offset)
	if err != nil {
		log.Error(r.Context(), "Could not parse offset parameter", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse offset parameter")
		return
	}

	parsedAll, _ := strconv.ParseBool(all)
	if parsedAll == true || (len(user.Teams) == 1 && user.Teams[0] == "*") {
		if !user.HasApplicationAccess("", "", "", []string{""}) {
			log.Warn(r.Context(), "The user is not authorized to view all applications", zap.Error(err))
			errresponse.Render(w, r, nil, http.StatusForbidden, "You are not allowed to view all applications")
			return
		}

		teams = nil
	}

	applications, err := router.storeClient.GetApplicationsByFilter(r.Context(), teams, clusterIDs, namespaceIDs, tags, searchTerm, external, parsedLimit, parsedOffset)
	if err != nil {
		log.Error(r.Context(), "Could not get applications", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get applications")
		return
	}

	render.JSON(w, r, applications)
}

func (router *Router) getApplicationsCount(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the applications", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the applications")
		return
	}

	teams := user.Teams
	all := r.URL.Query().Get("all")
	clusterIDs := r.URL.Query()["clusterID"]
	namespaceIDs := r.URL.Query()["namespaceID"]
	tags := r.URL.Query()["namespaces"]
	searchTerm := r.URL.Query().Get("searchTerm")
	external := r.URL.Query().Get("external")

	parsedAll, _ := strconv.ParseBool(all)
	if parsedAll == true || (len(user.Teams) == 1 && user.Teams[0] == "*") {
		if !user.HasApplicationAccess("", "", "", []string{""}) {
			log.Warn(r.Context(), "The user is not authorized to view all applications", zap.Error(err))
			errresponse.Render(w, r, nil, http.StatusForbidden, "You are not allowed to view all applications")
			return
		}

		teams = nil
	}

	count, err := router.storeClient.GetApplicationsByFilterCount(r.Context(), teams, clusterIDs, namespaceIDs, tags, searchTerm, external)
	if err != nil {
		log.Error(r.Context(), "Could not get applications count", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get applications count")
		return
	}

	data := struct {
		Count int `json:"count"`
	}{count}

	render.JSON(w, r, data)
}

func (router *Router) getTags(w http.ResponseWriter, r *http.Request) {
	tags, err := router.storeClient.GetTags(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not get tags", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get tags")
		return
	}

	render.JSON(w, r, tags)
}

func Mount(storeClient store.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		storeClient,
	}

	router.Get("/", router.getApplications)
	router.Get("/count", router.getApplicationsCount)
	router.Get("/tags", router.getTags)

	return router
}
