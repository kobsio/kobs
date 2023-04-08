package klogs

import (
	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/plugins/plugin"

	"github.com/go-chi/chi/v5"
)

type Plugin struct{}

func New() *Plugin {
	return &Plugin{}
}

// PluginType is the type which must be used for the klogs plugin.
func (p *Plugin) Type() string {
	return "klogs"
}

// Mount mounts the klogs plugin routes in a cluster.
func (p *Plugin) MountCluster(instances []plugin.Instance, kubernetesClient kubernetes.Client) (chi.Router, error) {
	return p.Mount(instances, nil)
}

func (p *Plugin) MountHub(instances []plugin.Instance, clustersClient clusters.Client, dbClient db.Client) (chi.Router, error) {
	return p.Mount(instances, clustersClient)
}
