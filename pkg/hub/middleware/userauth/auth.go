package userauth

import (
	"context"
	"net/http"
	"strings"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/middleware/userauth/jwt"
	"github.com/kobsio/kobs/pkg/hub/store"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"go.uber.org/zap"
)

// Auth is the struct for handling authorization for resources.
type Auth struct {
	enabled         bool
	headerUser      string
	headerTeams     string
	sessionToken    string
	sessionInterval time.Duration
	storeClient     store.Client
}

// getUser returns the user information for the currently authenticated user. For that we are getting all users and
// teams from all clusters. Then we are checking if the given userEmail is set for one of the returned users. If this is
// the case we are setting the user information from this User CR.
// In the next step we are looping through all the returned teams and adding the user permissions. Since it could happen
// that the passed-in teamGroups contains teams that are not set for a user or there is no User CR for a user, we also add
// these teams to the list of teams for a user, when it is not already present.
func (a *Auth) getUser(ctx context.Context, userEmail string, teamGroups []string) (authContext.User, error) {
	authContextUser := authContext.User{Email: userEmail}

	// TODO: Get user based on userEmail and teams based on teamGroup from store

	return authContextUser, nil
}

// Handler is the handler for the auth middleware. In the middleware we check if authentication is enabled. If this is
// the case we check if the request contains a valid jwt cookie in the "kobs-auth" token. If we do not found a valid
// token we try to create a new one and set it as cookie, before we return an unauthorized error. If the authorization
// succeeds we also inject the user in the request context.
func (a *Auth) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		userEmail := r.Header.Get(a.headerUser)
		teamGroups := strings.Split(r.Header.Get(a.headerTeams), ",")

		// If the authentication / authorization middleware is enabled, we have to check the permissions of the user by
		// using the provided information from the user and teams header.
		if a.enabled {
			// If the request doesn't contain a user id we return an unauthorized error, because at least the user id is
			// required to perform any kind of authorization.
			if userEmail == "" {
				log.Warn(r.Context(), "User ID is missing")
				errresponse.Render(w, r, nil, http.StatusUnauthorized, "Unauthorized")
				return
			}

			// Get the value of the auth cookie. When we can not read the value of the cookie, we try to create a cookie
			// for the user. If we found the user or the teams the user is part of we set a cookie for the user. If not
			// we return an unauthorized error.
			cookie, err := r.Cookie("kobs-auth")
			if err != nil {
				log.Warn(r.Context(), "Error while getting \"kobs-auth\" cookie", zap.Error(err))

				user, err := a.getUser(r.Context(), userEmail, teamGroups)
				if err != nil {
					log.Warn(r.Context(), "Could not get user", zap.Error(err), zap.String("user", userEmail), zap.Strings("teams", teamGroups))
					errresponse.Render(w, r, err, http.StatusUnauthorized, "Unauthorized")
					return
				}

				token, err := jwt.CreateToken(user, a.sessionToken, a.sessionInterval)
				if err != nil {
					log.Warn(r.Context(), "Could not create jwt token", zap.Error(err))
					errresponse.Render(w, r, err, http.StatusUnauthorized, "Unauthorized")
					return
				}

				http.SetCookie(w, &http.Cookie{
					Name:     "kobs-auth",
					Value:    token,
					Secure:   true,
					HttpOnly: true,
				})
				ctx = context.WithValue(ctx, authContext.UserKey, user)
			} else {
				// We have to check if the token from the "kobs-auth" cookie is still valid. If this is the case we are
				// done. If the token isn't valid anymore, we try to create a new token and update the cookie value with
				// the new token.
				log.Debug(r.Context(), "Found existing cookie")

				user, err := jwt.ValidateToken(cookie.Value, a.sessionToken)
				if err != nil || user == nil {
					log.Warn(r.Context(), "Token validation failed", zap.Error(err))

					newUser, err := a.getUser(r.Context(), userEmail, teamGroups)
					if err != nil {
						log.Warn(r.Context(), "Could not get user", zap.Error(err), zap.String("user", userEmail), zap.Strings("teams", teamGroups))
						errresponse.Render(w, r, err, http.StatusUnauthorized, "Unauthorized")
						return
					}

					token, err := jwt.CreateToken(newUser, a.sessionToken, a.sessionInterval)
					if err != nil {
						log.Warn(r.Context(), "Could not create jwt token", zap.Error(err))
						errresponse.Render(w, r, err, http.StatusUnauthorized, "Unauthorized")
						return
					}

					http.SetCookie(w, &http.Cookie{
						Name:     "kobs-auth",
						Value:    token,
						Secure:   true,
						HttpOnly: true,
					})
					ctx = context.WithValue(ctx, authContext.UserKey, newUser)
				} else {
					ctx = context.WithValue(ctx, authContext.UserKey, *user)
				}
			}
		} else {
			// If authentication is disabled, we still check if the request contains a user id, which can be used for a
			// lightweight audit logging. If there is no user id we set a user with a static id, so that we still have
			// a valid user object which can be used by the plugins to simplify the authorization logic there.
			if userEmail == "" {
				userEmail = "kobs.io"
			}

			ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{
				Email: userEmail,
				Permissions: userv1.Permissions{
					Plugins:   []userv1.Plugin{{Name: "*"}},
					Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"*"}, Resources: []string{"*"}, Verbs: []string{"*"}}},
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
					log.Warn(r.Context(), "User is now allowed to access the plugin", zap.String("plugin", urlPaths[3]))
					errresponse.Render(w, r, nil, http.StatusForbidden, "Your are not allowed to access the plugin")
					return
				}

				if !user.HasPluginAccess(urlPaths[3]) {
					log.Warn(r.Context(), "User is now allowed to access the plugin", zap.String("plugin", urlPaths[3]))
					errresponse.Render(w, r, nil, http.StatusForbidden, "Your are not allowed to access the plugin")
					return
				}
			}
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// New returns a new authentication and authorization object.
func New(enabled bool, headerUser, headerTeams, sessionToken string, sessionInterval time.Duration, storeClient store.Client) *Auth {
	return &Auth{
		enabled:         enabled,
		headerUser:      headerUser,
		headerTeams:     headerTeams,
		sessionToken:    sessionToken,
		sessionInterval: sessionInterval,
		storeClient:     storeClient,
	}
}
