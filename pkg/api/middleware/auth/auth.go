package auth

import (
	"context"
	"net/http"
	"strings"
	"sync"
	"time"

	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	user "github.com/kobsio/kobs/pkg/api/apis/user/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"

	"github.com/sirupsen/logrus"
)

// Auth is the struct for handling authorization for resources.
type Auth struct {
	enabled            bool
	userHeader         string
	defaultTeam        string
	refreshInterval    time.Duration
	clusters           *clusters.Clusters
	defaultPermissions team.Permissions
	users              sync.Map
}

// Handler apply the authorization policy for a request and adds the user information to the request.
//
// We are always trying to get the user id from the specified authentication header, so that we can log the users which
// runs the request also when authentication is disabled. That way we can have a basic audit log when authentication is
// disabled.
// When authentication is enabled we are checking if the user exists in the users map, if this isn't the case we we
// applie the default permissions for the user. When the user exists we are checking if the user has access to the
// plugin. The API routes which are outside of the plugins router are always accessible (e.g. getting all configured
// plugins and clusters).
func (a *Auth) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		userID := r.Header.Get(flagUserHeader)

		if a.enabled {
			if userID == "" {
				errresponse.Render(w, r, nil, http.StatusUnauthorized, "Unauthorized")
				return
			}

			var user authContext.User

			u, ok := a.users.Load(userID)
			if !ok {
				user = authContext.User{
					ID:          userID,
					HasProfile:  false,
					Permissions: a.defaultPermissions,
				}
			} else {
				user = u.(authContext.User)
			}

			urlPaths := strings.Split(r.URL.Path, "/")
			if len(urlPaths) >= 4 && urlPaths[1] == "api" && urlPaths[2] == "plugins" {
				if !user.HasPluginAccess(urlPaths[3]) {
					errresponse.Render(w, r, nil, http.StatusForbidden, "Your are not allowed to access the plugin")
					return
				}
			}

			ctx = context.WithValue(ctx, authContext.UserKey, user)
		} else {
			if userID == "" {
				userID = "kobs.io"
			}

			ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{
				ID:         userID,
				HasProfile: false,
				Permissions: team.Permissions{
					Plugins: []string{"*"},
					Resources: []team.PermissionsResources{{
						Clusters:   []string{"*"},
						Namespaces: []string{"*"},
						Resources:  []string{"*"},
					}},
				},
			})
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetPermissions should be called in a new goroutine to get a list of users and there permissions. This list is
// refreshed by the refresh interval parameter.
// When authentication and authorization isn't enabled this function directly returns. If the auth module is enabled it
// runs the internal getPermissions function on the specified interval.
func (a *Auth) GetPermissions() {
	if !a.enabled {
		log.Infof("authentication and authorization middleware is disabled")
		return
	}

	err := a.getPermissions()
	if err != nil {
		log.WithError(err).Errorf("failed to refresh users and permissions")
	} else {
		log.Infof("refreshed users and permissions")
	}

	ticker := time.NewTicker(a.refreshInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			err := a.getPermissions()
			if err != nil {
				log.WithError(err).Errorf("failed to refresh users and permissions")
			} else {
				log.Infof("refreshed users and permissions")
			}
		}
	}
}

// getPermissions sets the permissions for each user. For that we are getting all teams and users from the configured
// clusters first. After that we are adding the permissions of the users teams to the user.
func (a *Auth) getPermissions() error {
	ctx, cancel := context.WithTimeout(context.Background(), a.refreshInterval)
	defer cancel()

	var teams []team.TeamSpec
	var users []user.UserSpec

	for _, cluster := range a.clusters.Clusters {
		t, err := cluster.GetTeams(ctx, "")
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"cluster": cluster.GetName()}).Warnf("could not get teams")
		}

		teams = append(teams, t...)

		u, err := cluster.GetUsers(ctx, "")
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"cluster": cluster.GetName()}).Warnf("could not get users")
		}

		users = append(users, u...)
	}

	defaultTeam := strings.Split(a.defaultTeam, ",")
	if len(defaultTeam) == 3 {
		for _, t := range teams {
			if t.Cluster == defaultTeam[0] && t.Namespace == defaultTeam[1] && t.Name == defaultTeam[2] {
				a.defaultPermissions = t.Permissions
			}
		}
	}

	for _, u := range users {
		a.users.Store(u.ID, getUserPermissions(u, teams))
	}

	return nil
}

func getUserPermissions(user user.UserSpec, teams []team.TeamSpec) authContext.User {
	u := authContext.User{
		ID:         user.ID,
		HasProfile: true,
		Profile:    user,
	}

	for _, userTeam := range user.Teams {
		c := userTeam.Cluster
		if c == "" {
			c = user.Cluster
		}

		n := userTeam.Namespace
		if n == "" {
			n = user.Namespace
		}

		for _, team := range teams {
			if c == team.Cluster && n == team.Namespace && userTeam.Name == team.Name {
				u.Permissions.Plugins = append(u.Permissions.Plugins, team.Permissions.Plugins...)
				u.Permissions.Resources = append(u.Permissions.Resources, team.Permissions.Resources...)
			}
		}
	}

	return u
}

// New returns a new authentication and authorization object.
func New(enabled bool, userHeader, defaultTeam string, interval time.Duration, clusters *clusters.Clusters) *Auth {
	return &Auth{
		enabled:         enabled,
		userHeader:      userHeader,
		defaultTeam:     defaultTeam,
		refreshInterval: interval,
		clusters:        clusters,
	}
}
