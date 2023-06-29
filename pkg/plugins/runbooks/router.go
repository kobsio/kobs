package runbooks

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/runbooks/instance"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Runbooks instance by it's name. If we couldn't found an instance with the provided name and
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

func (router *Router) getRunbooks(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")
	alert := r.URL.Query().Get("alert")
	group := r.URL.Query().Get("group")

	log.Debug(r.Context(), "getRunbooks", zap.String("name", name), zap.String("query", query), zap.String("alert", alert), zap.String("group", group))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	runbooks, err := i.GetRunbooks(r.Context(), query, alert, group)
	if err != nil {
		log.Error(r.Context(), "Failed to get runbooks", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get runbooks")
		return
	}

	render.JSON(w, r, runbooks)
}

func (router *Router) syncRunbooks(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	log.Debug(r.Context(), "syncRunbooks", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	err := i.SyncRunbooks(r.Context())
	if err != nil {
		log.Error(r.Context(), "Failed to sync runbooks", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to sync runbooks")
		return
	}

	render.Status(r, http.StatusNoContent)
	render.JSON(w, r, nil)
}

func Mount(instances []plugin.Instance, clustersClient clusters.Client, dbClient db.Client) (chi.Router, error) {
	var runbooksInstances []instance.Instance

	for _, i := range instances {
		runbooksInstance, err := instance.New(i.Name, i.Options, clustersClient, dbClient)
		if err != nil {
			return nil, err
		}
		runbooksInstances = append(runbooksInstances, runbooksInstance)
	}

	router := Router{
		chi.NewRouter(),
		runbooksInstances,
	}

	router.Get("/runbooks", router.getRunbooks)
	router.Get("/runbooks/sync", router.syncRunbooks)

	return router, nil
}
