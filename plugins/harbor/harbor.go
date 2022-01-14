package harbor

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/harbor/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const (
	Route = "/harbor"
)

// Config is the structure of the configuration for the Harbor plugin.
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
	page := r.URL.Query().Get("page")
	pageSize := r.URL.Query().Get("pageSize")

	log.Debug(r.Context(), "Get projects parameters", zap.String("name", name), zap.String("page", page), zap.String("pageSize", pageSize))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	projectsData, err := i.GetProjects(r.Context(), page, pageSize)
	if err != nil {
		log.Error(r.Context(), "Could not get projects", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get projects")
		return
	}

	render.JSON(w, r, projectsData)
}

func (router *Router) getRepositories(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	projectName := r.URL.Query().Get("projectName")
	query := r.URL.Query().Get("query")
	page := r.URL.Query().Get("page")
	pageSize := r.URL.Query().Get("pageSize")

	log.Debug(r.Context(), "Get repositories parameters", zap.String("name", name), zap.String("projectName", projectName), zap.String("query", query), zap.String("page", page), zap.String("pageSize", pageSize))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	repositoriesData, err := i.GetRepositories(r.Context(), projectName, query, page, pageSize)
	if err != nil {
		log.Error(r.Context(), "Could not get repositories", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get repositories")
		return
	}

	render.JSON(w, r, repositoriesData)
}

func (router *Router) getArtifacts(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	projectName := r.URL.Query().Get("projectName")
	repositoryName := r.URL.Query().Get("repositoryName")
	query := r.URL.Query().Get("query")
	page := r.URL.Query().Get("page")
	pageSize := r.URL.Query().Get("pageSize")

	log.Debug(r.Context(), "Get repositories parameters", zap.String("name", name), zap.String("projectName", projectName), zap.String("repositoryName", repositoryName), zap.String("query", query), zap.String("page", page), zap.String("pageSize", pageSize))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	artifactsData, err := i.GetArtifacts(r.Context(), projectName, repositoryName, query, page, pageSize)
	if err != nil {
		log.Error(r.Context(), "Could not get artifacts", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get artifacts")
		return
	}

	render.JSON(w, r, artifactsData)
}

func (router *Router) getArtifact(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	projectName := r.URL.Query().Get("projectName")
	repositoryName := r.URL.Query().Get("repositoryName")
	artifactReference := r.URL.Query().Get("artifactReference")

	log.Debug(r.Context(), "Get artifact parameters", zap.String("name", name), zap.String("projectName", projectName), zap.String("repositoryName", repositoryName), zap.String("artifactReference", artifactReference))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	artifact, err := i.GetArtifact(r.Context(), projectName, repositoryName, artifactReference)
	if err != nil {
		log.Error(r.Context(), "Could not get artifact", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get artifact")
		return
	}

	render.JSON(w, r, artifact)
}

func (router *Router) getVulnerabilities(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	projectName := r.URL.Query().Get("projectName")
	repositoryName := r.URL.Query().Get("repositoryName")
	artifactReference := r.URL.Query().Get("artifactReference")

	log.Debug(r.Context(), "Get vulnerabilities parameters", zap.String("name", name), zap.String("projectName", projectName), zap.String("repositoryName", repositoryName), zap.String("artifactReference", artifactReference))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	vulnerabilities, err := i.GetVulnerabilities(r.Context(), projectName, repositoryName, artifactReference)
	if err != nil {
		log.Error(r.Context(), "Could not get vulnerabilities", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get vulnerabilities")
		return
	}

	render.JSON(w, r, vulnerabilities)
}

func (router *Router) getBuildHistory(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	projectName := r.URL.Query().Get("projectName")
	repositoryName := r.URL.Query().Get("repositoryName")
	artifactReference := r.URL.Query().Get("artifactReference")

	log.Debug(r.Context(), "Get build history parameters", zap.String("name", name), zap.String("projectName", projectName), zap.String("repositoryName", repositoryName), zap.String("artifactReference", artifactReference))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	buildHistory, err := i.GetBuildHistory(r.Context(), projectName, repositoryName, artifactReference)
	if err != nil {
		log.Error(r.Context(), "Could not get build history", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get build history")
		return
	}

	render.JSON(w, r, buildHistory)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.Fatal(nil, "Could not create Harbor instance", zap.Error(err), zap.String("name", cfg.Name))
		}

		instances = append(instances, instance)

		var options map[string]interface{}
		options = make(map[string]interface{})
		options["address"] = cfg.Address

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "harbor",
			Options:     options,
		})
	}

	router := Router{
		chi.NewRouter(),
		instances,
	}

	router.Route("/{name}", func(r chi.Router) {
		r.Get("/projects", router.getProjects)
		r.Get("/repositories", router.getRepositories)
		r.Get("/artifacts", router.getArtifacts)
		r.Get("/artifact", router.getArtifact)
		r.Get("/vulnerabilities", router.getVulnerabilities)
		r.Get("/buildhistory", router.getBuildHistory)
	})

	return router
}
