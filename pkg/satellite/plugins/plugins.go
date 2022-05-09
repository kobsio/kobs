package plugins

import (
	"fmt"
	"net/http"
	goPlugin "plugin"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

// Client is the interface which must be implemented by a plugins client. The plugins client must only be export a
// router with all plugin routes mounted.
type Client interface {
	Mount() chi.Router
}

// client implements the plugins Client interface. it contains a router and a list of plugin instances, which are
// provided by the user.
type client struct {
	router    *chi.Mux
	instances []plugin.Instance
}

// Mount returns the router of the plugins client, so it can be mounted into an existing chi router.
func (c *client) Mount() chi.Router {
	return c.router
}

// NewClient creates a new plugins client. The client contains all the user provided plugin instances and a router. The
// router contains all the routes for all plugins.
func NewClient(pluginDir string, instances []plugin.Instance, clustersClient clusters.Client) (Client, error) {
	// Create a new router and serve all the configured plugin instances at "/". We can not simply return all the
	// plugins as they are provided by the user, because they can contain sensible information like usernames and
	// passwords. Therefore we are just returning the name, description, type and address for a plugin instance.
	router := chi.NewRouter()
	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		var saveInstances []plugin.Instance

		for _, instance := range instances {
			saveInstances = append(saveInstances, plugin.Instance{
				Name:        instance.Name,
				Description: instance.Description,
				Type:        instance.Type,
				Address:     instance.Address,
			})
		}

		render.JSON(w, r, saveInstances)
	})

	// We are checking which plugin types are used in the configuration, so that we are just loading and mounting the
	// plugins which are needed.
	var pluginTypes []string
	for _, instance := range instances {
		pluginTypes = appendIfMissing(pluginTypes, instance.Type)
	}

	// In the last step we are looping though all the uses plugin types and we are trying to load the shared object for
	// the plugin. Then we are trying to mount the plugin in the router of the plugins client. For that each plugin
	// must export a "Mount" function of the type
	// "func(instances []plugin.Instance, clustersClient clusters.Client) chi.Router".
	// If one of the steps to mount a plugin fails, we return an error. This error should be handled when calling the
	// NewClient function and should abort the start process of the satellite.
	for _, pluginType := range pluginTypes {
		p, err := goPlugin.Open(fmt.Sprintf("%s/%s.so", pluginDir, pluginType))
		if err != nil {
			return nil, err
		}

		mountSymbol, err := p.Lookup("Mount")
		if err != nil {
			return nil, err
		}

		mountFunc, ok := mountSymbol.(func(instances []plugin.Instance, clustersClient clusters.Client) chi.Router)
		if !ok {
			return nil, fmt.Errorf("mount function is not of type \"func(instances []plugin.Instance, clustersClient clusters.Client) chi.Router\" for plugin %s", pluginType)
		}

		router.Mount(fmt.Sprintf("/%s", pluginType), mountFunc(filterInstances(pluginType, instances), clustersClient))
	}

	return &client{
		router:    router,
		instances: instances,
	}, nil
}
