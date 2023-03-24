package sonarqube

import (
	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/plugins"
	"github.com/kobsio/kobs/pkg/plugins/plugin"

	"github.com/go-chi/chi/v5"
)

type Plugin struct{}

func New() plugins.Plugin {
	return &Plugin{}
}

func (p *Plugin) Type() string {
	return "sonarqube"
}

func (p *Plugin) MountCluster(instances []plugin.Instance, kubernetesClient kubernetes.Client) (chi.Router, error) {
	return nil, nil
}

func (p *Plugin) MountHub(instances []plugin.Instance, clustersClient clusters.Client, dbClient db.Client) (chi.Router, error) {
	return Mount(instances)
}
