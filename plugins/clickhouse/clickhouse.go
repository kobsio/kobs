package clickhouse

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/clickhouse/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/clickhouse"

var (
	log = logrus.WithFields(logrus.Fields{"package": "clickhouse"})
)

// Config is the structure of the configuration for the clickhouse plugin.
type Config []instance.Config

type logsResponse struct {
	Documents []map[string]interface{} `json:"documents"`
	Fields    []string                 `json:"fields"`
	Offset    int64                    `json:"offset"`
}

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

func (router *Router) getSQL(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	query := r.URL.Query().Get("query")

	log.WithFields(logrus.Fields{"name": name, "query": query}).Tracef("getSQL")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	rows, columns, err := i.GetSQL(r.Context(), query)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get result for SQL query")
		return
	}

	data := struct {
		Rows    [][]interface{} `json:"rows"`
		Columns []string        `json:"columns"`
	}{
		rows,
		columns,
	}

	render.JSON(w, r, data)
}

// getLogs implements the special handling when the user selected the "logs" options for the "view" configuration. This
// options is intended to use together with the kobsio/fluent-bit-clickhouse Fluent Bit plugin and provides a custom
// query language to get the logs from ClickHouse.
// Next to the query and time range, a user can also provide a limit and offset to page through all the logs. The limit
// shouldn't be larger then 1000 and if the offset is empty we use 0, which indicates a new query in our React UI.
func (router *Router) getLogs(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	query := r.URL.Query().Get("query")
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.WithFields(logrus.Fields{"name": name, "query": query, "limit": limit, "offset": offset, "timeStart": timeStart, "timeEnd": timeEnd}).Tracef("getLogs")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedLimit, err := strconv.ParseInt(limit, 10, 64)
	if err != nil || parsedLimit > 1000 {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse limit")
		return
	}

	parsedOffset := int64(0)
	if offset != "" {
		parsedOffset, err = strconv.ParseInt(offset, 10, 64)
		if err != nil {
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse offset")
			return
		}
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	documents, fields, took, newOffset, err := i.GetLogs(r.Context(), query, parsedLimit, parsedOffset, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get logs")
		return
	}

	data := struct {
		Documents []map[string]interface{} `json:"documents"`
		Fields    []string                 `json:"fields"`
		Took      int64                    `json:"took"`
		Offset    int64                    `json:"offset"`
	}{
		documents,
		fields,
		took,
		newOffset,
	}

	render.JSON(w, r, data)
}

func (router *Router) getLogsCount(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	query := r.URL.Query().Get("query")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.WithFields(logrus.Fields{"name": name, "query": query, "timeStart": timeStart, "timeEnd": timeEnd}).Tracef("getLogsCount")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	count, err := i.GetLogsCount(r.Context(), query, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get logs count")
		return
	}

	data := struct {
		Count int64 `json:"count"`
	}{
		count,
	}

	render.JSON(w, r, data)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"name": cfg.Name}).Fatalf("Could not create ClickHouse instance")
		}

		instances = append(instances, instance)

		var options map[string]interface{}
		options = make(map[string]interface{})
		options["type"] = cfg.Type

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "clickhouse",
			Options:     options,
		})
	}

	router := Router{
		chi.NewRouter(),
		clusters,
		instances,
	}

	router.Get("/sql/{name}", router.getSQL)
	router.Get("/logs/documents/{name}", router.getLogs)
	router.Get("/logs/count/{name}", router.getLogsCount)

	return router
}
