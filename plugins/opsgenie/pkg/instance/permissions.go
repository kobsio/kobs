package instance

import (
	"encoding/json"
	"fmt"

	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
)

// Permissions is the structure of the custom permissions field for the Opsgenie instance. The permissions are defined
// via an array of strings, where the following values are allowed:
//   - acknowledgeAlert
//   - snoozeAlert
//   - closeAlert
//   - resolveIncident
//   - closeIncident
type Permissions []string

// CheckPermissions can be used to check if a user has the permissions to access an action. The permissions of the user
// are determined from the passed in request context.
func (i *instance) CheckPermissions(pluginName string, user *authContext.User, action string) error {
	if !i.permissionsEnabled {
		return nil
	}

	permissions := user.GetPluginPermissions(pluginName)

	for _, permission := range permissions {
		var p Permissions
		err := json.Unmarshal(permission, &p)
		if err != nil {
			return fmt.Errorf("invalid permission format: %w", err)
		}

		if hasAccess(action, p) {
			return nil
		}
	}

	return fmt.Errorf("access forbidden")
}

func hasAccess(action string, permissions Permissions) bool {
	for _, p := range permissions {
		if p == action || p == "*" {
			return true
		}
	}

	return false
}
