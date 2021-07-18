package jaeger

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/jaeger/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/jaeger"

var (
	log = logrus.WithFields(logrus.Fields{"package": "jaeger"})
)

// Config is the structure of the configuration for the jaeger plugin.
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

func (router *Router) getServices(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	log.WithFields(logrus.Fields{"name": name}).Tracef("getServices")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	body, err := i.GetServices(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get services")
		return
	}

	render.JSON(w, r, body)
}

func (router *Router) getOperations(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	service := r.URL.Query().Get("service")

	log.WithFields(logrus.Fields{"name": name, "service": service}).Tracef("getOperations")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	body, err := i.GetOperations(r.Context(), service)
	if err != nil {
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

	log.WithFields(logrus.Fields{"name": name, "limit": limit, "maxDuration": maxDuration, "minDuration": minDuration, "operation": operation, "service": service, "tags": tags, "timeEnd": timeEnd, "timeStart": timeStart}).Tracef("getTraces")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not parse end time")
		return
	}

	body, err := i.GetTraces(r.Context(), limit, maxDuration, minDuration, operation, service, tags, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get traces")
		return
	}

	render.JSON(w, r, body)
}

func (router *Router) getTrace(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	traceID := r.URL.Query().Get("traceID")

	log.WithFields(logrus.Fields{"name": name, "traceID": traceID}).Tracef("getTrace")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	body, err := i.GetTrace(r.Context(), traceID)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get trace")
		return
	}

	render.JSON(w, r, body)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"name": cfg.Name}).Fatalf("Could not create Jaeger instance")
		}

		instances = append(instances, instance)

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "jaeger",
		})
	}

	router := Router{
		chi.NewRouter(),
		clusters,
		instances,
	}

	router.Get("/services/{name}", router.getServices)
	router.Get("/operations/{name}", router.getOperations)
	router.Get("/traces/{name}", router.getTraces)
	router.Get("/trace/{name}", router.getTrace)

	return router
}
