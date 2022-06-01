package main

import (
	"net/http"

	"github.com/kobsio/kobs/packages/plugin-sonarqube/pkg/instance"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Router implements the router for the SonarQube plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a SonarQube instance by it's name. If we couldn't found an instance with the provided name and
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

func (router *Router) getProjects(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")
	pageNumber := r.URL.Query().Get("pageNumber")
	pageSize := r.URL.Query().Get("pageSize")

	log.Debug(r.Context(), "Get projects parameters", zap.String("name", name), zap.String("query", query), zap.String("pageNumber", pageNumber), zap.String("pageSize", pageSize))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	projects, err := i.GetProjects(r.Context(), query, pageNumber, pageSize)
	if err != nil {
		log.Error(r.Context(), "Could not get projects", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get projects")
		return
	}

	render.JSON(w, r, projects)
}

func (router *Router) getProjectMeasures(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	project := r.URL.Query().Get("project")
	metricKeys := r.URL.Query()["metricKey"]

	log.Debug(r.Context(), "Get project measures", zap.String("name", name), zap.String("project", project), zap.Strings("metricKeys", metricKeys))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	projectMeasures, err := i.GetProjectMeasures(r.Context(), project, metricKeys)
	if err != nil {
		log.Error(r.Context(), "Could not get project measures", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get project measures")
		return
	}

	render.JSON(w, r, projectMeasures)
}

// Mount returns a new router which can be used in the router for the kobs rest api.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var sonarqubeInstances []instance.Instance

	for _, i := range instances {
		sonarqubeInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		sonarqubeInstances = append(sonarqubeInstances, sonarqubeInstance)
	}

	router := Router{
		chi.NewRouter(),
		sonarqubeInstances,
	}

	router.Get("/projects", router.getProjects)
	router.Get("/projectmeasures", router.getProjectMeasures)

	return router, nil
}
