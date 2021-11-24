package techdocs

import (
	"mime"
	"net/http"
	"path/filepath"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/techdocs/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const (
	Route = "/techdocs"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "techdocs"})
)

// Config is the structure of the configuration for the techdocs plugin.
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

func (router *Router) getIndexes(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	log.WithFields(logrus.Fields{"name": name}).Tracef("getTechDocs")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	indexes, err := i.GetIndexes(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get indexes")
		return
	}

	render.JSON(w, r, indexes)
}

func (router *Router) getIndex(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	service := r.URL.Query().Get("service")

	log.WithFields(logrus.Fields{"name": name, "service": service}).Tracef("getTechDoc")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	index, err := i.GetIndex(r.Context(), service)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get index")
		return
	}

	render.JSON(w, r, index)
}

func (router *Router) getMarkdown(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	service := r.URL.Query().Get("service")
	path := r.URL.Query().Get("path")

	log.WithFields(logrus.Fields{"name": name, "service": service, "path": path}).Tracef("getMarkdown")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	markdown, err := i.GetMarkdown(r.Context(), service, path)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get markdown")
		return
	}

	render.JSON(w, r, markdown)
}

func (router *Router) getFile(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	service := r.URL.Query().Get("service")
	path := r.URL.Query().Get("path")

	log.WithFields(logrus.Fields{"name": name, "service": service, "path": path}).Tracef("getFile")

	i := router.getInstance(name)
	if i == nil {
		render.Status(r, http.StatusBadRequest)
		render.Data(w, r, []byte(`Could not find instance name`))
		return
	}

	bytes, err := i.GetFile(r.Context(), service, path)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.Data(w, r, []byte(`Could not get file`))
		return
	}

	w.Header().Set("Content-Type", mime.TypeByExtension(filepath.Ext(path)))
	render.Data(w, r, bytes)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"name": cfg.Name}).Fatalf("Could not create TechDocs instance")
		}

		instances = append(instances, instance)

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "techdocs",
		})
	}

	router := Router{
		chi.NewRouter(),
		clusters,
		instances,
	}

	router.Get("/indexes/{name}", router.getIndexes)
	router.Get("/index/{name}", router.getIndex)
	router.Get("/markdown/{name}", router.getMarkdown)
	router.Get("/file/{name}", router.getFile)

	return router
}
