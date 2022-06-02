package main

import (
	"mime"
	"net/http"
	"path/filepath"

	"github.com/kobsio/kobs/packages/plugin-techdocs/pkg/instance"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Router implements the router for the TechDocs plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a TechDocs instance by it's name. If we couldn't found an instance with the provided name and the
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

func (router *Router) getIndexes(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "Get TechDocs parameters", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	indexes, err := i.GetIndexes(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not get indexes", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get indexes")
		return
	}

	render.JSON(w, r, indexes)
}

func (router *Router) getIndex(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	service := r.URL.Query().Get("service")

	log.Debug(r.Context(), "Get TechDoc parameters", zap.String("name", name), zap.String("service", service))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	index, err := i.GetIndex(r.Context(), service)
	if err != nil {
		log.Error(r.Context(), "Could not get index", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get index")
		return
	}

	render.JSON(w, r, index)
}

func (router *Router) getMarkdown(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	service := r.URL.Query().Get("service")
	path := r.URL.Query().Get("path")

	log.Debug(r.Context(), "Get markdown parameters", zap.String("name", name), zap.String("service", service), zap.String("path", path))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	markdown, err := i.GetMarkdown(r.Context(), service, path)
	if err != nil {
		log.Error(r.Context(), "Could not get markdown", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get markdown")
		return
	}

	render.JSON(w, r, markdown)
}

func (router *Router) getFile(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	service := r.URL.Query().Get("service")
	path := r.URL.Query().Get("path")

	log.Debug(r.Context(), "Get file parameters", zap.String("name", name), zap.String("service", service), zap.String("path", path))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		render.Status(r, http.StatusBadRequest)
		render.Data(w, r, []byte(`Could not find instance name`))
		return
	}

	bytes, err := i.GetFile(r.Context(), service, path)
	if err != nil {
		log.Error(r.Context(), "Could not get file", zap.Error(err))
		render.Status(r, http.StatusBadRequest)
		render.Data(w, r, []byte(`Could not get file`))
		return
	}

	w.Header().Set("Content-Type", mime.TypeByExtension(filepath.Ext(path)))
	render.Data(w, r, bytes)
}

// Mount mounts the TechDocs plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var techdocsInstances []instance.Instance

	for _, i := range instances {
		techdocsInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		techdocsInstances = append(techdocsInstances, techdocsInstance)
	}

	router := Router{
		chi.NewRouter(),
		techdocsInstances,
	}

	router.Get("/indexes", router.getIndexes)
	router.Get("/index", router.getIndex)
	router.Get("/markdown", router.getMarkdown)
	router.Get("/file", router.getFile)

	return router, nil
}
