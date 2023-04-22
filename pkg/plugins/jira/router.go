package jira

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/andygrunwald/go-jira"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/jira/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"go.uber.org/zap"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Jira instance by it's name. If we couldn't found an instance with the provided name and
// the provided name is "default" we return the first instance from the list. The first instance in the list is also the
// first one configured by the user and can be used as default one.
func (router *Router) getInstance(name string) instance.Instance {
	for _, i := range router.instances {
		if i.GetName() == name {
			return i
		}
	}

	if name == "default" && len(router.instances) > 0 {
		return router.instances[0]
	}

	return nil
}

func (router *Router) authLogin(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	var token instance.Token

	err := json.NewDecoder(r.Body).Decode(&token)
	if err != nil {
		log.Error(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	_, err = i.GetSelf(r.Context(), &token)
	if err != nil {
		log.Error(r.Context(), "Invalid credentials", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	cookie, err := i.TokenToCookie(&token)
	if err != nil {
		log.Error(r.Context(), "Failed to create authentication cookie", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Failed to create authentication cookie")
		return
	}

	http.SetCookie(w, cookie)
	render.JSON(w, r, nil)
}

func (router *Router) authToken(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	token, err := i.TokenFromCookie(r)
	if err != nil {
		log.Error(r.Context(), "Failed to get authentication token from cookie", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Failed to get authentication token from cookie")
		return
	}

	_, err = i.GetSelf(r.Context(), token)
	if err != nil {
		log.Error(r.Context(), "Invalid credentials", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	data := struct {
		URL string `json:"url"`
	}{
		i.GetURL(),
	}

	render.JSON(w, r, data)
}

func (router *Router) getProjects(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	token, err := i.TokenFromCookie(r)
	if err != nil {
		log.Error(r.Context(), "Failed to get authentication token from cookie", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Failed to get authentication token from cookie")
		return
	}

	projects, err := i.GetProjects(r.Context(), token)
	if err != nil {
		log.Error(r.Context(), "Failed to get projects", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Failed to get projects")
		return
	}

	render.JSON(w, r, projects)
}

func (router *Router) getIssues(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	jql := r.URL.Query().Get("jql")
	startAt := r.URL.Query().Get("startAt")
	maxResults := r.URL.Query().Get("maxResults")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	token, err := i.TokenFromCookie(r)
	if err != nil {
		log.Error(r.Context(), "Failed to get authentication token from cookie", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Failed to get authentication token from cookie")
		return
	}

	parsedStartAt, err := strconv.Atoi(startAt)
	if err != nil {
		log.Error(r.Context(), "Failed to parse 'startAt' parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse 'startAt' parameter")
		return
	}

	parsedMaxResults, err := strconv.Atoi(maxResults)
	if err != nil {
		log.Error(r.Context(), "Failed to parse 'maxResults' parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse 'maxResults' parameter")
		return
	}

	issues, total, err := i.GetIssues(r.Context(), token, jql, parsedStartAt, parsedMaxResults)
	if err != nil {
		log.Error(r.Context(), "Failed to get issues", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Failed to get issues")
		return
	}

	data := struct {
		Issues []jira.Issue `json:"issues"`
		Total  int          `json:"total"`
	}{
		issues,
		total,
	}

	render.JSON(w, r, data)
}

func Mount(instances []plugin.Instance) (chi.Router, error) {
	var jiraInstances []instance.Instance

	for _, i := range instances {
		jiraInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}
		jiraInstances = append(jiraInstances, jiraInstance)
	}

	router := Router{
		chi.NewRouter(),
		jiraInstances,
	}

	router.Get("/auth", router.authToken)
	router.Post("/auth/login", router.authLogin)
	router.Get("/projects", router.getProjects)
	router.Get("/issues", router.getIssues)

	return router, nil
}
