package plugins

import (
	"net/http"
	"strings"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
)

// filterInstances only returns the plugin instances, which have the specified type.
func filterInstances(pluginType string, instances []plugin.Instance) []plugin.Instance {
	var filteredInstances []plugin.Instance

	for _, instance := range instances {
		if instance.Type == pluginType {
			filteredInstances = append(filteredInstances, instance)
		}
	}

	return filteredInstances
}

func permissionHandler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/plugins" {
			next.ServeHTTP(w, r)
			return
		}

		user := authContext.MustGetUser(r.Context())
		cluster := r.Header.Get("x-kobs-cluster")
		name := r.Header.Get("x-kobs-plugin")
		plugin := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/plugins/"), "/")[0]

		if !user.HasPluginAccess(cluster, plugin, name) {
			errresponse.Render(w, r, http.StatusForbidden, "You don't have access to this plugin.")
			return
		}

		next.ServeHTTP(w, r)
	}

	return http.HandlerFunc(fn)
}
