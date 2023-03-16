package grafana

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/grafana/instance"
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

// getInstance returns a rss instance by it's name. If we couldn't found an instance with the provided name and the
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

// getDashboards returns a list of dashboards. If the request contains a list of "uids", this endpoint returns a list of
// dashboards for the provided uids. If the request doesn't contain a list of uids and an optional "query" parameter,
// this endpoint is used to search all dashboards, which are matching the provided query term.
func (router *Router) getDashboards(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")
	uids := r.URL.Query()["uid"]

	log.Debug(r.Context(), "getDashboards", zap.String(name, name), zap.String("query", query), zap.Strings("uids", uids))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	if uids != nil {
		var dashboards []instance.Dashboard
		for _, uid := range uids {
			dashboard, err := i.GetDashboard(r.Context(), uid)
			if err != nil {
				log.Error(r.Context(), "Failed to get dashboard", zap.Error(err))
				errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get dashboard")
				return
			}

			if dashboard != nil {
				dashboards = append(dashboards, *dashboard)
			}
		}

		render.JSON(w, r, dashboards)
		return
	}

	dashboards, err := i.GetDashboards(r.Context(), query)
	if err != nil {
		log.Error(r.Context(), "Failed to get dashboards", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get dashboards")
		return
	}

	render.JSON(w, r, dashboards)
}

func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var grafanaInstances []instance.Instance

	for _, i := range instances {
		grafanaInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}
		grafanaInstances = append(grafanaInstances, grafanaInstance)
	}

	router := Router{
		chi.NewRouter(),
		grafanaInstances,
	}

	proxy := pluginproxy.New(clustersClient)

	router.With(proxy).Get("/dashboards", router.getDashboards)

	return router, nil
}
