package istio

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/istio/pkg/instance"
	klogsInstance "github.com/kobsio/kobs/plugins/klogs/pkg/instance"
	prometheusInstance "github.com/kobsio/kobs/plugins/prometheus/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const (
	Route = "/istio"
)

// Config is the structure of the configuration for the Istio plugin.
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
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get namespaces paraemters.", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	namespaces, err := i.GetNamespaces(r.Context(), parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get namespaces.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get namespaces")
		return
	}

	log.Debug(r.Context(), "Get namespaces result.", zap.Int("namespacesCount", len(namespaces)))
	render.JSON(w, r, namespaces)
}

func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")
	label := r.URL.Query().Get("label")
	groupBy := r.URL.Query().Get("groupBy")
	reporter := r.URL.Query().Get("reporter")
	application := r.URL.Query().Get("application")
	namespaces := r.URL.Query()["namespace"]

	log.Debug(r.Context(), "Get metrics parameters.", zap.String("name", name), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd), zap.String("label", label), zap.String("groupBy", groupBy), zap.String("reporter", reporter), zap.String("application", application), zap.Strings("namespaces", namespaces))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	metrics, err := i.GetMetrics(r.Context(), namespaces, application, label, groupBy, reporter, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get metrics.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	render.JSON(w, r, metrics)
}

func (router *Router) getMetricsDetails(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")
	metric := r.URL.Query().Get("metric")
	reporter := r.URL.Query().Get("reporter")
	destinationWorkload := r.URL.Query().Get("destinationWorkload")
	destinationWorkloadNamespace := r.URL.Query().Get("destinationWorkloadNamespace")
	destinationVersion := r.URL.Query().Get("destinationVersion")
	destinationService := r.URL.Query().Get("destinationService")
	sourceWorkload := r.URL.Query().Get("sourceWorkload")
	sourceWorkloadNamespace := r.URL.Query().Get("sourceWorkloadNamespace")
	pod := r.URL.Query().Get("pod")

	log.Debug(r.Context(), "Get metrics details paramters.", zap.String("name", name), zap.String("timeEnd", timeEnd), zap.String("timeStart", timeStart), zap.String("metric", metric), zap.String("reporter", reporter), zap.String("destinationWorkload", destinationWorkload), zap.String("destinationWorkloadNamespace", destinationWorkloadNamespace), zap.String("destinationVersion", destinationVersion), zap.String("destinationService", destinationService), zap.String("sourceWorkload", sourceWorkload), zap.String("sourceWorkloadNamespace", sourceWorkloadNamespace), zap.String("pod", pod))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	metrics, err := i.GetMetricsDetails(r.Context(), metric, reporter, destinationWorkload, destinationWorkloadNamespace, destinationVersion, destinationService, sourceWorkload, sourceWorkloadNamespace, pod, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get metrics.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	render.JSON(w, r, metrics)
}

func (router *Router) getMetricsPod(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")
	metric := r.URL.Query().Get("metric")
	namespace := r.URL.Query().Get("namespace")
	pod := r.URL.Query().Get("pod")

	log.Debug(r.Context(), "Get metrics pod parameters.", zap.String("name", name), zap.String("timeEnd", timeEnd), zap.String("timeStart", timeStart), zap.String("metric", metric), zap.String("namespace", namespace), zap.String("pod", pod))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	metrics, err := i.GetMetricsPod(r.Context(), metric, namespace, pod, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get metrics.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	render.JSON(w, r, metrics)
}

func (router *Router) getTopology(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")
	namespace := r.URL.Query().Get("namespace")
	application := r.URL.Query().Get("application")

	log.Debug(r.Context(), "Get topology parameters.", zap.String("name", name), zap.String("namespace", namespace), zap.String("application", application), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	edges, nodes, err := i.GetTopology(r.Context(), namespace, application, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get metrics.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	data := struct {
		Edges []instance.Edge `json:"edges"`
		Nodes []instance.Node `json:"nodes"`
	}{
		edges,
		nodes,
	}

	log.Debug(r.Context(), "Get topology result.", zap.Int("edges", len(edges)), zap.Int("nodes", len(nodes)))
	render.JSON(w, r, data)
}

func (router *Router) getTap(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")
	application := r.URL.Query().Get("application")
	namespace := r.URL.Query().Get("namespace")
	filterUpstreamCluster := r.URL.Query().Get("filterUpstreamCluster")
	filterMethod := r.URL.Query().Get("filterMethod")
	filterPath := r.URL.Query().Get("filterPath")

	log.Debug(r.Context(), "Get tap paramters.", zap.String("name", name), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd), zap.String("application", application), zap.String("namespace", namespace), zap.String("filterUpstreamCluster", filterUpstreamCluster), zap.String("filterMethod", filterMethod), zap.String("filterPath", filterPath))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	logs, err := i.Tap(r.Context(), namespace, application, filterUpstreamCluster, filterMethod, filterPath, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get logs.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get logs")
		return
	}

	log.Debug(r.Context(), "Get tap results.", zap.Int("logsCount", len(logs)))
	render.JSON(w, r, logs)
}

func (router *Router) getTop(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")
	application := r.URL.Query().Get("application")
	namespace := r.URL.Query().Get("namespace")
	filterUpstreamCluster := r.URL.Query().Get("filterUpstreamCluster")
	filterMethod := r.URL.Query().Get("filterMethod")
	filterPath := r.URL.Query().Get("filterPath")
	sortBy := r.URL.Query().Get("sortBy")
	sortDirection := r.URL.Query().Get("sortDirection")

	log.Debug(r.Context(), "Get top paramters.", zap.String("name", name), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd), zap.String("application", application), zap.String("namespace", namespace), zap.String("filterUpstreamCluster", filterUpstreamCluster), zap.String("filterMethod", filterMethod), zap.String("filterPath", filterPath))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	logs, err := i.Top(r.Context(), namespace, application, filterUpstreamCluster, filterMethod, filterPath, sortBy, sortDirection, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get logs.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get logs")
		return
	}

	log.Debug(r.Context(), "Get top results.", zap.Int("logsCount", len(logs)))
	render.JSON(w, r, logs)
}

func (router *Router) getTopDetails(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")
	application := r.URL.Query().Get("application")
	namespace := r.URL.Query().Get("namespace")
	upstreamCluster := r.URL.Query().Get("upstreamCluster")
	method := r.URL.Query().Get("method")
	path := r.URL.Query().Get("path")

	log.Debug(r.Context(), "Get Top details parameters.", zap.String("name", name), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd), zap.String("application", application), zap.String("namespace", namespace), zap.String("upstreamCluster", upstreamCluster), zap.String("method", method), zap.String("path", path))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	metrics, err := i.TopDetails(r.Context(), namespace, application, upstreamCluster, method, path, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get metrics.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get success rate")
		return
	}

	render.JSON(w, r, metrics)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config, prometheusInstances []*prometheusInstance.Instance, klogsInstances []*klogsInstance.Instance) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg, prometheusInstances, klogsInstances)
		if err != nil {
			log.Fatal(nil, "Could not create Istio instance.", zap.Error(err), zap.String("name", cfg.Name))
		}

		instances = append(instances, instance)

		var options map[string]interface{}
		options = make(map[string]interface{})
		options["prometheus"] = cfg.Prometheus.Enabled
		options["klogs"] = cfg.Klogs.Enabled

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "istio",
			Options:     options,
		})
	}

	router := Router{
		chi.NewRouter(),
		clusters,
		instances,
	}

	router.Route("/{name}", func(r chi.Router) {
		r.Get("/namespaces", router.getNamespaces)
		r.Get("/metrics", router.getMetrics)
		r.Get("/metricsdetails", router.getMetricsDetails)
		r.Get("/metricspod", router.getMetricsPod)
		r.Get("/topology", router.getTopology)
		r.Get("/tap", router.getTap)
		r.Get("/top", router.getTop)
		r.Get("/topdetails", router.getTopDetails)
	})

	return router
}
