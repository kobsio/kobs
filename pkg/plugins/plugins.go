package plugins

import (
	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/plugins/plugin"

	"github.com/go-chi/chi/v5"
)

type Plugin interface {
	Type() string
	MountCluster(instances []plugin.Instance, kubernetesClient kubernetes.Client) (chi.Router, error)
	MountHub(instances []plugin.Instance, clustersClient clusters.Client, dbClient db.Client) (chi.Router, error)
}
