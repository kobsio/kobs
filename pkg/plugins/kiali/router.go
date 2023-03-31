package kiali

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/kiali/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/utils/middleware/pluginproxy"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Kiali instance by it's name. If we couldn't found an instance with the provided name and
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

func (router *Router) getNamespaces(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "getNamespaces", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	namespaces, err := i.GetNamespaces(r.Context())
	if err != nil {
		log.Error(r.Context(), "Failed to get namespaces", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get namespaces")
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
	application := r.URL.Query().Get("application")
	duration := r.URL.Query().Get("duration")
	graphType := r.URL.Query().Get("graphType")
	groupBy := r.URL.Query().Get("groupBy")
	injectServiceNodes := r.URL.Query().Get("injectServiceNodes")
	appenders := r.URL.Query()["appender"]
	namespaces := r.URL.Query()["namespace"]

	log.Debug(r.Context(), "getGraph", zap.String("name", name), zap.String("duration", duration), zap.String("graphType", graphType), zap.String("groupBy", groupBy), zap.String("injecteServiceNodes", injectServiceNodes), zap.Strings("appenders", appenders), zap.Strings("namespaces", namespaces))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	parsedDuration, err := strconv.ParseInt(duration, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Failed to parse duration parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse duration parameter")
		return
	}

	parsedInjectServiceNodes, err := strconv.ParseBool(injectServiceNodes)
	if err != nil {
		log.Error(r.Context(), "Failed to parse injectServiceNodes parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse injectServiceNodes parameter")
		return
	}

	if application != "" && len(namespaces) == 1 {
		graph, err := i.GetApplicationGraph(r.Context(), namespaces[0], application, parsedDuration, graphType, groupBy, parsedInjectServiceNodes, appenders)
		if err != nil {
			log.Error(r.Context(), "Failed to get topology graph", zap.Error(err))
			errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get topology graph")
			return
		}

		render.JSON(w, r, graph)
		return
	}

	graph, err := i.GetGraph(r.Context(), parsedDuration, graphType, groupBy, parsedInjectServiceNodes, appenders, namespaces)
	if err != nil {
		log.Error(r.Context(), "Failed to get topology graph", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get topology graph")
		return
	}

	render.JSON(w, r, graph)
}

func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	url := r.URL.Query().Get("url")

	log.Debug(r.Context(), "getMetrics", zap.String("name", name), zap.String("url", url))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	metrics, err := i.GetMetrics(r.Context(), url)
	if err != nil {
		log.Error(r.Context(), "Failed to get metrics", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get metrics")
		return
	}

	render.JSON(w, r, metrics)
}

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

	proxy := pluginproxy.New(clustersClient)

	router.With(proxy).Get("/namespaces", router.getNamespaces)
	router.With(proxy).Get("/graph", router.getGraph)
	router.With(proxy).Get("/metrics", router.getMetrics)

	return router, nil
}
