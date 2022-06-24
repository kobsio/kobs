package plugin

import (
	"github.com/kobsio/kobs/pkg/kube/clusters"

	"github.com/go-chi/chi/v5"
)

// Instance is the structure of the configuration for a single plugin instance. Each plugin must contain a name and a
// type and an optionsl description. It can also contains a map with additional options. The options can be used to
// specify the addess, username, password, etc. to access an service within the plugin.
type Instance struct {
	ID              string                 `json:"id"`
	Satellite       string                 `json:"satellite"`
	Name            string                 `json:"name"`
	Description     string                 `json:"description"`
	Type            string                 `json:"type"`
	Options         map[string]interface{} `json:"options"`
	FrontendOptions map[string]interface{} `json:"frontendOptions"`
	UpdatedAt       int64                  `json:"updatedAt"`
}

// MountFn is the type of the mount function, which must be implemented by all plugins, so that the can be used within
// kobs.
// We pass the instances for the corresponding plugin type and the clusters client to the mount function. The function
// must return a chi router or an error, if the mounting of the plugin fails.
type MountFn func(instances []Instance, clustersClient clusters.Client) (chi.Router, error)
