package harbor

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/harbor/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Harbor instance by it's name. If we couldn't found an instance with the provided name and the
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

func (router *Router) getProjects(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	page := r.URL.Query().Get("page")
	pageSize := r.URL.Query().Get("pageSize")

	log.Debug(r.Context(), "getProjects", zap.String("name", name), zap.String("page", page), zap.String("pageSize", pageSize))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	projectsData, err := i.GetProjects(r.Context(), page, pageSize)
	if err != nil {
		log.Error(r.Context(), "Failed to get projects", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get projects")
		return
	}

	render.JSON(w, r, projectsData)
}

func (router *Router) getRepositories(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	projectName := r.URL.Query().Get("projectName")
	query := r.URL.Query().Get("query")
	page := r.URL.Query().Get("page")
	pageSize := r.URL.Query().Get("pageSize")

	log.Debug(r.Context(), "getRepositories", zap.String("name", name), zap.String("projectName", projectName), zap.String("query", query), zap.String("page", page), zap.String("pageSize", pageSize))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	repositoriesData, err := i.GetRepositories(r.Context(), projectName, query, page, pageSize)
	if err != nil {
		log.Error(r.Context(), "Failed to get repositories", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get repositories")
		return
	}

	render.JSON(w, r, repositoriesData)
}

func (router *Router) getArtifacts(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	projectName := r.URL.Query().Get("projectName")
	repositoryName := r.URL.Query().Get("repositoryName")
	query := r.URL.Query().Get("query")
	page := r.URL.Query().Get("page")
	pageSize := r.URL.Query().Get("pageSize")

	log.Debug(r.Context(), "getArtifacts", zap.String("name", name), zap.String("projectName", projectName), zap.String("repositoryName", repositoryName), zap.String("query", query), zap.String("page", page), zap.String("pageSize", pageSize))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	artifactsData, err := i.GetArtifacts(r.Context(), projectName, repositoryName, query, page, pageSize)
	if err != nil {
		log.Error(r.Context(), "Failed to get artifacts", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get artifacts")
		return
	}

	render.JSON(w, r, artifactsData)
}

func (router *Router) getArtifact(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	projectName := r.URL.Query().Get("projectName")
	repositoryName := r.URL.Query().Get("repositoryName")
	artifactReference := r.URL.Query().Get("artifactReference")

	log.Debug(r.Context(), "getArtifact", zap.String("name", name), zap.String("projectName", projectName), zap.String("repositoryName", repositoryName), zap.String("artifactReference", artifactReference))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	artifact, err := i.GetArtifact(r.Context(), projectName, repositoryName, artifactReference)
	if err != nil {
		log.Error(r.Context(), "Failed to get artifact", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get artifact")
		return
	}

	render.JSON(w, r, artifact)
}

func (router *Router) getVulnerabilities(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	projectName := r.URL.Query().Get("projectName")
	repositoryName := r.URL.Query().Get("repositoryName")
	artifactReference := r.URL.Query().Get("artifactReference")

	log.Debug(r.Context(), "getVulnerabilities", zap.String("name", name), zap.String("projectName", projectName), zap.String("repositoryName", repositoryName), zap.String("artifactReference", artifactReference))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	vulnerabilities, err := i.GetVulnerabilities(r.Context(), projectName, repositoryName, artifactReference)
	if err != nil {
		log.Error(r.Context(), "Failed to get vulnerabilities", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get vulnerabilities")
		return
	}

	render.JSON(w, r, vulnerabilities)
}

func (router *Router) getBuildHistory(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	projectName := r.URL.Query().Get("projectName")
	repositoryName := r.URL.Query().Get("repositoryName")
	artifactReference := r.URL.Query().Get("artifactReference")

	log.Debug(r.Context(), "getBuildHistory", zap.String("name", name), zap.String("projectName", projectName), zap.String("repositoryName", repositoryName), zap.String("artifactReference", artifactReference))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	buildHistory, err := i.GetBuildHistory(r.Context(), projectName, repositoryName, artifactReference)
	if err != nil {
		log.Error(r.Context(), "Failed to get build history", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get build history")
		return
	}

	render.JSON(w, r, buildHistory)
}

func Mount(instances []plugin.Instance) (chi.Router, error) {
	var harborInstances []instance.Instance

	for _, i := range instances {
		harborInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		harborInstances = append(harborInstances, harborInstance)
	}

	router := Router{
		chi.NewRouter(),
		harborInstances,
	}

	router.Get("/projects", router.getProjects)
	router.Get("/repositories", router.getRepositories)
	router.Get("/artifacts", router.getArtifacts)
	router.Get("/artifact", router.getArtifact)
	router.Get("/vulnerabilities", router.getVulnerabilities)
	router.Get("/buildhistory", router.getBuildHistory)

	return router, nil
}
