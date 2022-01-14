package sonarqube

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/sonarqube/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const (
	Route = "/sonarqube"
)

// Config is the structure of the configuration for the sonarqube plugin.
type Config []instance.Config

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	instances []*instance.Instance
}

func (router *Router) getInstance(name string) *instance.Instance {
	for _, i := range router.instances {
		if i.Name == name {
			return i
		}
	}

	return nil
}

func (router *Router) getProjects(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
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
	name := chi.URLParam(r, "name")
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

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.Fatal(nil, "Could not create SonarQube instance", zap.Error(err), zap.String("name", cfg.Name))
		}

		instances = append(instances, instance)

		var options map[string]interface{}
		options = make(map[string]interface{})
		options["url"] = cfg.Address

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "sonarqube",
			Options:     options,
		})
	}

	router := Router{
		chi.NewRouter(),
		instances,
	}

	router.Route("/{name}", func(r chi.Router) {
		r.Get("/projects", router.getProjects)
		r.Get("/projectmeasures", router.getProjectMeasures)
	})

	return router
}
