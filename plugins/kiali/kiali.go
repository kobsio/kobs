package kiali

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/kiali/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/kiali"

// Config is the structure of the configuration for the kiali plugin.
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

func (router *Router) getNamespaces(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	log.Debug(r.Context(), "Get namespaces parameters.", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	namespaces, err := i.GetNamespaces(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not get namespaces.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get namespaces")
		return
	}

	var namespaceNames []string
	for _, namespace := range namespaces {
		namespaceNames = append(namespaceNames, namespace.Name)
	}

	render.JSON(w, r, namespaceNames)
}

func (router *Router) getGraph(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	duration := r.URL.Query().Get("duration")
	graphType := r.URL.Query().Get("graphType")
	groupBy := r.URL.Query().Get("groupBy")
	injectServiceNodes := r.URL.Query().Get("injectServiceNodes")
	appenders := r.URL.Query()["appender"]
	namespaces := r.URL.Query()["namespace"]

	log.Debug(r.Context(), "Get graph parameters.", zap.String("name", name), zap.String("duration", duration), zap.String("graphType", graphType), zap.String("groupBy", groupBy), zap.String("injecteServiceNodes", injectServiceNodes), zap.Strings("appenders", appenders), zap.Strings("namespaces", namespaces))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedDuration, err := strconv.ParseInt(duration, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse duration parameter.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse duration parameter")
		return
	}

	parsedInjectServiceNodes, err := strconv.ParseBool(injectServiceNodes)
	if err != nil {
		log.Error(r.Context(), "Could not parse inject service nodes parameter.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse inject service nodes parameter")
		return
	}

	graph, err := i.GetGraph(r.Context(), parsedDuration, graphType, groupBy, parsedInjectServiceNodes, appenders, namespaces)
	if err != nil {
		log.Error(r.Context(), "Could not get topology graph.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get topology graph")
		return
	}

	render.JSON(w, r, graph)
}

func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	url := r.URL.Query().Get("url")

	log.Debug(r.Context(), "Get metrics parameters.", zap.String("name", name), zap.String("url", url))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	metrics, err := i.GetMetrics(r.Context(), url)
	if err != nil {
		log.Error(r.Context(), "Could not get metrics.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get metrics")
		return
	}

	render.JSON(w, r, metrics)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.Fatal(nil, "Could not create Kiali instance.", zap.Error(err), zap.String("name", cfg.Name))
		}

		instances = append(instances, instance)

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "kiali",
		})
	}

	router := Router{
		chi.NewRouter(),
		clusters,
		instances,
	}

	router.Route("/{name}", func(r chi.Router) {
		r.Get("/namespaces", router.getNamespaces)
		r.Get("/graph", router.getGraph)
		r.Get("/metrics", router.getMetrics)
	})

	return router
}
