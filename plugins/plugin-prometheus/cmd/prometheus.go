package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-prometheus/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Router implements the router for the Prometheus plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getVariableRequest is the format of the request body for the getVariable request. The endpoint can be used to use
// Prometheus as source for a variable in a dashboard.
type getVariableRequest struct {
	Label string `json:"label"`
	Query string `json:"query"`
	Type  string `json:"type"`
}

// getInsightRequest is the format of the request body for the getInsight request. The endpoint can be used to use
// Prometheus as source for an application insight.
type getInsightRequest struct {
	Query string `json:"query"`
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

// getInstance returns a Prometheus instance by it's name. If we couldn't found an instance with the provided name and
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

// getVariable returns a list of variable values for a given label and query. The query and label are provided in the
// request body. The body also contains the type which should be used to get determine the label values and the start
// and end time. The Prometheus instance which should be used is defined via the name path parameter. All values are
// then passed to this instance via the GetVariable method.
func (router *Router) getVariable(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get variables parameters", zap.String("name", name), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	var data getVariableRequest

	err = json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	values, err := i.GetVariable(r.Context(), data.Label, data.Query, data.Type, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get variable", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get variable")
		return
	}

	log.Debug(r.Context(), "Get variables result", zap.Int("valuesCount", len(values)))
	render.JSON(w, r, values)
}

// getInsight returns the datapoints to render a insight chart for an application using the specified Prometheus
// instance and query.
func (router *Router) getInsight(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get insight parameters", zap.String("name", name), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	var data getInsightRequest

	err = json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	values, err := i.GetMetrics(r.Context(), []instance.Query{{Label: "", Query: data.Query}}, "", parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get insight data", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get insight data")
		return
	}

	if len(values.Metrics) != 1 {
		log.Error(r.Context(), "Could not get insight data", zap.Error(err), zap.Int("metricsCount", len(values.Metrics)))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get insight data")
		return
	}

	log.Debug(r.Context(), "Get insight result", zap.Int("dataCount", len(values.Metrics[0].Data)))
	render.JSON(w, r, values.Metrics[0].Data)
}

// getMetrics returns a list of metrics for the queries specified in the request body. To get the metrics we have to
// select the correct Prometheus instance, by the name path paramter. After that we can use the GetMetrics function of
// the instance to get a list of metrics.
func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "Get metrics parameters", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var data getMetricsRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	metrics, err := i.GetMetrics(r.Context(), data.Queries, data.Resolution, data.TimeStart, data.TimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get metrics", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	log.Debug(r.Context(), "Get metrics result", zap.Int("metricsCount", len(metrics.Metrics)))
	render.JSON(w, r, metrics)
}

// getTable returns a table for a list of given Prometheus queries. The name of the Prometheus instance is set as path
// parameter. After we got the Prometheus instance, we are calling the GetTableData function of this instance to get a
// map of rows, which is then returned to the user.
func (router *Router) getTable(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "Get table parameters", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var data getMetricsRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	rows, err := i.GetTableData(r.Context(), data.Queries, data.TimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get metrics", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	log.Debug(r.Context(), "Get table results", zap.Int("rowsCount", len(rows)))
	render.JSON(w, r, rows)
}

// getLabels returns a list of label values for the given searchTearm. The Prometheus instance is selected by the name
// path parameter.
func (router *Router) getLabels(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	searchTerm := r.URL.Query().Get("searchTerm")

	log.Debug(r.Context(), "Get labels parameters", zap.String("name", name), zap.String("searchTerm", searchTerm))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	labelValues, err := i.GetLabelValues(r.Context(), searchTerm)
	if err != nil {
		log.Error(r.Context(), "Could not get label values", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get label values")
		return
	}

	log.Debug(r.Context(), "Get labels result", zap.Int("labelValuesCount", len(labelValues)))
	render.JSON(w, r, labelValues)
}

// Mount mounts the Prometheus plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var prometheusInstances []instance.Instance

	for _, i := range instances {
		prometheusInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		prometheusInstances = append(prometheusInstances, prometheusInstance)
	}

	router := Router{
		chi.NewRouter(),
		prometheusInstances,
	}

	router.Post("/variable", router.getVariable)
	router.Post("/insight", router.getInsight)
	router.Post("/metrics", router.getMetrics)
	router.Post("/table", router.getTable)
	router.Get("/labels", router.getLabels)

	return router, nil
}
