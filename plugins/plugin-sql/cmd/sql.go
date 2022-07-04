package sql

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-sql/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// PluginType is the type which must be used for the SQL plugin.
const PluginType = "sql"

// Router implements the router for the SQL plugin, which can be registered in the router for our rest api. It contains
// the api routes for the SQL plugin and it's configuration.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a SQL instance by it's name. If we couldn't found an instance with the provided name and the
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

func (router *Router) getQueryResults(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")

	log.Debug(r.Context(), "Get SQL parameters", zap.String("name", name), zap.String("query", query))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	rows, columns, err := i.GetQueryResults(r.Context(), query)
	if err != nil {
		log.Error(r.Context(), "Could not get result for SQL query", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get result for SQL query")
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

// Mount mounts the SQL plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var sqlInstances []instance.Instance

	for _, i := range instances {
		sqlInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		sqlInstances = append(sqlInstances, sqlInstance)
	}

	router := Router{
		chi.NewRouter(),
		sqlInstances,
	}

	router.Get("/query", router.getQueryResults)

	return router, nil
}
