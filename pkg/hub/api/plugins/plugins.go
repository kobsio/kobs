package plugins

import (
	"encoding/json"
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/auth/user/context"
	"github.com/kobsio/kobs/pkg/hub/satellites"
	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	httpClient       *http.Client
	satellitesClient satellites.Client
	storeClient      store.Client
}

// getPlugins returns all plugins saved in the store.
func (router *Router) getPlugins(w http.ResponseWriter, r *http.Request) {
	plugins, err := router.storeClient.GetPlugins(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not get plugins from store", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get plugins")
		return
	}

	log.Debug(r.Context(), "Return plugins from store", zap.Int("pluginsCount", len(plugins)))
	render.JSON(w, r, plugins)
}

// proxyPlugins proxies all plugin related requests to the satellite, where the plugin was registered. To determine the
// correct satellite, we are using the "x-kobs-satellite" header to get the satellite from the satellites client. Then
// we are adding the plugin and user to the request header and calling the "Proxy" method of the satellite client.
func (router *Router) proxyPlugins(w http.ResponseWriter, r *http.Request) {
	satelliteName := r.Header.Get("x-kobs-satellite")
	pluginName := r.Header.Get("x-kobs-plugin")
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the plugin", zap.String("satellite", satelliteName), zap.String("plugin", pluginName), zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the plugin")
		return
	}
	userJson, _ := json.Marshal(user)

	satellite := router.satellitesClient.GetSatellite(satelliteName)
	if satellite == nil {
		log.Error(r.Context(), "Satellite was not found", zap.String("satelliteName", satelliteName), zap.String("pluginName", pluginName))
		errresponse.Render(w, r, nil, http.StatusInternalServerError, "Satellite was not found")
		return
	}

	r.Header.Add("x-kobs-plugin", pluginName)
	r.Header.Add("x-kobs-user", string(userJson))

	satellite.Proxy(w, r)
}

// Mount returns a chi.Router which can be used to interact with the plugins of the satellites. It returns all the
// loaded plugins from the satellites and proxies the plugin requests to the satellites.
func Mount(satellitesClient satellites.Client, storeClient store.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		&http.Client{},
		satellitesClient,
		storeClient,
	}

	router.Get("/", router.getPlugins)
	router.Get("/*", router.proxyPlugins)

	return router
}
