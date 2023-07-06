package jaeger

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/jaeger/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/utils/middleware/pluginproxy"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Jaeger instance by it's name. If we couldn't found an instance with the provided name and
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

func (router *Router) getServices(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "getServices", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	err := i.GetServices(r.Context(), w)
	if err != nil {
		log.Error(r.Context(), "Failed to get services", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get services")
		return
	}
}

func (router *Router) getOperations(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	service := r.URL.Query().Get("service")

	log.Debug(r.Context(), "getOperations", zap.String("name", name), zap.String("service", service))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	err := i.GetOperations(r.Context(), w, service)
	if err != nil {
		log.Error(r.Context(), "Failed to get operations", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get operations")
		return
	}
}

func (router *Router) getTraces(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	limit := r.URL.Query().Get("limit")
	maxDuration := r.URL.Query().Get("maxDuration")
	minDuration := r.URL.Query().Get("minDuration")
	operation := r.URL.Query().Get("operation")
	service := r.URL.Query().Get("service")
	tags := r.URL.Query().Get("tags")
	timeEnd := r.URL.Query().Get("timeEnd")
	timeStart := r.URL.Query().Get("timeStart")

	log.Debug(r.Context(), "getTraces", zap.String("name", name), zap.String("limit", limit), zap.String("maxDuration", maxDuration), zap.String("minDuration", minDuration), zap.String("operation", operation), zap.String("service", service), zap.String("tags", tags), zap.String("timeEnd", timeEnd), zap.String("timeStart", timeStart))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Failed to parse start time", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Failed to parse end time", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse end time")
		return
	}

	err = i.GetTraces(r.Context(), w, limit, maxDuration, minDuration, operation, service, tags, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get traces", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get traces")
		return
	}
}

func (router *Router) getTrace(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	traceID := r.URL.Query().Get("traceID")

	log.Debug(r.Context(), "getTrace", zap.String("name", name), zap.String("traceID", traceID))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	err := i.GetTrace(r.Context(), w, traceID)
	if err != nil {
		log.Error(r.Context(), "Failed to get trace", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get trace")
		return
	}
}

func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	metric := r.URL.Query().Get("metric")
	service := r.URL.Query().Get("service")
	spanKinds := r.URL.Query()["spanKind"]
	groupByOperation := r.URL.Query().Get("groupByOperation")
	quantile := r.URL.Query().Get("quantile")
	ratePer := r.URL.Query().Get("ratePer")
	step := r.URL.Query().Get("step")
	timeEnd := r.URL.Query().Get("timeEnd")
	timeStart := r.URL.Query().Get("timeStart")

	log.Debug(r.Context(), "Get metrics parameters", zap.String("name", name), zap.String("metric", metric), zap.String("service", service), zap.Strings("spanKinds", spanKinds), zap.String("groupByOperation", groupByOperation), zap.String("quantile", quantile), zap.String("ratePer", ratePer), zap.String("step", step), zap.String("timeEnd", timeEnd), zap.String("timeStart", timeStart))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Failed to parse start time", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Failed to parse end time", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse end time")
		return
	}

	err = i.GetMetrics(r.Context(), w, metric, service, groupByOperation, quantile, ratePer, step, spanKinds, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get metrics", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get metrics")
		return
	}
}

func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var sonarqubeInstances []instance.Instance

	for _, i := range instances {
		sonarqubeInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}
		sonarqubeInstances = append(sonarqubeInstances, sonarqubeInstance)
	}

	router := Router{
		chi.NewRouter(),
		sonarqubeInstances,
	}

	proxy := pluginproxy.New(clustersClient)

	router.With(proxy).Get("/services", router.getServices)
	router.With(proxy).Get("/operations", router.getOperations)
	router.With(proxy).Get("/traces", router.getTraces)
	router.With(proxy).Get("/trace", router.getTrace)
	router.With(proxy).Get("/metrics", router.getMetrics)

	return router, nil
}
