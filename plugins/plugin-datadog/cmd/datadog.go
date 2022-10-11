package klogs

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-datadog/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// PluginType is the type which must be used for the Datadog plugin.
const PluginType = "datadog"

// Router implements the router for the Datadog plugin, which can be registered in the router for our rest api. It
// contains the api routes for the Datadog plugin and it's configuration.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Datadog instance by it's name. If we couldn't found an instance with the provided name and the
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

func (router *Router) getLogs(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get logs paramters", zap.String("name", name), zap.String("query", query), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

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

	logs, err := i.GetLogs(r.Context(), query, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Error while getting logs", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Error while getting logs")
		return
	}

	render.JSON(w, r, logs)
}

// Mount mounts the Datadog plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
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

	return router, nil
}
