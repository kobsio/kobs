package klogs

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/utils/middleware/pluginproxy"

	"go.uber.org/zap"
)

// Router implements the router for the klogs plugin, which can be registered in the router for our rest api. It contains
// the api routes for the klogs plugin and it's configuration.
type Router struct {
	*chi.Mux
	instances []Instance
}

// getInstance returns a klogs instance by it's name. If we couldn't found an instance with the provided name and the
// provided name is "default" we return the first instance from the list. The first instance in the list is also the
// first one configured by the user and can be used as default one.
func (router *Router) getInstance(name string) Instance {
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

func (router *Router) getFields(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	filter := r.URL.Query().Get("filter")
	fieldType := r.URL.Query().Get("fieldType")

	log.Debug(r.Context(), "Get fields parameters", zap.String("name", name), zap.String("filter", filter), zap.String("fieldType", fieldType))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Could not find instance name")
		return
	}

	fields := i.GetFields(filter, fieldType)
	log.Debug(r.Context(), "Get fields result", zap.Int("fieldsCount", len(fields)))
	render.JSON(w, r, fields)
}

// getLogs implements the special handling when the user selected the "logs" options for the "view" configuration. This
// options is intended to use together with the kobsio/klogs Fluent Bit plugin and provides a custom query language to
// get the logs from ClickHouse ingested via kobsio/klogs.
func (router *Router) getLogs(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")
	order := r.URL.Query().Get("order")
	orderBy := r.URL.Query().Get("orderBy")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get logs paramters", zap.String("name", name), zap.String("query", query), zap.String("order", order), zap.String("orderBy", orderBy), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Could not parse end time")
		return
	}

	// Query for larger time ranges can took several minutes to be completed. To avoid that the connection is closed for
	// these long running requests by a load balancer which sits infront of kobs, we are writing a newline character
	// every 10 seconds. We shouldn't write sth. else, because this would make parsing the response in the React UI more
	// diffucult and with the newline character parsing works in the same ways as it was before.
	done := make(chan bool)

	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-done:
				return
			case <-ticker.C:
				if f, ok := w.(http.Flusher); ok {
					// We do not set the processing status code, so that the queries always are returning a 200. This is
					// necessary because Go doesn't allow to set a new status code once the header was written.
					// See: https://github.com/golang/go/issues/36734
					// For that we also have to handle errors, when the status code is 200 in the React UI.
					// See plugins/klogs/src/components/page/Logs.tsx#L64
					// w.WriteHeader(http.StatusProcessing)
					w.Write([]byte("\n"))
					f.Flush()
				}
			}
		}
	}()

	defer func() {
		done <- true
	}()

	documents, fields, count, took, buckets, err := i.GetLogs(r.Context(), query, order, orderBy, 1000, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get logs", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Could not get logs")
		return
	}

	data := struct {
		Documents []map[string]any `json:"documents"`
		Fields    []string         `json:"fields"`
		Count     int64            `json:"count"`
		Took      int64            `json:"took"`
		Buckets   []Bucket         `json:"buckets"`
	}{
		documents,
		fields,
		count,
		took,
		buckets,
	}

	render.JSON(w, r, data)
}

// getAggregation returns the columns and rows for the user given aggregation request. The aggregation data must
// provided in the body of the request and is the run against the specified Clichouse instance.
func (router *Router) getAggregation(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "Get aggregation paramters", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var aggregationData Aggregation

	err := json.NewDecoder(r.Body).Decode(&aggregationData)
	if err != nil {
		log.Error(r.Context(), "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Could not decode request body")
		return
	}

	done := make(chan bool)

	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-done:
				return
			case <-ticker.C:
				if f, ok := w.(http.Flusher); ok {
					// w.WriteHeader(http.StatusProcessing)
					w.Write([]byte("\n"))
					f.Flush()
				}
			}
		}
	}()

	defer func() {
		done <- true
	}()

	rows, columns, err := i.GetAggregation(r.Context(), aggregationData)
	if err != nil {
		log.Error(r.Context(), "Error while running aggregation", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Error while running aggregation")
		return
	}

	data := struct {
		Rows    []map[string]any `json:"rows"`
		Columns []string         `json:"columns"`
	}{
		rows,
		columns,
	}

	render.JSON(w, r, data)
}

type Plugin struct{}

func New() *Plugin {
	return &Plugin{}
}

// PluginType is the type which must be used for the klogs plugin.
func (p *Plugin) Type() string {
	return "klogs"
}

// Mount mounts the klogs plugin routes in a cluster.
func (p *Plugin) MountCluster(instances []plugin.Instance, kubernetesClient kubernetes.Client) (chi.Router, error) {
	return p.mount(instances, nil)
}

func (p *Plugin) MountHub(instances []plugin.Instance, clustersClient clusters.Client, dbClient db.Client) (chi.Router, error) {
	return p.mount(instances, clustersClient)
}

func (p *Plugin) mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	klogsInstances := make([]Instance, len(instances))
	for i, instance := range instances {
		klogsInstance, err := NewInstance(instance.Name, instance.Options)
		if err != nil {
			return nil, err
		}
		klogsInstances[i] = klogsInstance
	}

	router := Router{
		chi.NewRouter(),
		klogsInstances,
	}

	proxy := pluginproxy.New(clustersClient)
	router.With(proxy).Get("/fields", router.getFields)
	router.With(proxy).Get("/logs", router.getLogs)
	router.With(proxy).Post("/aggregation", router.getAggregation)

	return router, nil
}
