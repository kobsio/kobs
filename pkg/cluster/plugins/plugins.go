package plugins

//go:generate mockgen -source=plugins.go -destination=./plugins_mock.go -package=plugins Client

import (
	"fmt"
	"net/http"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/plugins"
	"github.com/kobsio/kobs/pkg/plugins/plugin"

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
func NewClient(plugins []plugins.Plugin, instances []plugin.Instance, kubernetesClient kubernetes.Client) (Client, error) {
	// To not pass some confidential data to the frontend we are converting the provided plugin instances to so called
	// "frontendInstances". These instances only containing the "frontendOptions" from the configuration.
	var frontendInstances []plugin.Instance
	for _, instance := range instances {
		frontendInstances = append(frontendInstances, plugin.Instance{
			Name:        instance.Name,
			Description: instance.Description,
			Type:        instance.Type,
			Options:     instance.FrontendOptions,
		})
	}

	// Create a new router and serve all the configured plugin instances at "/". Here we are just returning the
	// converted "frontendInstances" to not leak confidential data (like passwords and access tokens) to the user.
	router := chi.NewRouter()
	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, r, frontendInstances)
	})

	// In the last step we are using the user defined `plugins` to mount the plugin routes at the formerly created
	// router. For that we are looping over the defined mount functions, call them and mount the returned router. If an
	// error is returned from one of the calls we return this error, to stop the starting process of the client.
	for _, plugin := range plugins {
		filteredInstances := filterInstances(plugin.Type(), instances)

		pluginRouter, err := plugin.MountCluster(filteredInstances, kubernetesClient)
		if err != nil {
			return nil, err
		}
		router.Mount(fmt.Sprintf("/%s", plugin.Type()), pluginRouter)
	}

	return &client{
		router:    router,
		instances: instances,
	}, nil
}
