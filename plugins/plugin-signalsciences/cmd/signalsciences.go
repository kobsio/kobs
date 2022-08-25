package jira

import (
	"net/http"
	"net/url"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-signalsciences/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/signalsciences/go-sigsci"
	"go.uber.org/zap"
)

// PluginType is the type which must be used for the Signal Sciences plugin.
const PluginType = "signalsciences"

// Router implements the router for the Signal Sciences plugin, which can be registered in the router for our rest api.
// It contains the api routes for the Signal Sciences plugin and it's configuration.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Signal Sciences instance by it's name. If we couldn't found an instance with the provided name
// and the provided name is "default" we return the first instance from the list. The first instance in the list is also
// the first one configured by the user and can be used as default one.
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

func (router *Router) getOverview(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	from := r.URL.Query().Get("from")
	until := r.URL.Query().Get("until")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	report, err := i.GetOverview(url.Values{"from": []string{from}, "until": []string{until}})
	if err != nil {
		log.Error(r.Context(), "Could not get overview", zap.String("name", name), zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get overview")
		return
	}

	render.JSON(w, r, report)
}

func (router *Router) getSites(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	sites, err := i.GetSites()
	if err != nil {
		log.Error(r.Context(), "Could not get sites", zap.String("name", name), zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get sites")
		return
	}

	render.JSON(w, r, sites)
}

func (router *Router) getAgents(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	siteName := r.URL.Query().Get("siteName")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	agents, err := i.GetAgents(siteName)
	if err != nil {
		log.Error(r.Context(), "Could not get agents", zap.String("name", name), zap.Error(err), zap.String("siteName", siteName))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get agents")
		return
	}

	render.JSON(w, r, agents)
}

func (router *Router) getRequests(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	siteName := r.URL.Query().Get("siteName")
	page := r.URL.Query().Get("page")
	limit := r.URL.Query().Get("limit")
	query := r.URL.Query().Get("query")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	_, requests, err := i.GetRequests(siteName, url.Values{"page": []string{page}, "limit": []string{limit}, "q": []string{query}})
	if err != nil {
		log.Error(r.Context(), "Could not get requests", zap.String("name", name), zap.Error(err), zap.String("siteName", siteName), zap.String("page", page), zap.String("limit", limit), zap.String("query", query))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get requests")
		return
	}

	data := struct {
		Requests []sigsci.Request `json:"requests"`
		Total    int              `json:"total"`
	}{
		Requests: requests,
		Total:    len(requests),
	}

	render.JSON(w, r, data)
}

// Mount mounts the Signal Sciences plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var signalSciencesInstances []instance.Instance

	for _, i := range instances {
		signalSciencesInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		signalSciencesInstances = append(signalSciencesInstances, signalSciencesInstance)
	}

	router := Router{
		chi.NewRouter(),
		signalSciencesInstances,
	}

	router.Get("/overview", router.getOverview)
	router.Get("/sites", router.getSites)
	router.Get("/agents", router.getAgents)
	router.Get("/requests", router.getRequests)

	return router, nil
}
