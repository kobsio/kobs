package main

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-elasticsearch/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Router implements the router for the Elasticsearch plugin, which can be registered in the router for our rest api. It contains
// the api routes for the Elasticsearch plugin and it's configuration.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Elasticsearch instance by it's name. If we couldn't found an instance with the provided name and the
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

// getLogs returns the raw documents for a given query from Elasticsearch. The result also contains the distribution of
// the documents in the given time range. The name of the Elasticsearch instance must be set via the name path
// parameter, all other values like the query, start and end time are set via query parameters. These
// parameters are then passed to the GetLogs function of the Elasticsearch instance, which returns the documents and
// buckets.
func (router *Router) getLogs(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get logs parameters", zap.String("name", name), zap.String("query", query), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

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

	data, err := i.GetLogs(r.Context(), query, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get logs", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get logs")
		return
	}

	render.JSON(w, r, data)
}

// Mount mounts the Elasticsearch plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var elasticsearchInstances []instance.Instance

	for _, i := range instances {
		elasticsearchInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		elasticsearchInstances = append(elasticsearchInstances, elasticsearchInstance)
	}

	router := Router{
		chi.NewRouter(),
		elasticsearchInstances,
	}

	router.Get("/logs", router.getLogs)

	return router, nil
}
