package sonarqube

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/sonarqube/instance"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/utils/middleware/pluginproxy"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

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
	page := r.URL.Query().Get("page")
	perPage := r.URL.Query().Get("perPage")

	log.Debug(r.Context(), "getProjects", zap.String("name", name), zap.String("query", query), zap.String("page", page), zap.String("perPage", perPage))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	projects, err := i.GetProjects(r.Context(), query, page, perPage)
	if err != nil {
		log.Error(r.Context(), "Failed to get projects", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get projects")
		return
	}

	render.JSON(w, r, projects)
}

func (router *Router) getProjectMeasures(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	project := r.URL.Query().Get("project")
	metricKeys := r.URL.Query()["metricKey"]

	log.Debug(r.Context(), "getProjectMeasures", zap.String("name", name), zap.String("project", project), zap.Strings("metricKeys", metricKeys))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	projectMeasures, err := i.GetProjectMeasures(r.Context(), project, metricKeys)
	if err != nil {
		log.Error(r.Context(), "Failed to get project measures", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get project measures")
		return
	}

	render.JSON(w, r, projectMeasures)
}

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

	proxy := pluginproxy.New(clustersClient)

	router.With(proxy).Get("/projects", router.getProjects)
	router.With(proxy).Get("/projectmeasures", router.getProjectMeasures)

	return router, nil
}
