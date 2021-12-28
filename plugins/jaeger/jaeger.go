package jaeger

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/jaeger/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/jaeger"

// Config is the structure of the configuration for the jaeger plugin.
type Config []instance.Config

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
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

func (router *Router) getServices(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	log.Debug(r.Context(), "Get services parameters.", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	body, err := i.GetServices(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not get services.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get services")
		return
	}

	render.JSON(w, r, body)
}

func (router *Router) getOperations(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	service := r.URL.Query().Get("service")

	log.Debug(r.Context(), "Get operations parameters.", zap.String("name", name), zap.String("service", service))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	body, err := i.GetOperations(r.Context(), service)
	if err != nil {
		log.Error(r.Context(), "Could not get operations.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get operations")
		return
	}

	render.JSON(w, r, body)
}

func (router *Router) getTraces(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	limit := r.URL.Query().Get("limit")
	maxDuration := r.URL.Query().Get("maxDuration")
	minDuration := r.URL.Query().Get("minDuration")
	operation := r.URL.Query().Get("operation")
	service := r.URL.Query().Get("service")
	tags := r.URL.Query().Get("tags")
	timeEnd := r.URL.Query().Get("timeEnd")
	timeStart := r.URL.Query().Get("timeStart")

	log.Debug(r.Context(), "Get traces parameters.", zap.String("name", name), zap.String("limit", limit), zap.String("maxDuration", maxDuration), zap.String("minDuration", minDuration), zap.String("operation", operation), zap.String("service", service), zap.String("tags", tags), zap.String("timeEnd", timeEnd), zap.String("timeStart", timeStart))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time.", zap.Error(err))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time.", zap.Error(err))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not parse end time")
		return
	}

	body, err := i.GetTraces(r.Context(), limit, maxDuration, minDuration, operation, service, tags, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get traces.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get traces")
		return
	}

	render.JSON(w, r, body)
}

func (router *Router) getTrace(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	traceID := r.URL.Query().Get("traceID")

	log.Debug(r.Context(), "Get trace parameters.", zap.String("name", name), zap.String("traceID", traceID))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	body, err := i.GetTrace(r.Context(), traceID)
	if err != nil {
		log.Error(r.Context(), "Could not get trace.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get trace")
		return
	}

	render.JSON(w, r, body)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.Fatal(nil, "Could not create Jaeger instance.", zap.Error(err), zap.String("name", cfg.Name))
		}

		instances = append(instances, instance)

		var options map[string]interface{}
		options = make(map[string]interface{})
		options["publicAddress"] = cfg.PublicAddress

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "jaeger",
			Options:     options,
		})
	}

	router := Router{
		chi.NewRouter(),
		instances,
	}

	router.Route("/{name}", func(r chi.Router) {
		r.Get("/services", router.getServices)
		r.Get("/operations", router.getOperations)
		r.Get("/traces", router.getTraces)
		r.Get("/trace", router.getTrace)
	})

	return router
}
