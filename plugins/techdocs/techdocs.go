package techdocs

import (
	"mime"
	"net/http"
	"path/filepath"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/techdocs/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const (
	Route = "/techdocs"
)

// Config is the structure of the configuration for the techdocs plugin.
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

func (router *Router) getIndexes(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

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
	name := chi.URLParam(r, "name")
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
	name := chi.URLParam(r, "name")
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
	name := chi.URLParam(r, "name")
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

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.Fatal(nil, "Could not create TechDocs instance", zap.Error(err), zap.String("name", cfg.Name))
		}

		instances = append(instances, instance)

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Home:        cfg.Home,
			Type:        "techdocs",
		})
	}

	router := Router{
		chi.NewRouter(),
		instances,
	}

	router.Route("/{name}", func(r chi.Router) {
		r.Get("/indexes", router.getIndexes)
		r.Get("/index", router.getIndex)
		r.Get("/markdown", router.getMarkdown)
		r.Get("/file", router.getFile)
	})

	return router
}
