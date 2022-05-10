package context

import (
	"context"
	"fmt"

	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
)

// Key to use when setting the user.
type ctxKeyUser int

// UserKey is the key that holds the user in a request context.
const UserKey ctxKeyUser = 0

// User is the structure of the user object saved in the request context. It contains the users id and permissions if
// authentication is enabled.
type User struct {
	Email       string             `json:"email"`
	Teams       []string           `json:"teams"`
	Permissions userv1.Permissions `json:"permissions"`
}

// HasPluginAccess checks if the user has access to the given plugin.
func (u *User) HasPluginAccess(satellite, plugin string) bool {
	for _, p := range u.Permissions.Plugins {
		if p.Satellite == satellite || p.Satellite == "*" {
			if p.Name == plugin || p.Name == "*" {
				return true
			}
		}
	}

	return false
}

// HasResourceAccess checks if the user has access to the given resource in the given cluster and namespace.
func (u *User) HasResourceAccess(satellite, cluster, namespace, name, verb string) bool {
	for _, resource := range u.Permissions.Resources {
		for _, s := range resource.Satellites {
			if s == satellite || s == "*" {
				for _, c := range resource.Clusters {
					if c == cluster || c == "*" {
						for _, n := range resource.Namespaces {
							if n == namespace || n == "*" {
								for _, r := range resource.Resources {
									if r == name || r == "*" {
										for _, v := range resource.Verbs {
											if v == verb || v == "*" {
												return true
											}
										}
									}
								}
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
func (u *User) GetPluginPermissions(name string) [][]byte {
	var allCustomPermissions [][]byte

	for _, plugin := range u.Permissions.Plugins {
		if plugin.Name == name {
			allCustomPermissions = append(allCustomPermissions, plugin.Permissions.Raw)
		}
	}

	return allCustomPermissions
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
