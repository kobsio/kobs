package main

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-jaeger/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Router implements the router for the Jaeger plugin, which can be registered in the router for our rest api. It contains
// the api routes for the Jaeger plugin and it's configuration.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Jaeger instance by it's name. If we couldn't found an instance with the provided name and the
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

func (router *Router) getServices(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "Get services parameters", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	body, err := i.GetServices(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not get services", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get services")
		return
	}

	render.JSON(w, r, body)
}

func (router *Router) getOperations(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	service := r.URL.Query().Get("service")

	log.Debug(r.Context(), "Get operations parameters", zap.String("name", name), zap.String("service", service))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	body, err := i.GetOperations(r.Context(), service)
	if err != nil {
		log.Error(r.Context(), "Could not get operations", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get operations")
		return
	}

	render.JSON(w, r, body)
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

	log.Debug(r.Context(), "Get traces parameters", zap.String("name", name), zap.String("limit", limit), zap.String("maxDuration", maxDuration), zap.String("minDuration", minDuration), zap.String("operation", operation), zap.String("service", service), zap.String("tags", tags), zap.String("timeEnd", timeEnd), zap.String("timeStart", timeStart))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time", zap.Error(err))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time", zap.Error(err))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not parse end time")
		return
	}

	body, err := i.GetTraces(r.Context(), limit, maxDuration, minDuration, operation, service, tags, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get traces", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get traces")
		return
	}

	render.JSON(w, r, body)
}

func (router *Router) getTrace(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	traceID := r.URL.Query().Get("traceID")

	log.Debug(r.Context(), "Get trace parameters", zap.String("name", name), zap.String("traceID", traceID))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	body, err := i.GetTrace(r.Context(), traceID)
	if err != nil {
		log.Error(r.Context(), "Could not get trace", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get trace")
		return
	}

	render.JSON(w, r, body)
}

// Mount mounts the Jaeger plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var jaegerInstances []instance.Instance

	for _, i := range instances {
		jaegerInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		jaegerInstances = append(jaegerInstances, jaegerInstance)
	}

	router := Router{
		chi.NewRouter(),
		jaegerInstances,
	}

	router.Get("/services", router.getServices)
	router.Get("/operations", router.getOperations)
	router.Get("/traces", router.getTraces)
	router.Get("/trace", router.getTrace)

	return router, nil
}
