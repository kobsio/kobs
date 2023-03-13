package pluginproxy

import (
	"fmt"
	"net/http"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/plugins"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
)

// New creates a middleware for directing requests to the desired cluster target
// if the target is the hub, the request is handled internally
// if the target is anything else, the request is proxied
// to the instance specified in the header 'x-kobs-cluster'
func New(clustersClient clusters.Client) func(http.Handler) http.Handler {
	proxy := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cluster := r.Header.Get("x-kobs-cluster")
			if cluster == "" {
				errresponse.Render(w, r, http.StatusBadRequest, "Required header 'x-kobs-cluster' is missing")
				return
			}

			if clustersClient == nil || cluster == plugins.HubClusterName {
				next.ServeHTTP(w, r)
				return
			}

			clusterClient := clustersClient.GetCluster(cluster)
			if clusterClient == nil {
				errresponse.Render(w, r, http.StatusBadRequest, fmt.Sprintf("Invalid cluster name: '%s'", cluster))
				return
			}

			clusterClient.Proxy(w, r)
		})

	}
	return proxy
}
