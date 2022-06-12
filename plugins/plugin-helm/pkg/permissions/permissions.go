package permissions

import (
	"encoding/json"
	"fmt"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
)

// Permissions is the structure of the custom permissions field for the Helm plugin.
type Permissions struct {
	Clusters   []string `json:"clusters"`
	Namespaces []string `json:"namespaces"`
	Names      []string `json:"names"`
}

// CheckPermissions can be used to check if a user has the permissions to access a helm release in a specific cluster
// and namespace
func CheckPermissions(permissionsEnabled bool, user *authContext.User, cluster, namespace, name string) error {
	if !permissionsEnabled {
		return nil
	}

	permissions := user.GetPluginPermissions("helm")

	for _, permission := range permissions {
		var p []Permissions
		err := json.Unmarshal(permission, &p)
		if err != nil {
			return fmt.Errorf("invalid permission format: %w", err)
		}

		if hasAccess(cluster, namespace, name, p) {
			return nil
		}
	}

	return fmt.Errorf("access forbidden")
}

func hasAccess(cluster, namespace, name string, permissions []Permissions) bool {
	for _, p := range permissions {
		for _, c := range p.Clusters {
			if c == cluster || c == "*" {
				for _, n := range p.Namespaces {
					if n == namespace || n == "*" {
						for _, n := range p.Names {
							if n == name || n == "*" {
								return true
							}
						}
					}
				}
			}
		}
	}

	return false
}
