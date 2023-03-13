package prometheus

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/plugins"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/prometheus/instance"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/utils/middleware/pluginproxy"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Router implements the chi router interface for the Prometheus plugin, which can be registered in the router for our
// rest API. Next to the `chi.Mux` it also contains a clustersClient, which will be `nil` when mounted at a cluster and
// the instances which were configured by a user.
type Router struct {
	*chi.Mux
	clustersClient clusters.Client
	instances      []instance.Instance
}

// getVariableRequest is the format of the request body for the getVariable request. The request body must contain a
// label to determine which Prometheus label will be used for the variable values, a query to get these values and a
// type which specifies how the labels are retrieved from the query.
type getVariableRequest struct {
	Label string `json:"label"`
	Query string `json:"query"`
	Type  string `json:"type"`
}

// getInsightRequest is the format of the request body for the getInsight request. To get the values for the insights
// the request must contain a valid PromQL query.
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
// request body. The body also contains the type which should be used to get the label values. The start and end time is
// required to set the time range in which we should use for the values. The Prometheus instance which should be used is
// defined via the `x-kobs-plugin` header. All values are then passed to this instance via the GetVariable method.
func (router *Router) getVariable(w http.ResponseWriter, r *http.Request) {
	cluster := r.Header.Get("x-kobs-cluster")
	name := r.Header.Get("x-kobs-plugin")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "getVariable", zap.String("cluster", cluster), zap.String("name", name), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	// If the `clustersClient` is not nil and the provided cluster name does not matche the name of the hub, we proxy
	// the request to the corresponding cluster. If the hub cluster was selected the request will be directly handled
	// within the hub and the configured Prometheus instances.
	if router.clustersClient != nil && cluster != plugins.HubClusterName {
		c := router.clustersClient.GetCluster(cluster)
		if c == nil {
			log.Error(r.Context(), "Invalid cluster name", zap.String("name", name))
			errresponse.Render(w, r, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		c.Proxy(w, r)
		return
	}

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Failed to parse 'timeStart' parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse 'timeStart' parameter")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Failed to parse 'timeEnd' parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse 'timeEnd' parameter")
		return
	}

	var data getVariableRequest

	err = json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	values, err := i.GetVariable(r.Context(), data.Label, data.Query, data.Type, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get variable values", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get variable values")
		return
	}

	log.Debug(r.Context(), "getVariable", zap.Int("valuesCount", len(values)))
	render.JSON(w, r, values)
}

// getInsight returns the datapoints to render a insight chart for an application using the specified Prometheus
// instance and query.
func (router *Router) getInsight(w http.ResponseWriter, r *http.Request) {
	cluster := r.Header.Get("x-kobs-cluster")
	name := r.Header.Get("x-kobs-plugin")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "getInsight", zap.String("cluster", cluster), zap.String("name", name), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	// If the `clustersClient` is not nil and the provided cluster name does not matche the name of the hub, we proxy
	// the request to the corresponding cluster. If the hub cluster was selected the request will be directly handled
	// within the hub and the configured Prometheus instances.
	if router.clustersClient != nil && cluster != plugins.HubClusterName {
		c := router.clustersClient.GetCluster(cluster)
		if c == nil {
			log.Error(r.Context(), "Invalid cluster name", zap.String("name", name))
			errresponse.Render(w, r, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		c.Proxy(w, r)
		return
	}

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Failed to parse 'timeStart' parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse 'timeStart' parameter")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Failed to parse 'timeEnd' parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse 'timeEnd' parameter")
		return
	}

	var data getInsightRequest

	err = json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	values, err := i.GetRange(r.Context(), []instance.Query{{Label: "", Query: data.Query}}, "", parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get insight data", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get insight data")
		return
	}

	if len(values.Metrics) != 1 {
		log.Error(r.Context(), "Invalid insight data, insight data contains more then 1 metrics", zap.Error(err), zap.Int("metricsCount", len(values.Metrics)))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid insight data, insight data contains more then 1 metrics")
		return
	}

	log.Debug(r.Context(), "getInsight", zap.Int("dataCount", len(values.Metrics[0].Data)))
	render.JSON(w, r, values.Metrics[0].Data)
}

// getRange returns a list of metrics for the queries specified in the request body. To get the metrics we have to
// select the correct Prometheus instance, by the name path paramter. After that we can use the GetMetrics function of
// the instance to get a list of metrics.
func (router *Router) getRange(w http.ResponseWriter, r *http.Request) {
	cluster := r.Header.Get("x-kobs-cluster")
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "getMetrics", zap.String("cluster", cluster), zap.String("name", name))

	// If the `clustersClient` is not nil and the provided cluster name does not matche the name of the hub, we proxy
	// the request to the corresponding cluster. If the hub cluster was selected the request will be directly handled
	// within the hub and the configured Prometheus instances.
	if router.clustersClient != nil && cluster != plugins.HubClusterName {
		c := router.clustersClient.GetCluster(cluster)
		if c == nil {
			log.Error(r.Context(), "Invalid cluster name", zap.String("name", name))
			errresponse.Render(w, r, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		c.Proxy(w, r)
		return
	}

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	var data getMetricsRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	metrics, err := i.GetRange(r.Context(), data.Queries, data.Resolution, data.TimeStart, data.TimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get metrics", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get metrics")
		return
	}

	log.Debug(r.Context(), "getMetrics", zap.Int("metricsCount", len(metrics.Metrics)))
	render.JSON(w, r, metrics)
}

// getInstant returns a table for a list of given Prometheus queries. The name of the Prometheus instance is set as path
// parameter. After we got the Prometheus instance, we are calling the GetInstant function of this instance to get a
// map of rows, which is then returned to the user.
func (router *Router) getInstant(w http.ResponseWriter, r *http.Request) {
	cluster := r.Header.Get("x-kobs-cluster")
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "getTable", zap.String("name", name))

	// If the `clustersClient` is not nil and the provided cluster name does not matche the name of the hub, we proxy
	// the request to the corresponding cluster. If the hub cluster was selected the request will be directly handled
	// within the hub and the configured Prometheus instances.
	if router.clustersClient != nil && cluster != plugins.HubClusterName {
		c := router.clustersClient.GetCluster(cluster)
		if c == nil {
			log.Error(r.Context(), "Invalid cluster name", zap.String("name", name))
			errresponse.Render(w, r, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		c.Proxy(w, r)
		return
	}

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	var data getMetricsRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	rows, err := i.GetInstant(r.Context(), data.Queries, data.TimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get metrics", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get metrics")
		return
	}

	log.Debug(r.Context(), "getTable", zap.Int("rowsCount", len(rows)))
	render.JSON(w, r, rows)
}

// getCompletions returns a list of completions for the Prometheus query editor. Currently it only returns all available
// metrics.
func (router *Router) getCompletions(w http.ResponseWriter, r *http.Request) {
	cluster := r.Header.Get("x-kobs-cluster")
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "getCompletions", zap.String("cluster", cluster), zap.String("name", name))

	// If the `clustersClient` is not nil and the provided cluster name does not matche the name of the hub, we proxy
	// the request to the corresponding cluster. If the hub cluster was selected the request will be directly handled
	// within the hub and the configured Prometheus instances.
	if router.clustersClient != nil && cluster != plugins.HubClusterName {
		c := router.clustersClient.GetCluster(cluster)
		if c == nil {
			log.Error(r.Context(), "Invalid cluster name", zap.String("name", name))
			errresponse.Render(w, r, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		c.Proxy(w, r)
		return
	}

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	metrics, err := i.GetMetrics(r.Context())
	if err != nil {
		log.Error(r.Context(), "Failed to get label values", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get label values")
		return
	}

	log.Debug(r.Context(), "getCompletions", zap.Int("metricsCount", len(metrics)))
	render.JSON(w, r, metrics)
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
		clustersClient,
		prometheusInstances,
	}

	proxy := pluginproxy.New(clustersClient)

	router.With(proxy).Post("/variable", router.getVariable)
	router.With(proxy).Post("/insight", router.getInsight)
	router.With(proxy).Post("/range", router.getRange)
	router.With(proxy).Post("/instant", router.getInstant)
	router.With(proxy).Get("/completions", router.getCompletions)

	return router, nil
}
