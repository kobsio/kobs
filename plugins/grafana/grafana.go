package grafana

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/grafana/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const (
	Route = "/grafana"
)

// Config is the structure of the configuration for the grafana plugin.
type Config []instance.Config

// Router implements the router for the Grafana plugin, which can be registered in the router for our rest api. Next to
// the http routes it also contains a list of all registered instances for the Grafana plugin.
type Router struct {
	*chi.Mux
	Instances []instance.Instance
}

// getInstance returns an instance by it's name.
func (router *Router) getInstance(name string) instance.Instance {
	for _, i := range router.Instances {
		if i.GetName() == name {
			return i
		}
	}

	return nil
}

// getDashboards returns a list of dashboards. If the request contains a list of "uids", this endpoint returns a list of
// dashboards for the provided uids. If the request doesn't contain a list of uids and an optional "query" parameter,
// this endpoint is used to search all dashboards, which are matching the provided query term.
func (router *Router) getDashboards(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	query := r.URL.Query().Get("query")
	uids := r.URL.Query()["uid"]

	log.Debug(r.Context(), "Get dashboards parameters", zap.String(name, name), zap.String("query", query), zap.Strings("uids", uids))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	if uids != nil {
		var dashboards []instance.Dashboard
		for _, uid := range uids {
			dashboard, err := i.GetDashboard(r.Context(), uid)
			if err != nil {
				log.Error(r.Context(), "Could not get dashboard", zap.Error(err))
				errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get dashboard")
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
		log.Error(r.Context(), "Could not get dashboards", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get dashboards")
		return
	}

	render.JSON(w, r, dashboards)
}

// Register returns a new router for the Grafana plugin, which can be used in the router for the kobs rest api. For each
// instance we are adding the "internalAddress" and the "publicAddress" to the options, so that they can be used in the
// frontend.
func Register(plugins *plugin.Plugins, config Config) chi.Router {
	var instances []instance.Instance

	for _, cfg := range config {
		instance := instance.New(cfg)
		instances = append(instances, instance)

		var options map[string]interface{}
		options = make(map[string]interface{})
		options["internalAddress"] = cfg.InternalAddress
		options["publicAddress"] = cfg.PublicAddress

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Home:        cfg.Home,
			Type:        "grafana",
			Options:     options,
		})
	}

	router := Router{
		chi.NewRouter(),
		instances,
	}

	router.Route("/{name}", func(r chi.Router) {
		r.Get("/dashboards", router.getDashboards)
	})

	return router
}
