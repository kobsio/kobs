package istio

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/istio/pkg/instance"
	klogsInstance "github.com/kobsio/kobs/plugins/klogs/pkg/instance"
	prometheusInstance "github.com/kobsio/kobs/plugins/prometheus/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const (
	Route = "/istio"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "istio"})
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

	log.WithFields(logrus.Fields{"name": name}).Tracef("getNamespaces")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	namespaces, err := i.GetNamespaces(r.Context(), parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get namespaces")
		return
	}

	log.WithFields(logrus.Fields{"namespaces": len(namespaces)}).Tracef("getNamespaces")
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

	log.WithFields(logrus.Fields{"name": name}).Tracef("getMetrics")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	metrics, err := i.GetMetrics(r.Context(), namespaces, application, label, groupBy, reporter, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	log.Tracef("getMetrics")
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

	log.WithFields(logrus.Fields{"name": name, "timeEnd": timeEnd, "timeStart": timeStart, "metric": metric, "reporter": reporter, "destinationWorkload": destinationWorkload, "destinationWorkloadNamespace": destinationWorkloadNamespace, "destinationVersion": destinationVersion, "destinationService": destinationService, "sourceWorkload": sourceWorkload, "sourceWorkloadNamespace": sourceWorkloadNamespace, "pod": pod}).Tracef("getMetricsDetails")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	metrics, err := i.GetMetricsDetails(r.Context(), metric, reporter, destinationWorkload, destinationWorkloadNamespace, destinationVersion, destinationService, sourceWorkload, sourceWorkloadNamespace, pod, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	log.Tracef("getMetricsDetails")
	render.JSON(w, r, metrics)
}

func (router *Router) getMetricsPod(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")
	metric := r.URL.Query().Get("metric")
	namespace := r.URL.Query().Get("namespace")
	pod := r.URL.Query().Get("pod")

	log.WithFields(logrus.Fields{"name": name, "timeEnd": timeEnd, "timeStart": timeStart, "metric": metric, "namespace": namespace, "pod": pod}).Tracef("getMetricsPod")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	metrics, err := i.GetMetricsPod(r.Context(), metric, namespace, pod, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	log.Tracef("getMetricsPod")
	render.JSON(w, r, metrics)
}

func (router *Router) getTopology(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")
	namespace := r.URL.Query().Get("namespace")
	application := r.URL.Query().Get("application")

	log.WithFields(logrus.Fields{"name": name, "namespace": namespace, "application": application, "timeStart": timeStart, "timeEnd": timeEnd}).Tracef("getTopology")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	edges, nodes, err := i.GetTopology(r.Context(), namespace, application, parsedTimeStart, parsedTimeEnd)
	if err != nil {
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

	log.WithFields(logrus.Fields{"edges": len(edges), "nodes": len(nodes)}).Tracef("getTopology")
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

	log.WithFields(logrus.Fields{"name": name, "timeStart": timeStart, "timeEnd": timeEnd, "application": application, "namespace": namespace, "filterUpstreamCluster": filterUpstreamCluster, "filterMethod": filterMethod, "filterPath": filterPath}).Tracef("getTap")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	logs, err := i.Tap(r.Context(), namespace, application, filterUpstreamCluster, filterMethod, filterPath, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get logs")
		return
	}

	log.WithFields(logrus.Fields{"logs": len(logs)}).Tracef("getTap")
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

	log.WithFields(logrus.Fields{"name": name, "timeStart": timeStart, "timeEnd": timeEnd, "application": application, "namespace": namespace, "filterUpstreamCluster": filterUpstreamCluster, "filterMethod": filterMethod, "filterPath": filterPath}).Tracef("getTop")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	logs, err := i.Top(r.Context(), namespace, application, filterUpstreamCluster, filterMethod, filterPath, sortBy, sortDirection, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get logs")
		return
	}

	log.WithFields(logrus.Fields{"logs": len(logs)}).Tracef("getTop")
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

	log.WithFields(logrus.Fields{"name": name, "timeStart": timeStart, "timeEnd": timeEnd, "application": application, "namespace": namespace, "upstreamCluster": upstreamCluster, "method": method, "path": path}).Tracef("getTopDetails")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	metrics, err := i.TopDetails(r.Context(), namespace, application, upstreamCluster, method, path, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get success rate")
		return
	}

	log.Tracef("getTopDetails")
	render.JSON(w, r, metrics)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config, prometheusInstances []*prometheusInstance.Instance, klogsInstances []*klogsInstance.Instance) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg, prometheusInstances, klogsInstances)
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"name": cfg.Name}).Fatalf("Could not create Istio instance")
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
