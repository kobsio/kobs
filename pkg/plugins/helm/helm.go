package helm

import (
	"fmt"
	"net/http"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
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
	return "helm"
}

func (p *Plugin) MountCluster(instances []plugin.Instance, kubernetesClient kubernetes.Client) (chi.Router, error) {
	return Mount(kubernetesClient)
}

func (p *Plugin) MountHub(instances []plugin.Instance, clustersClient clusters.Client, dbClient db.Client) (chi.Router, error) {
	router := chi.NewRouter()
	router.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
		cluster := r.Header.Get("x-kobs-cluster")
		namespaces := r.URL.Query()["namespace"]

		c := clustersClient.GetCluster(cluster)
		if c == nil {
			errresponse.Render(w, r, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		user := authContext.MustGetUser(r.Context())
		if namespaces == nil {
			if !user.HasResourceAccess(cluster, "*", "secrets", "get") {
				errresponse.Render(w, r, http.StatusUnauthorized, "You are not allowed to view Helm releases in all namespaces")
				return
			}
		} else {
			for _, namespace := range namespaces {
				if !user.HasResourceAccess(cluster, namespace, "secrets", "get") {
					errresponse.Render(w, r, http.StatusUnauthorized, fmt.Sprintf("You are not allowed to view Helm releases in the '%s' namespace", namespace))
					return
				}
			}
		}

		c.Proxy(w, r)
	})
	return router, nil
}
