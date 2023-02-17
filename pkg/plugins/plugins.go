package plugins

import (
	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/plugins/plugin"

	"github.com/go-chi/chi/v5"
)

// Plugin is the interface which must be implemented by  all plugins. All plugins must have a `Type` method which is
// used as prefix in the router under which the plugin is mounted. The `MountCluster` and `MountHub` methods must return
// a `chi.Router` which is mounted in clusters / hub API.
type Plugin interface {
	Type() string
	MountCluster(instances []plugin.Instance, kubernetesClient kubernetes.Client) (chi.Router, error)
	MountHub(instances []plugin.Instance, clustersClient clusters.Client, dbClient db.Client) (chi.Router, error)
}
