package istio

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/istio/pkg/instance"
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

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config, prometheusInstances []*prometheusInstance.Instance) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg, prometheusInstances)
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"name": cfg.Name}).Fatalf("Could not create Istio instance")
		}

		instances = append(instances, instance)

		var options map[string]interface{}
		options = make(map[string]interface{})
		options["prometheus"] = cfg.Prometheus.Enabled

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

	router.Get("/namespaces/{name}", router.getNamespaces)
	router.Get("/metrics/{name}", router.getMetrics)
	router.Get("/topology/{name}", router.getTopology)

	return router
}
