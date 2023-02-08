package context

import (
	"encoding/json"

	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
)

// User is the structure of the user object saved in the request context. It contains the users id and permissions if
// authentication is enabled.
type User struct {
	ID          string             `json:"email"`
	Teams       []string           `json:"teams"`
	Permissions userv1.Permissions `json:"permissions"`
}

// ToString returns the marshaled user object.
func (u *User) ToString() string {
	userString, _ := json.Marshal(u)
	return string(userString)
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
func (u *User) HasTeamAccess(teamGroup string) bool {
	for _, t := range u.Permissions.Teams {
		if t == teamGroup || t == "*" {
			return true
		}
	}

	return false
}

// HasPluginAccess checks if the user has access to the given plugin.
func (u *User) HasPluginAccess(pluginType, pluginName string) bool {
	for _, p := range u.Permissions.Plugins {
		if p.Type == pluginType || p.Type == "*" {
			if p.Name == pluginName || p.Name == "*" {
				return true
			}
		}
	}

	return false
}
