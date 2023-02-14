package auth

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/render"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"go.uber.org/zap"
)

// getUserFromStore returns the user information for the currently authenticated user based on his email and groups from
// the store. This is required to get the users permissions, so that we can save them in the auth context.
func (c *client) getUserFromStore(ctx context.Context, userEmail string, teamGroups []string) (*authContext.User, error) {
	authContextUser := &authContext.User{ID: userEmail, Teams: teamGroups}

	user, err := c.dbClient.GetUserByID(ctx, userEmail)
	if err != nil {
		return authContextUser, err
	}

	authContextUser.Permissions.Applications = append(authContextUser.Permissions.Applications, user.Permissions.Applications...)
	authContextUser.Permissions.Teams = append(authContextUser.Permissions.Teams, user.Permissions.Teams...)
	authContextUser.Permissions.Plugins = append(authContextUser.Permissions.Plugins, user.Permissions.Plugins...)
	authContextUser.Permissions.Resources = append(authContextUser.Permissions.Resources, user.Permissions.Resources...)

	if teamGroups != nil {
		teams, err := c.dbClient.GetTeamsByIDs(ctx, teamGroups)
		if err != nil {
			return authContextUser, err
		}

		for _, team := range teams {
			authContextUser.Permissions.Applications = append(authContextUser.Permissions.Applications, team.Permissions.Applications...)
			authContextUser.Permissions.Teams = append(authContextUser.Permissions.Teams, team.Permissions.Teams...)
			authContextUser.Permissions.Plugins = append(authContextUser.Permissions.Plugins, team.Permissions.Plugins...)
			authContextUser.Permissions.Resources = append(authContextUser.Permissions.Resources, team.Permissions.Resources...)
		}
	}

	return authContextUser, nil
}

var timeInf = time.Unix(-2208988800, 0).Add(1<<63 - 1)

// getUserFromRequest returns a user from the current request. For that we are checking if the auth cookie is present.
// If the cookie is present and contains a value auth token we return the user information in all other cases we are
// returning an error. If auth is not enabled we return a default user, with all permissions, so that we do not have to
// handle this within other API calls, because we will always have a valid user object there.
func (c *client) getUserFromRequest(r *http.Request) (*authContext.User, *time.Time, error) {
	if c.config.Enabled {
		cookie, err := r.Cookie("kobs.accesstoken")
		if err != nil {
			return nil, nil, err
		}

		claims, err := jwt.ValidateToken[Session](cookie.Value, c.config.Session.Token)
		if err != nil {
			return nil, nil, err
		}

		if user, err := c.getUserFromStore(r.Context(), claims.Data.Email, claims.Data.Teams); err != nil {
			return nil, nil, err
		} else {
			return user, &claims.ExpiresAt.Time, nil
		}
	}

	return &authContext.User{
		ID:    "",
		Teams: nil,
		Permissions: userv1.Permissions{
			Applications: []userv1.ApplicationPermissions{{Type: "all"}},
			Teams:        []string{"*"},
			Plugins:      []userv1.Plugin{{Type: "*", Name: "*"}},
			Resources:    []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"*"}, Resources: []string{"*"}, Verbs: []string{"*"}}},
		},
	}, &timeInf, nil // TODO: is this a good value here?
}

// userHandler returns the current user. For that we try to get the user from the request if this fails we return an
// error. This method is indented to be used within the AuthContext in the React app, so that we can check if the user
// is authenticated and we can render the app or if we have to render the login page.
func (c *client) userHandler(w http.ResponseWriter, r *http.Request) {
	user, _, err := c.getUserFromRequest(r)
	if err != nil || user == nil {
		log.Error(r.Context(), "Could not get user from request", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, fmt.Errorf("Unauthorized"))
		return
	}

	render.JSON(w, r, user)
}
