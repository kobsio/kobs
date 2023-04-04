package mongodb

import (
	"encoding/json"
	"net/http"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/mongodb/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/utils/middleware/pluginproxy"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.mongodb.org/mongo-driver/bson"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a MongoDB instance by it's name. If we couldn't found an instance with the provided name and
// the provided name is "default" we return the first instance from the list. The first instance in the list is also the
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

// getStats returns the statistics of the configured database.
func (router *Router) getStats(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "Get database stats", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	stats, err := i.GetDBStats(r.Context())
	if err != nil {
		log.Error(r.Context(), "Failed to fetch database statistics", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to fetch database statistics")
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
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	stats, err := i.GetDBCollectionNames(r.Context())
	if err != nil {
		log.Error(r.Context(), "Failed to fetch collection names", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to fetch collection names")
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
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	stats, err := i.GetDBCollectionStats(r.Context(), collectionName)
	if err != nil {
		log.Error(r.Context(), "Failed to fetch collection statistics", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to fetch collection statistics")
		return
	}

	render.JSON(w, r, stats)
}

func (router *Router) getCollectionIndexes(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")

	log.Debug(r.Context(), "Get database collection indexes", zap.String("name", name), zap.String("collectionName", collectionName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	indexes, err := i.GetDBCollectionIndexes(r.Context(), collectionName)
	if err != nil {
		log.Error(r.Context(), "Failed to fetch collection indexes", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to fetch collection indexes")
		return
	}

	var docs []json.RawMessage
	for _, doc := range indexes {
		encodedDoc, err := bson.MarshalExtJSON(doc, false, true)
		if err != nil {
			errresponse.Render(w, r, http.StatusInternalServerError, "Failed to marshal find results")
			return
		}

		docs = append(docs, encodedDoc)
	}

	render.JSON(w, r, docs)
}

// find runs a query on the database and returns the result.
func (router *Router) find(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")

	log.Debug(r.Context(), "Running 'find' on database", zap.String("name", name), zap.String("collectionName", collectionName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	data := struct {
		Filter string `json:"filter"`
		Sort   string `json:"sort"`
		Limit  int64  `json:"limit"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Warn(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	results, err := i.Find(r.Context(), collectionName, data.Filter, data.Sort, data.Limit)
	if err != nil {
		log.Error(r.Context(), "Failed to run find", zap.String("name", name), zap.String("collectionName", collectionName), zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to run find")
		return
	}

	var docs []json.RawMessage
	for _, doc := range results {
		encodedDoc, err := bson.MarshalExtJSON(doc, false, true)
		if err != nil {
			errresponse.Render(w, r, http.StatusInternalServerError, "Failed to marshal find results")
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

	log.Debug(r.Context(), "Running 'count' on database", zap.String("name", name), zap.String("collectionName", collectionName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	data := struct {
		Filter string `json:"filter"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Warn(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	result, err := i.Count(r.Context(), collectionName, data.Filter)
	if err != nil {
		log.Error(r.Context(), "Failed to run count", zap.String("name", name), zap.String("collectionName", collectionName), zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to run count")
		return
	}

	response := struct {
		Count int64 `json:"count"`
	}{
		result,
	}

	render.JSON(w, r, response)
}

func (router *Router) findOne(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")

	log.Debug(r.Context(), "Running 'findOne' on database", zap.String("name", name), zap.String("collectionName", collectionName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	data := struct {
		Filter string `json:"filter"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Warn(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	result, err := i.FindOne(r.Context(), collectionName, data.Filter)
	if err != nil {
		log.Error(r.Context(), "Failed to run findOne", zap.String("name", name), zap.String("collectionName", collectionName), zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to run findOne")
		return
	}

	render.JSON(w, r, result)
}

func (router *Router) findOneAndUpdate(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")

	log.Debug(r.Context(), "Running 'findOneAndUpdate' on database", zap.String("name", name), zap.String("collectionName", collectionName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	data := struct {
		Filter string `json:"filter"`
		Update string `json:"update"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Warn(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	result, err := i.FindOneAndUpdate(r.Context(), collectionName, data.Filter, data.Update)
	if err != nil {
		log.Error(r.Context(), "Failed to run findOneAndUpdate", zap.String("name", name), zap.String("collectionName", collectionName), zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to run findOneAndUpdate")
		return
	}

	render.JSON(w, r, result)
}

func (router *Router) findOneAndDelete(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")

	log.Debug(r.Context(), "Running 'findOneAndDelete' on database", zap.String("name", name), zap.String("collectionName", collectionName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	data := struct {
		Filter string `json:"filter"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Warn(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	result, err := i.FindOneAndDelete(r.Context(), collectionName, data.Filter)
	if err != nil {
		log.Error(r.Context(), "Failed to run findOneAndDelete", zap.String("name", name), zap.String("collectionName", collectionName), zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to run findOneAndDelete")
		return
	}

	render.JSON(w, r, result)
}

func (router *Router) updateMany(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")

	log.Debug(r.Context(), "Running 'updateMany' on database", zap.String("name", name), zap.String("collectionName", collectionName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	data := struct {
		Filter string `json:"filter"`
		Update string `json:"update"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Warn(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	matchedCount, modifiedCount, err := i.UpdateMany(r.Context(), collectionName, data.Filter, data.Update)
	if err != nil {
		log.Error(r.Context(), "Failed to run updateMany", zap.String("name", name), zap.String("collectionName", collectionName), zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to run updateMany")
		return
	}

	response := struct {
		MatchedCount  int64 `json:"matchedCount"`
		ModifiedCount int64 `json:"modifiedCount"`
	}{
		matchedCount,
		modifiedCount,
	}

	render.JSON(w, r, response)
}

func (router *Router) deleteMany(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")

	log.Debug(r.Context(), "Running 'deleteMany' on database", zap.String("name", name), zap.String("collectionName", collectionName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	data := struct {
		Filter string `json:"filter"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Warn(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	count, err := i.DeleteMany(r.Context(), collectionName, data.Filter)
	if err != nil {
		log.Error(r.Context(), "Failed to run deleteMany", zap.String("name", name), zap.String("collectionName", collectionName), zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to run deleteMany")
		return
	}

	response := struct {
		Count int64 `json:"count"`
	}{
		count,
	}

	render.JSON(w, r, response)
}

func (router *Router) aggregate(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := r.URL.Query().Get("collectionName")

	log.Debug(r.Context(), "Running 'aggregate' on database", zap.String("name", name), zap.String("collectionName", collectionName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	data := struct {
		Pipeline string `json:"pipeline"`
	}{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Warn(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	results, err := i.Aggregate(r.Context(), collectionName, data.Pipeline)
	if err != nil {
		log.Error(r.Context(), "Failed to run aggregate", zap.String("name", name), zap.String("collectionName", collectionName), zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to run aggregate")
		return
	}

	var docs []json.RawMessage
	for _, doc := range results {
		encodedDoc, err := bson.MarshalExtJSON(doc, false, true)
		if err != nil {
			errresponse.Render(w, r, http.StatusInternalServerError, "Failed to marshal aggregate results")
			return
		}

		docs = append(docs, encodedDoc)
	}

	render.JSON(w, r, docs)
}

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

	proxy := pluginproxy.New(clustersClient)

	router.With(proxy).Get("/stats", router.getStats)
	router.With(proxy).Get("/collections", router.getCollectionNames)
	router.With(proxy).Get("/collections/stats", router.getCollectionStats)
	router.With(proxy).Get("/collections/indexes", router.getCollectionIndexes)
	router.With(proxy).Post("/collections/find", router.find)
	router.With(proxy).Post("/collections/count", router.count)
	router.With(proxy).Post("/collections/findone", router.findOne)
	router.With(proxy).Post("/collections/findoneandupdate", router.findOneAndUpdate)
	router.With(proxy).Post("/collections/findoneanddelete", router.findOneAndDelete)
	router.With(proxy).Post("/collections/updatemany", router.updateMany)
	router.With(proxy).Post("/collections/deletemany", router.deleteMany)
	router.With(proxy).Post("/collections/aggregate", router.aggregate)

	return router, nil
}
