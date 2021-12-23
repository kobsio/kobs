package instance

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"

	"github.com/go-chi/chi/v5"
)

// Permissions is the structure of the custom permissions field for the Azure instance.
type Permissions struct {
	Resources      []string `json:"resources"`
	ResourceGroups []string `json:"resourceGroups"`
	Verbs          []string `json:"verbs"`
}

// CheckPermissions can be used to check if a user has the permissions to access a resource. The permissions of the user
// are determined from the passed in request context.
func (i *Instance) CheckPermissions(r *http.Request, resource, resourceGroup string) error {
	if !i.PermissionsEnabled {
		return nil
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		return err
	}

	permissions := user.GetPluginPermissions(chi.URLParam(r, "name"))

	for _, permission := range permissions {
		var p []Permissions
		err := json.Unmarshal(permission, &p)
		if err != nil {
			return fmt.Errorf("invalid permission format: %w", err)
		}

		if hasAccess(resource, resourceGroup, strings.ToLower(r.Method), p) {
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
