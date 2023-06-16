package datadog

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/datadog/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/DataDog/datadog-api-client-go/v2/api/datadogV2"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Datadog instance by it's name. If we couldn't found an instance with the provided name and
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

func (router *Router) getLogs(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get logs paramters", zap.String("name", name), zap.String("query", query), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
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

	buckets, err := i.GetLogsAggregation(r.Context(), query, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get logs aggregation", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get logs aggregation")
		return
	}

	logs, err := i.GetLogs(r.Context(), query, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get logs", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get logs")
		return
	}

	data := struct {
		Buckets []datadogV2.LogsAggregateBucket `json:"buckets"`
		Logs    []datadogV2.Log                 `json:"logs"`
	}{
		Buckets: buckets,
		Logs:    logs,
	}

	render.JSON(w, r, data)
}

func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get metrics paramters", zap.String("name", name), zap.String("query", query), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
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

	metrics, err := i.GetMetrics(r.Context(), query, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get metrics", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get metrics")
		return
	}

	render.JSON(w, r, metrics)
}

func Mount(instances []plugin.Instance) (chi.Router, error) {
	var datadogInstances []instance.Instance

	for _, i := range instances {
		datadogInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}
		datadogInstances = append(datadogInstances, datadogInstance)
	}

	router := Router{
		chi.NewRouter(),
		datadogInstances,
	}

	router.Get("/logs", router.getLogs)
	router.Get("/metrics", router.getMetrics)

	return router, nil
}
