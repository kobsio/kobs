package plugins

import (
	"fmt"
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/clusters/cluster"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/hub/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/version"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Config struct{}

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clusterClient cluster.Client
	storeClient   db.Client
}

// getPlugins returns all plugins saved in the store.
func (router *Router) getPlugins(w http.ResponseWriter, r *http.Request) {
	plugins, err := router.storeClient.GetPlugins(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not get plugins from store", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("could not get plugins"))
		return
	}

	data := struct {
		Plugins []plugin.Instance `json:"plugins"`
		Version string            `json:"version"`
	}{
		plugins,
		"2",
	}

	log.Debug(r.Context(), "Return plugins from store", zap.Int("pluginsCount", len(plugins)), zap.String("version", version.Version))
	render.JSON(w, r, data)
}

// proxyPlugins proxies all plugin related requests to the cluster, where the plugin was registered.
// We are adding the plugin and user to the request header and calling the "Proxy" method of the cluster client.
func (router *Router) proxyPlugins(w http.ResponseWriter, r *http.Request) {
	pluginName := r.Header.Get("x-kobs-plugin")
	pluginType := chi.URLParam(r, "type")

	if pluginName == "" {
		pluginName = r.URL.Query().Get("x-kobs-plugin")
	}

	log.Debug(r.Context(), "Proxy plugin request", zap.String("plugin", pluginName), zap.String("pluginType", pluginType))

	user := authContext.MustGetUser(r.Context())
	if !user.HasPluginAccess(pluginType, pluginName) {
		log.Warn(r.Context(), "The user is not allowed to access the plugin", zap.String("plugin", pluginName), zap.String("pluginType", pluginType))
		errresponse.Render(w, r, http.StatusForbidden, fmt.Errorf("you are not allowed to access the plugin"))
		return
	}

	r.Header.Add("x-kobs-plugin", pluginName)
	r.Header.Add("x-kobs-user", user.ToString())

	router.clusterClient.Proxy(w, r)
}

// Mount returns a chi.Router which can be used to interact with the plugins of the cluster. It returns all the
// loaded plugins from the cluster and proxies the plugin requests.
func Mount(config Config, clusterClient cluster.Client, storeClient db.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		clusterClient,
		storeClient,
	}

	router.Get("/", router.getPlugins)
	router.HandleFunc("/{type}/*", router.proxyPlugins)

	return router
}
