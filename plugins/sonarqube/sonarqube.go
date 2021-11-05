package sonarqube

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/sonarqube/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const (
	Route = "/sonarqube"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "sonarqube"})
)

// Config is the structure of the configuration for the sonarqube plugin.
type Config []instance.Config

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clusters  *clusters.Clusters
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

	log.WithFields(logrus.Fields{"name": name, "query": query, "pageNumber": pageNumber, "pageSize": pageSize}).Tracef("getProjects")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	projects, err := i.GetProjects(r.Context(), query, pageNumber, pageSize)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get projects")
		return
	}

	render.JSON(w, r, projects)
}

func (router *Router) getProjectMeasures(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	project := r.URL.Query().Get("project")
	metricKeys := r.URL.Query()["metricKey"]

	log.WithFields(logrus.Fields{"name": name, "project": project, "metricKeys": metricKeys}).Tracef("getProjectMeasures")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	projectMeasures, err := i.GetProjectMeasures(r.Context(), project, metricKeys)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get project measures")
		return
	}

	render.JSON(w, r, projectMeasures)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"name": cfg.Name}).Fatalf("Could not create SonarQube instance")
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
		clusters,
		instances,
	}

	router.Get("/projects/{name}", router.getProjects)
	router.Get("/projectmeasures/{name}", router.getProjectMeasures)

	return router
}
