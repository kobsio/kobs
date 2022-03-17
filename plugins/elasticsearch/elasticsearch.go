package elasticsearch

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/elasticsearch/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/elasticsearch"

// Config is the structure of the configuration for the elasticsearch plugin.
type Config []instance.Config

// Router implements the router for the Elasticsearch plugin, which can be registered in the router for our rest api.
// Next to the routes for the Elasticsearch plugin it also contains a list of all configured Elasticsearch instances.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns an instance by it's name.
func (router *Router) getInstance(name string) instance.Instance {
	for _, i := range router.instances {
		if i.GetName() == name {
			return i
		}
	}

	return nil
}

// getLogs returns the raw documents for a given query from Elasticsearch. The result also contains the distribution of
// the documents in the given time range. The name of the Elasticsearch instance must be set via the name path
// parameter, all other values like the query, start and end time are set via query parameters. These
// parameters are then passed to the GetLogs function of the Elasticsearch instance, which returns the documents and
// buckets.
func (router *Router) getLogs(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
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

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(plugins *plugin.Plugins, config Config) chi.Router {
	var instances []instance.Instance

	for _, cfg := range config {
		instance := instance.New(cfg)
		instances = append(instances, instance)

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Home:        cfg.Home,
			Type:        "elasticsearch",
		})
	}

	router := Router{
		chi.NewRouter(),
		instances,
	}

	router.Route("/{name}", func(r chi.Router) {
		r.Get("/logs", router.getLogs)
	})

	return router
}
