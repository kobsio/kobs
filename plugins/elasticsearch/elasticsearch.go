package elasticsearch

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/elasticsearch/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/elasticsearch"

var (
	log = logrus.WithFields(logrus.Fields{"package": "elasticsearch"})
)

// Config is the structure of the configuration for the elasticsearch plugin.
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

	log.WithFields(logrus.Fields{"name": name, "query": query, "timeStart": timeStart, "timeEnd": timeEnd}).Tracef("getLogs")

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

	data, err := i.GetLogs(r.Context(), query, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get logs")
		return
	}

	render.JSON(w, r, data)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"name": cfg.Name}).Fatalf("Could not create Elasticsearch instance")
		}

		instances = append(instances, instance)

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "elasticsearch",
		})
	}

	router := Router{
		chi.NewRouter(),
		clusters,
		instances,
	}

	router.Route("/{name}", func(r chi.Router) {
		r.Get("/logs", router.getLogs)
	})

	return router
}
