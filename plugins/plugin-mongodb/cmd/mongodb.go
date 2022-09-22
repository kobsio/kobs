package mongodb

import (
	"encoding/json"
	"github.com/kobsio/kobs/plugins/plugin-mongodb/pkg/instance"
	"go.mongodb.org/mongo-driver/bson"
	"io/ioutil"
	"net/http"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
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

// getVariable is a spacial endpoint which is mounted under the "/variable" path. This endpoint can be used to use the
// plugin within the variables section of a dashboard. The endpoint must always return a slice of strings (e.g. via
// "render.JSON(w, r, values)", where values is a of type []string).
func (router *Router) getVariable(w http.ResponseWriter, r *http.Request) {
	errresponse.Render(w, r, nil, http.StatusNotImplemented, "Variable is not implemented for the mongodb plugin")
}

// getInsight is a special endpoint which is mounted under the "/insights" path. This endpoint can be used to use the
// plugin within the insights section of an application. The endpoint must always return a slice of datums, where a
// datum is defined as follows:
//   type Datum struct {
//       X int64    `json:"x"`
//       Y *float64 `json:"y"`
//   }
func (router *Router) getInsight(w http.ResponseWriter, r *http.Request) {
	errresponse.Render(w, r, nil, http.StatusNotImplemented, "Insights are not implemented for the mongodb plugin")
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

	if stats, err := i.GetDbStats(r.Context()); err != nil {
		errresponse.Render(w, r, nil, http.StatusInternalServerError, "Error fetching database statistics")
		return
	} else {
		render.JSON(w, r, stats)
	}
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

	if stats, err := i.GetDbCollectionNames(r.Context()); err != nil {
		errresponse.Render(w, r, nil, http.StatusInternalServerError, "Error fetching collection names")
		return
	} else {
		render.JSON(w, r, stats)
	}
}

// getCollectionNames returns the names of all collections of the configured database.
func (router *Router) getCollectionStats(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := chi.URLParam(r, "collectionName") // todo: extract into constant

	log.Debug(
		r.Context(),
		"Get database collection stats",
		zap.String("name", name),
		zap.String("collectionName", collectionName),
	)

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	if stats, err := i.GetDbCollectionStats(r.Context(), collectionName); err != nil {
		errresponse.Render(w, r, nil, http.StatusInternalServerError, "Error fetching collection names")
		return
	} else {
		render.JSON(w, r, stats)
	}
}

// find runs a query on the database and returns the result.
func (router *Router) find(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	collectionName := chi.URLParam(r, "collectionName") // todo: extract into constant

	defer func() {
		_ = r.Body.Close()
	}()
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		log.Error(
			r.Context(),
			"Error reading request body",
			zap.String("name", name),
			zap.Error(err),
		)
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Cannot read request body")
		return
	} else {
		log.Debug(
			r.Context(),
			"Running 'find' on database",
			zap.String("name", name),
			zap.String("collectionName", collectionName),
		)
	}

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	if results, err := i.Find(r.Context(), collectionName, body); err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Error running 'find' query")
		return
	} else {
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
}

func Mount(instances []plugin.Instance, _ clusters.Client) (chi.Router, error) {
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

	router.Post("/variable", router.getVariable)
	router.Post("/insight", router.getInsight)
	router.Get("/stats", router.getStats)
	router.Get("/collections", router.getCollectionNames)
	router.Get("/collections/{collectionName}/stats", router.getCollectionStats)
	router.Post("/collections/{collectionName}/find", router.find)

	return router, nil
}
