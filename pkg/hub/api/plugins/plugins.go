package plugins

import (
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
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
	pluginType := chi.URLParam(r, "type")

	if satelliteName == "" && pluginName == "" {
		satelliteName = r.URL.Query().Get("x-kobs-satellite")
		pluginName = r.URL.Query().Get("x-kobs-plugin")
	}

	log.Debug(r.Context(), "Proxy plugin request", zap.String("satellite", satelliteName), zap.String("plugin", pluginName), zap.String("pluginType", pluginType))

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the plugin", zap.String("satellite", satelliteName), zap.String("plugin", pluginName), zap.String("pluginType", pluginType), zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the plugin")
		return
	}

	if !user.HasPluginAccess(satelliteName, pluginType, pluginName) {
		log.Warn(r.Context(), "The user is not allowed to access the plugin", zap.String("satellite", satelliteName), zap.String("plugin", pluginName), zap.String("pluginType", pluginType), zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to access the plugin")
		return
	}

	satellite := router.satellitesClient.GetSatellite(satelliteName)
	if satellite == nil {
		log.Error(r.Context(), "Satellite was not found", zap.String("satellite", satelliteName), zap.String("plugin", pluginName), zap.String("pluginType", pluginType))
		errresponse.Render(w, r, nil, http.StatusInternalServerError, "Satellite was not found")
		return
	}

	r.Header.Add("x-kobs-plugin", pluginName)
	r.Header.Add("x-kobs-user", user.ToString())

	satellite.Proxy(w, r)
}

// Mount returns a chi.Router which can be used to interact with the plugins of the satellites. It returns all the
// loaded plugins from the satellites and proxies the plugin requests to the satellites.
func Mount(satellitesClient satellites.Client, storeClient store.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		satellitesClient,
		storeClient,
	}

	router.Get("/", router.getPlugins)
	router.HandleFunc("/{type}/*", router.proxyPlugins)

	return router
}
