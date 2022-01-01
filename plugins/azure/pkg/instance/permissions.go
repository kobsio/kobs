package instance

import (
	"encoding/json"
	"fmt"
	"strings"

	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
)

// Permissions is the structure of the custom permissions field for the Azure instance.
type Permissions struct {
	Resources      []string `json:"resources"`
	ResourceGroups []string `json:"resourceGroups"`
	Verbs          []string `json:"verbs"`
}

// CheckPermissions can be used to check if a user has the permissions to access a resource. The permissions of the user
// are determined from the passed in request context.
func (i *instance) CheckPermissions(pluginName string, user *authContext.User, resource, resourceGroup, verb string) error {
	if !i.permissionsEnabled {
		return nil
	}

	permissions := user.GetPluginPermissions(pluginName)

	for _, permission := range permissions {
		var p []Permissions
		err := json.Unmarshal(permission, &p)
		if err != nil {
			return fmt.Errorf("invalid permission format: %w", err)
		}

		if hasAccess(resource, resourceGroup, strings.ToLower(verb), p) {
			return nil
		}
	}

	return fmt.Errorf("access forbidden")
}

func hasAccess(resource, resourceGroup, verb string, permissions []Permissions) bool {
	for _, p := range permissions {
		for _, r := range p.Resources {
			if r == resource || r == "*" {
				for _, rg := range p.ResourceGroups {
					if rg == resourceGroup || rg == "*" {
						for _, v := range p.Verbs {
							if v == verb || v == "*" {
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
