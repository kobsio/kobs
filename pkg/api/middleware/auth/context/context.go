package context

import (
	"context"
	"encoding/json"
	"fmt"

	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	user "github.com/kobsio/kobs/pkg/api/apis/user/v1beta1"
)

// Key to use when setting the user.
type ctxKeyUser int

// UserKey is the key that holds the user in a request context.
const UserKey ctxKeyUser = 0

// User is the structure of the user object saved in the request context. It contains the users id and permissions if
// authentication is enabled.
type User struct {
	ID          string           `json:"id"`
	HasProfile  bool             `json:"hasProfile"`
	Profile     user.UserSpec    `json:"profile,omitempty"`
	Permissions team.Permissions `json:"permissions"`
}

// HasPluginAccess checks if the user has access to the given plugin.
func (u *User) HasPluginAccess(plugin string) bool {
	for _, p := range u.Permissions.Plugins {
		if p == plugin || p == "*" {
			return true
		}
	}

	return false
}

// HasClusterAccess checks if the user has access to the given cluster.
func (u *User) HasClusterAccess(cluster string) bool {
	for _, resource := range u.Permissions.Resources {
		for _, c := range resource.Clusters {
			if c == cluster || c == "*" {
				return true
			}
		}
	}

	return false
}

// HasNamespaceAccess checks if the user has access to the given namespace in the given cluster.
func (u *User) HasNamespaceAccess(cluster, namespace string) bool {
	for _, resource := range u.Permissions.Resources {
		for _, c := range resource.Clusters {
			if c == cluster || c == "*" {
				for _, n := range resource.Namespaces {
					if n == namespace || n == "*" {
						return true
					}
				}
			}
		}
	}

	return false
}

// HasResourceAccess checks if the user has access to the given resource in the given cluster and namespace.
func (u *User) HasResourceAccess(cluster, namespace, name string) bool {
	for _, resource := range u.Permissions.Resources {
		for _, c := range resource.Clusters {
			if c == cluster || c == "*" {
				for _, n := range resource.Namespaces {
					if n == namespace || n == "*" {
						for _, r := range resource.Resources {
							if r == name || r == "*" {
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

// GetPluginPermissions returns the custom plugin permissions for a user. For that the name of the plugin must be
// provided.
func (u *User) GetPluginPermissions(name string) (interface{}, error) {
	if u.Permissions.Custom == nil {
		return nil, fmt.Errorf("custom permissions are empty for the user")
	}

	var customPermissions map[string]interface{}
	customPermissions = make(map[string]interface{})

	err := json.Unmarshal(u.Permissions.Custom.Raw, customPermissions)
	if err != nil {
		return nil, err
	}

	if customPluginPermissions, ok := customPermissions[name]; ok {
		return customPluginPermissions, nil
	}

	return nil, fmt.Errorf("plugin is missing in custom permissions for the user")
}

// GetUser returns a user from the given context if one is present. Returns the empty string if a user can not be found.
func GetUser(ctx context.Context) (*User, error) {
	if ctx == nil {
		return nil, fmt.Errorf("Unauthorized")
	}

	if user, ok := ctx.Value(UserKey).(User); ok {
		return &user, nil
	}

	return nil, fmt.Errorf("Unauthorized")
}
