package jira

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-jira/pkg/instance"

	"github.com/andygrunwald/go-jira"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// PluginType is the type which must be used for the Jira plugin.
const PluginType = "jira"

// Router implements the router for the Jira plugin, which can be registered in the router for our rest api. It
// contains the api routes for the Jira plugin and it's configuration.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// AuthResponse is the response data returned when the a user finished the auth process or when the user is
// authenticated in the auth call.
type AuthResponse struct {
	URL   string `json:"url"`
	Token string `json:"token"`
	Email string `json:"email"`
}

// getInstance returns a Jira instance by it's name. If we couldn't found an instance with the provided name and the
// provided name is "default" we return the first instance from the list. The first instance in the list is also the
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
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var token instance.Token

	err := json.NewDecoder(r.Body).Decode(&token)
	if err != nil {
		log.Error(r.Context(), "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	_, err = i.GetSelf(r.Context(), &token)
	if err != nil {
		log.Error(r.Context(), "Invalid credentials", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	cookie, err := i.TokenToCookie(&token)
	if err != nil {
		log.Error(r.Context(), "Could not create authentication cookie", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "Could not create authentication cookie")
		return
	}

	http.SetCookie(w, cookie)
	render.JSON(w, r, nil)
}

func (router *Router) authToken(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	token, err := i.TokenFromCookie(r)
	if err != nil {
		log.Error(r.Context(), "Could not get authentication token from cookie", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "Could not get authentication token from cookie")
		return
	}

	_, err = i.GetSelf(r.Context(), token)
	if err != nil {
		log.Error(r.Context(), "Invalid credentials", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "Invalid credentials")
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
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	token, err := i.TokenFromCookie(r)
	if err != nil {
		log.Error(r.Context(), "Could not get authentication token from cookie", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "Could not get authentication token from cookie")
		return
	}

	projects, err := i.GetProjects(r.Context(), token)
	if err != nil {
		log.Error(r.Context(), "Could not get projects", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "Could not get projects")
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
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	token, err := i.TokenFromCookie(r)
	if err != nil {
		log.Error(r.Context(), "Could not get authentication token from cookie", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "Could not get authentication token from cookie")
		return
	}

	parsedStartAt, err := strconv.Atoi(startAt)
	if err != nil {
		log.Error(r.Context(), "Could not parse startAt parameter", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse startAt parameter")
		return
	}

	parsedMaxResults, err := strconv.Atoi(maxResults)
	if err != nil {
		log.Error(r.Context(), "Could not parse maxResults parameter", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse maxResults parameter")
		return
	}

	issues, total, err := i.GetIssues(r.Context(), token, jql, parsedStartAt, parsedMaxResults)
	if err != nil {
		log.Error(r.Context(), "Could not get issues", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "Could not get issues")
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

// Mount mounts the Jira plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
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
