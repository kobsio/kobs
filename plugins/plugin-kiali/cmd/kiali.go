package main

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-kiali/pkg/instance"
	"go.uber.org/zap"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

// Router implements the router for the Kiali plugin, which can be registered in the router for our rest api. It contains
// the api routes for the Kiali plugin and it's configuration.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Kiali instance by it's name. If we couldn't found an instance with the provided name and the
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

func (router *Router) getNamespaces(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "Get namespaces parameters", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	namespaces, err := i.GetNamespaces(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not get namespaces", zap.Error(err))
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
	name := r.Header.Get("x-kobs-plugin")
	duration := r.URL.Query().Get("duration")
	graphType := r.URL.Query().Get("graphType")
	groupBy := r.URL.Query().Get("groupBy")
	injectServiceNodes := r.URL.Query().Get("injectServiceNodes")
	appenders := r.URL.Query()["appender"]
	namespaces := r.URL.Query()["namespace"]

	log.Debug(r.Context(), "Get graph parameters", zap.String("name", name), zap.String("duration", duration), zap.String("graphType", graphType), zap.String("groupBy", groupBy), zap.String("injecteServiceNodes", injectServiceNodes), zap.Strings("appenders", appenders), zap.Strings("namespaces", namespaces))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedDuration, err := strconv.ParseInt(duration, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse duration parameter", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse duration parameter")
		return
	}

	parsedInjectServiceNodes, err := strconv.ParseBool(injectServiceNodes)
	if err != nil {
		log.Error(r.Context(), "Could not parse inject service nodes parameter", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse inject service nodes parameter")
		return
	}

	graph, err := i.GetGraph(r.Context(), parsedDuration, graphType, groupBy, parsedInjectServiceNodes, appenders, namespaces)
	if err != nil {
		log.Error(r.Context(), "Could not get topology graph", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get topology graph")
		return
	}

	render.JSON(w, r, graph)
}

func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	url := r.URL.Query().Get("url")

	log.Debug(r.Context(), "Get metrics parameters", zap.String("name", name), zap.String("url", url))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	metrics, err := i.GetMetrics(r.Context(), url)
	if err != nil {
		log.Error(r.Context(), "Could not get metrics", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get metrics")
		return
	}

	render.JSON(w, r, metrics)
}

// Mount mounts the Kiali plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var kialiInstances []instance.Instance

	for _, i := range instances {
		kialiInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		kialiInstances = append(kialiInstances, kialiInstance)
	}

	router := Router{
		chi.NewRouter(),
		kialiInstances,
	}

	router.Get("/namespaces", router.getNamespaces)
	router.Get("/graph", router.getGraph)
	router.Get("/metrics", router.getMetrics)

	return router, nil
}
