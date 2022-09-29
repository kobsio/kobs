package mongodb

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-mongodb/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.mongodb.org/mongo-driver/bson"
	"go.uber.org/zap"
)

// PluginType is the type of the plugin, how it must be specified in the configuration. The PluginType is also used as
// prefix for the returned chi.Router from the Mount function.
const PluginType = "mongodb"

// Router implements a router for the plugin. It contains all the fields and functions from the chi.Mux struct and all
// the configured instances.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance is a helper function, which returns a instance by it's name. If we couldn't found an instance with the
// provided name and when the provided name is "default" we return the first configured instance.
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

// getStats returns the statistics of the configured database.
func (router *Router) getStats(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "Get database stats", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	stats, err := i.GetDBStats(r.Context())
	if err != nil {
		errresponse.Render(w, r, nil, http.StatusInternalServerError, "Error fetching database statistics")
		return
	}

	render.JSON(w, r, stats)
}

// getCollectionNames returns the names of all collections of the configured database.
func (router *Router) getCollectionNames(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "Get database collection names", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	stats, err := i.GetDBCollectionNames(r.Context())
	if err != nil {
		errresponse.Render(w, r, nil, http.StatusInternalServerError, "Error fetching collection names")
		return
	}

	render.JSON(w, r, stats)
}

// getCollectionNames returns the names of all collections of the configured database.
func (router *Router) getCollectionStats(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")

	log.Debug(r.Context(), "Get database collection stats", zap.String("name", name), zap.String("collectionName", collectionName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	stats, err := i.GetDBCollectionStats(r.Context(), collectionName)
	if err != nil {
		errresponse.Render(w, r, nil, http.StatusInternalServerError, "Error fetching collection statistics")
		return
	}

	render.JSON(w, r, stats)
}

// find runs a query on the database and returns the result.
func (router *Router) find(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")
	sort := r.URL.Query().Get("sort")
	limit := r.URL.Query().Get("limit")

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Error(r.Context(), "Error reading request body", zap.String("name", name), zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Cannot read request body")
		return
	}
	r.Body.Close()

	log.Debug(r.Context(), "Running 'find' on database", zap.String("name", name), zap.String("collectionName", collectionName), zap.String("sort", sort), zap.String("limit", limit))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedLimit, err := strconv.ParseInt(limit, 10, 64)
	if err != nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not parse limit parameter")
		return
	}

	results, err := i.Find(r.Context(), collectionName, body, parsedLimit, sort)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Error running 'find' query")
		return
	}

	var docs []json.RawMessage
	for _, doc := range results {
		encodedDoc, err := bson.MarshalExtJSON(doc, false, true)
		if err != nil {
			errresponse.Render(w, r, err, http.StatusInternalServerError, "Error marshalling query results")
			return
		}

		docs = append(docs, encodedDoc)
	}

	render.JSON(w, r, docs)
}

// count runs a query on the database and returns the number of matching documents.
func (router *Router) count(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Error(r.Context(), "Error reading request body", zap.String("name", name), zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Cannot read request body")
		return
	}
	r.Body.Close()

	log.Debug(r.Context(), "Running 'count' on database", zap.String("name", name), zap.String("collectionName", collectionName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	result, err := i.Count(r.Context(), collectionName, body)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Error running 'count' query")
		return
	}

	data := struct {
		Count int64 `json:"count"`
	}{
		result,
	}

	render.JSON(w, r, data)
}

func (router *Router) findOne(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")
	filter := r.URL.Query().Get("filter")

	log.Debug(r.Context(), "Running 'findOne' on database", zap.String("name", name), zap.String("collectionName", collectionName), zap.String("filter", filter))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	result, err := i.FindOne(r.Context(), collectionName, filter)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Error running 'findOne' query")
		return
	}

	render.JSON(w, r, result)
}

// Mount mounts the MongoDB plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var mongodbInstances []instance.Instance

	for _, i := range instances {
		mongodbInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		mongodbInstances = append(mongodbInstances, mongodbInstance)
	}

	router := Router{
		chi.NewRouter(),
		mongodbInstances,
	}

	router.Get("/stats", router.getStats)
	router.Get("/collections", router.getCollectionNames)
	router.Get("/collections/stats", router.getCollectionStats)
	router.Post("/collections/find", router.find)
	router.Post("/collections/count", router.count)
	router.Get("/collections/findone", router.findOne)

	return router, nil
}
