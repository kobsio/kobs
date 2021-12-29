package auth

import (
	"context"
	"net/http"
	"strings"
	"time"

	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	user "github.com/kobsio/kobs/pkg/api/apis/user/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/pkg/api/middleware/auth/jwt"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/log"

	"go.uber.org/zap"
)

// Auth is the struct for handling authorization for resources.
type Auth struct {
	enabled         bool
	headerUser      string
	headerTeams     string
	sessionToken    string
	sessionInterval time.Duration
	clustersClient  clusters.Client
}

func containsTeam(teamID string, teamIDs []string) bool {
	for _, id := range teamIDs {
		if id == teamID {
			return true
		}
	}

	return false
}

func (a *Auth) getUser(ctx context.Context, userID string, teamIDs []string) (authContext.User, error) {
	authContextUser := authContext.User{ID: userID}

	var users []user.UserSpec
	var teams []team.TeamSpec

	for _, c := range a.clustersClient.GetClusters() {
		tmpUsers, err := c.GetUsers(ctx, "")
		if err != nil {
			return authContextUser, err
		}

		users = append(users, tmpUsers...)

		if teamIDs != nil {
			tmpTeams, err := c.GetTeams(ctx, "")
			if err != nil {
				return authContextUser, err
			}

			teams = append(teams, tmpTeams...)
		}
	}

	for _, u := range users {
		if u.ID == authContextUser.ID {
			authContextUser.Cluster = u.Cluster
			authContextUser.Namespace = u.Namespace
			authContextUser.Name = u.Name
			authContextUser.ID = u.ID
			authContextUser.Profile = u.Profile
			authContextUser.Teams = u.Teams
			authContextUser.Permissions.Plugins = append(authContextUser.Permissions.Plugins, u.Permissions.Plugins...)
			authContextUser.Permissions.Resources = append(authContextUser.Permissions.Resources, u.Permissions.Resources...)
			break
		}
	}

	for _, t := range teams {
		if containsTeam(t.ID, teamIDs) {
			authContextUser.Permissions.Plugins = append(authContextUser.Permissions.Plugins, t.Permissions.Plugins...)
			authContextUser.Permissions.Resources = append(authContextUser.Permissions.Resources, t.Permissions.Resources...)
		}
	}

	return authContextUser, nil
}

// Handler is the handler for the auth middleware. In the middleware we check if authentication is enabled. If this is
// the case we check if the request contains a valid jwt cookie in the "kobs-auth" token. If we do not found a valid
// token we try to create a new one and set it as cookie, before we return an unauthorized error. If the authorization
// succeeds we also inject the user in the request context.
func (a *Auth) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		userID := r.Header.Get(a.headerUser)
		teamIDs := strings.Split(r.Header.Get(a.headerTeams), ",")

		// If the authentication / authorization middleware is enabled, we have to check the permissions of the user by
		// using the provided information from the user and teams header.
		if a.enabled {
			// If the request doesn't contain a user id we return an unauthorized error, because at least the user id is
			// required to perform any kind of authorization.
			if userID == "" {
				log.Warn(r.Context(), "User ID is missing.")
				errresponse.Render(w, r, nil, http.StatusUnauthorized, "Unauthorized")
				return
			}

			// Get the value of the auth cookie. When we can not read the value of the cookie, we try to create a cookie
			// for the user. If we found the user or the teams he is part of we set a cookie for the user. If not we
			// return an unauthorized error.
			cookie, err := r.Cookie("kobs-auth")
			if err != nil {
				log.Warn(r.Context(), "Error while getting \"kobs-auth\" cookie.", zap.Error(err))

				user, err := a.getUser(r.Context(), userID, teamIDs)
				if err != nil {
					log.Warn(r.Context(), "Could not get user.", zap.Error(err), zap.String("user", userID), zap.Strings("teams", teamIDs))
					errresponse.Render(w, r, err, http.StatusUnauthorized, "Unauthorized")
					return
				}

				token, err := jwt.CreateToken(user, a.sessionToken, a.sessionInterval)
				if err != nil {
					log.Warn(r.Context(), "Could not create jwt token.", zap.Error(err))
					errresponse.Render(w, r, err, http.StatusUnauthorized, "Unauthorized")
					return
				}

				http.SetCookie(w, &http.Cookie{
					Name:  "kobs-auth",
					Value: token,
				})
				ctx = context.WithValue(ctx, authContext.UserKey, user)
			} else {
				// We have to check if the token from the "kobs-auth" cookie is still valid. If this is the case we are
				// done. If the token isn't valid anymore, we try to create a new token and update the cookie value with
				// the new token.
				log.Debug(r.Context(), "Found existing cookie.")

				user, err := jwt.ValidateToken(cookie.Value, a.sessionToken)
				if err != nil || user == nil {
					log.Warn(r.Context(), "Token validation failed.", zap.Error(err))

					newUser, err := a.getUser(r.Context(), userID, teamIDs)
					if err != nil {
						log.Warn(r.Context(), "Could not get user.", zap.Error(err), zap.String("user", userID), zap.Strings("teams", teamIDs))
						errresponse.Render(w, r, err, http.StatusUnauthorized, "Unauthorized")
						return
					}

					token, err := jwt.CreateToken(newUser, a.sessionToken, a.sessionInterval)
					if err != nil {
						log.Warn(r.Context(), "Could not create jwt token.", zap.Error(err))
						errresponse.Render(w, r, err, http.StatusUnauthorized, "Unauthorized")
						return
					}

					http.SetCookie(w, &http.Cookie{
						Name:  "kobs-auth",
						Value: token,
					})
					ctx = context.WithValue(ctx, authContext.UserKey, newUser)
				} else {
					ctx = context.WithValue(ctx, authContext.UserKey, *user)
				}
			}
		} else {
			// If authentication is disabled, we still check if the request contains a user id, which can be used for a
			// leightweighted audit loggin. If there is no user id we set a user with a static id, so that we still have
			// an valid user object which can be used by the plugins to simplify the authorization logic there.
			if userID == "" {
				userID = "kobs.io"
			}

			ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{
				ID: userID,
				Permissions: user.Permissions{
					Plugins:   []user.Plugin{{Name: "*"}},
					Resources: []user.Resources{{Clusters: []string{"*"}, Namespaces: []string{"*"}, Resources: []string{"*"}}},
				},
			})
		}

		// At this point the request context contains a valid user, so if authentication is enabled we have can check at
		// this point if the user can access a plugin.
		if a.enabled {
			urlPaths := strings.Split(r.URL.Path, "/")
			if len(urlPaths) >= 4 && urlPaths[1] == "api" && urlPaths[2] == "plugins" {
				user, err := authContext.GetUser(ctx)
				if err != nil {
					log.Warn(r.Context(), "User is now allowed to access the plugin.", zap.String("plugin", urlPaths[3]))
					errresponse.Render(w, r, nil, http.StatusForbidden, "Your are not allowed to access the plugin")
					return
				}

				if !user.HasPluginAccess(urlPaths[3]) {
					log.Warn(r.Context(), "User is now allowed to access the plugin.", zap.String("plugin", urlPaths[3]))
					errresponse.Render(w, r, nil, http.StatusForbidden, "Your are not allowed to access the plugin")
					return
				}
			}
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// New returns a new authentication and authorization object.
func New(enabled bool, headerUser, headerTeams, sessionToken string, sessionInterval time.Duration, clustersClient clusters.Client) *Auth {
	return &Auth{
		enabled:         enabled,
		headerUser:      headerUser,
		headerTeams:     headerTeams,
		sessionToken:    sessionToken,
		sessionInterval: sessionInterval,
		clustersClient:  clustersClient,
	}
}
