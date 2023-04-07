package techdocs

import (
	"mime"
	"net/http"
	"path/filepath"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/techdocs/instance"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a TechDocs instance by it's name. If we couldn't found an instance with the provided name and
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

func (router *Router) getIndexes(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "getIndexes", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	indexes, err := i.GetIndexes(r.Context())
	if err != nil {
		log.Error(r.Context(), "Failed to get indexes", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get indexes")
		return
	}

	render.JSON(w, r, indexes)
}

func (router *Router) getIndex(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	service := r.URL.Query().Get("service")

	log.Debug(r.Context(), "getIndex", zap.String("name", name), zap.String("service", service))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	index, err := i.GetIndex(r.Context(), service)
	if err != nil {
		log.Error(r.Context(), "Failed to get index", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get index")
		return
	}

	render.JSON(w, r, index)
}

func (router *Router) getMarkdown(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	service := r.URL.Query().Get("service")
	path := r.URL.Query().Get("path")

	log.Debug(r.Context(), "getMarkdown", zap.String("name", name), zap.String("service", service), zap.String("path", path))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	markdown, err := i.GetMarkdown(r.Context(), service, path)
	if err != nil {
		log.Error(r.Context(), "Failed to get markdown", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get markdown")
		return
	}

	render.JSON(w, r, markdown)
}

func (router *Router) getFile(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("x-kobs-plugin")
	service := r.URL.Query().Get("service")
	path := r.URL.Query().Get("path")

	log.Debug(r.Context(), "getFile", zap.String("name", name), zap.String("service", service), zap.String("path", path))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		render.Status(r, http.StatusBadRequest)
		render.Data(w, r, []byte(`Invalid plugin instance`))
		return
	}

	bytes, err := i.GetFile(r.Context(), service, path)
	if err != nil {
		log.Error(r.Context(), "Failed to get file", zap.Error(err))
		render.Status(r, http.StatusInternalServerError)
		render.Data(w, r, []byte(`Failed to get file`))
		return
	}

	w.Header().Set("Content-Type", mime.TypeByExtension(filepath.Ext(path)))
	render.Data(w, r, bytes)
}

func Mount(instances []plugin.Instance) (chi.Router, error) {
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
