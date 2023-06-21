package elasticsearch

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/elasticsearch/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/utils/middleware/pluginproxy"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Elasticsearch instance by it's name. If we couldn't found an instance with the provided name
// and the provided name is "default" we return the first instance from the list. The first instance in the list is also
// the first one configured by the user and can be used as default one.
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
	indexPattern := r.URL.Query().Get("indexPattern")
	timestampField := r.URL.Query().Get("timestampField")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get logs paramters", zap.String("name", name), zap.String("query", query), zap.String("indexPattern", indexPattern), zap.String("timestampField", timestampField), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

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

	data, err := i.GetLogs(r.Context(), query, indexPattern, timestampField, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get logs", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get logs")
		return
	}

	render.JSON(w, r, data)
}

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

	proxy := pluginproxy.New(clustersClient)

	router.With(proxy).Get("/logs", router.getLogs)

	return router, nil
}
