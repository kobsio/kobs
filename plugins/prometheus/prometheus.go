package prometheus

import (
	"encoding/json"
	"net/http"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/prometheus/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/prometheus"

var (
	log = logrus.WithFields(logrus.Fields{"package": "prometheus"})
)

// Config is the structure of the configuration for the prometheus plugin.
type Config []instance.Config

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clusters  *clusters.Clusters
	instances []*instance.Instance
}

// getVariableRequest
type getVariableRequest struct {
	Label     string `json:"label"`
	Query     string `json:"query"`
	TimeStart int64  `json:"timeStart"`
	TimeEnd   int64  `json:"timeEnd"`
	Type      string `json:"type"`
}

// getMetricsRequest is the format of the request body for the getMetrics request. To get metrics from a Prometheus
// instance we need at least one query and the start and end time. Optionally the user can also set a resolution for the
// metrics to overwrite the default one.
type getMetricsRequest struct {
	Queries    []instance.Query `json:"queries"`
	Resolution string           `json:"Resolution"`
	TimeStart  int64            `json:"timeStart"`
	TimeEnd    int64            `json:"timeEnd"`
}

func (router *Router) getInstance(name string) *instance.Instance {
	for _, i := range router.instances {
		if i.Name == name {
			return i
		}
	}

	return nil
}

// getVariable returns a list of variable values for a given label and query. The query and label are provided in the
// request body. The body also contains the type which should be used to get determine the label values and the start
// and end time. The Prometheus instance which should be used is defined via the name path parameter. All values are
// then passed to this instance via the GetVariable method.
func (router *Router) getVariable(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	log.WithFields(logrus.Fields{"name": name}).Tracef("getVariables")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var data getVariableRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	values, err := i.GetVariable(r.Context(), data.Label, data.Query, data.Type, data.TimeStart, data.TimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get variable")
		return
	}

	log.WithFields(logrus.Fields{"values": len(values)}).Tracef("getVariables")
	render.JSON(w, r, values)
}

// getMetrics returns a list of metrics for the queries specified in the request body. To get the metrics we have to
// select the correct Prometheus instance, by the name path paramter. After that we can use the GetMetrics function of
// the instance to get a list of metrics.
func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	log.WithFields(logrus.Fields{"name": name}).Tracef("getMetrics")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var data getMetricsRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	metrics, err := i.GetMetrics(r.Context(), data.Queries, data.Resolution, data.TimeStart, data.TimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	log.WithFields(logrus.Fields{"metrics": len(metrics.Metrics)}).Tracef("getMetrics")
	render.JSON(w, r, metrics)
}

// getTable returns a table for a list of given Prometheus queries. The name of the Prometheus instance is set as path
// parameter. After we got the Prometheus instance, we are calling the GetTableData function of this instance to get a
// map of rows, which is then returned to the user.
func (router *Router) getTable(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	log.WithFields(logrus.Fields{"name": name}).Tracef("getTable")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var data getMetricsRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	rows, err := i.GetTableData(r.Context(), data.Queries, data.TimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	log.WithFields(logrus.Fields{"rows": len(rows)}).Tracef("getTable")
	render.JSON(w, r, rows)
}

// getLabels returns a list of label values for the given searchTearm. The Prometheus instance is selected by the name
// path parameter.
func (router *Router) getLabels(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	searchTerm := r.URL.Query().Get("searchTerm")

	log.WithFields(logrus.Fields{"name": name, "searchTerm": searchTerm}).Tracef("getLabels")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	labelValues, err := i.GetLabelValues(r.Context(), searchTerm)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get label values")
		return
	}

	log.WithFields(logrus.Fields{"labelValues": len(labelValues)}).Tracef("getLabels")
	render.JSON(w, r, labelValues)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) (chi.Router, []*instance.Instance) {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"name": cfg.Name}).Fatalf("Could not create Prometheus instance")
		}

		instances = append(instances, instance)

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "prometheus",
		})
	}

	router := Router{
		chi.NewRouter(),
		clusters,
		instances,
	}

	router.Post("/variable/{name}", router.getVariable)
	router.Post("/metrics/{name}", router.getMetrics)
	router.Post("/table/{name}", router.getTable)
	router.Get("/labels/{name}", router.getLabels)

	return router, instances
}
