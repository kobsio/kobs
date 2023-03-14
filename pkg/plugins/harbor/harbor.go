package harbor

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/plugins"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
)

type Plugin struct{}

func New() plugins.Plugin {
	return &Plugin{}
}

func (p *Plugin) Type() string {
	return "harbor"
}

func (p *Plugin) MountCluster(instances []plugin.Instance, kubernetesClient kubernetes.Client) (chi.Router, error) {
	router := chi.NewRouter()
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		errresponse.Render(w, r, http.StatusNotFound)
	})
	return router, nil
}

func (p *Plugin) MountHub(instances []plugin.Instance, clustersClient clusters.Client, dbClient db.Client) (chi.Router, error) {
	return Mount(instances)
}
