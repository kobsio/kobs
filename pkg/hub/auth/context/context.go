package context

import (
	"context"
	"fmt"

	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
)

// Key to use when setting the user.
type ctxKeyUser int

// UserKey is the key that holds the user in a request context.
const UserKey ctxKeyUser = 0

// User is the structure of our user object which is added to the current request context and saved within the users
// current session. It contains the users id, teams and permissions. In addition to the permissions defined in a User CR
// it also contains the permissions from all teams a user is part of.
type User struct {
	ID          string             `json:"id" bson:"id"`
	Name        string             `json:"name" bson:"name"`
	Teams       []string           `json:"teams" bson:"teams"`
	Permissions userv1.Permissions `json:"permissions" bson:"permissions"`
}

// HasApplicationAccess checks if the user is allowed to view an application.
func (u *User) HasApplicationAccess(application *applicationv1.ApplicationSpec) bool {
	for _, a := range u.Permissions.Applications {
		if a.Type == "all" {
			return true
		}

		if a.Type == "own" {
			for _, applicationTeam := range application.Teams {
				for _, userTeam := range u.Teams {
					if userTeam == applicationTeam {
						return true
					}
				}
			}
		}

		if a.Type == "custom" {
			for _, c := range a.Clusters {
				if c == application.Cluster || c == "*" {
					for _, n := range a.Namespaces {
						if n == application.Namespace || n == "*" {
							return true
						}
					}
				}
			}
		}
	}

	return false
}

// HasTeamAccess checks if the user is allowed to view a team. Teams are identified by the group property.
func (u *User) HasTeamAccess(team string) bool {
	for _, t := range u.Permissions.Teams {
		if t == team || t == "*" {
			return true
		}
	}

	return false
}

// HasPluginAccess checks if the user has access to the given plugin.
func (u *User) HasPluginAccess(cluster, pluginType, pluginName string) bool {
	for _, p := range u.Permissions.Plugins {
		if p.Cluster == cluster || p.Cluster == "*" {
			if p.Type == pluginType || p.Type == "*" {
				if p.Name == pluginName || p.Name == "*" {
					return true
				}
			}
		}
	}

	return false
}

// HasResourceAccess checks if the user has access to the given resource in the given cluster and namespace.
func (u *User) HasResourceAccess(cluster, namespace, name, verb string) bool {
	for _, resource := range u.Permissions.Resources {
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

// GetUser returns a user from the given context if one is present. If there is no user in the current context an error
// is returned.
func GetUser(ctx context.Context) (*User, error) {
	if ctx == nil {
		return nil, fmt.Errorf("Unauthorized")
	}

	if user, ok := ctx.Value(UserKey).(User); ok {
		return &user, nil
	}

	return nil, fmt.Errorf("Unauthorized")
}

// MustGetUser returns a user from the given context if one is present. If there is no user in the current context the
// function throws a panic.
//
// This is similar to the GetUser function but allows us to simplify the code to get the user, where we are sure that
// the user must be present in a request context.
func MustGetUser(ctx context.Context) *User {
	user, err := GetUser(ctx)
	if err != nil {
		panic(err)
	}

	return user
}
