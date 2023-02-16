package auth

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/go-chi/render"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/kobsio/kobs/pkg/hub/auth/refreshtoken"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"go.uber.org/zap"
	"golang.org/x/oauth2"
)

// getUserFromDB returns the user information for the currently authenticated user based on his email and groups from
// the store. This is required to get the users permissions, so that we can save them in the auth context.
func (c *client) getUserFromDB(ctx context.Context, userEmail string, teamGroups []string) (*authContext.User, error) {
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

func (c *client) accessTokenIsSet(r *http.Request) bool {
	_, err := r.Cookie("kobs.accesstoken")
	return err == nil
}

// getUserFromRequest returns a user from the current request. For that we are checking if the auth cookie is present.
// If the cookie is present and contains a value auth token we return the user information in all other cases we are
// returning an error. If auth is not enabled we return a default user, with all permissions, so that we do not have to
// handle this within other API calls, because we will always have a valid user object there.
func (c *client) getUserFromRequest(r *http.Request) (*authContext.User, error) {
	cookie, err := r.Cookie("kobs.accesstoken")
	if err != nil {
		return nil, err
	}

	claims, err := jwt.ValidateToken[Session](cookie.Value, c.config.Session.Token)
	if err != nil {
		return nil, fmt.Errorf("unexpected error when parsing the accesstoken, %w", err)
	}

	if user, err := c.getUserFromDB(r.Context(), claims.Data.Email, claims.Data.Teams); err != nil {
		return nil, err
	} else {
		return user, nil
	}
}

type meResponse struct {
	User        *authContext.User `json:"user"`
	AccessToken string            `json:"accessToken"`
}

// meHandler returns the current user. For that we try to get the user from the request if this fails we return an
// error. This method is indented to be used within the AuthContext in the React app, so that we can check if the user
// is authenticated and we can render the app or if we have to render the login page.
func (c *client) meHandler(w http.ResponseWriter, r *http.Request) {
	var result meResponse

	accessTokenIsSet := c.accessTokenIsSet(r)
	userWantsRefresh := r.URL.Query().Get("refresh") == "true"
	if !accessTokenIsSet || userWantsRefresh {
		log.Debug(r.Context(), "must refresh session", zap.Bool("accessTokenIsExpired", accessTokenIsSet), zap.Bool("userWantsRefresh", userWantsRefresh))
		accessToken, refreshToken, err := c.refreshSession(w, r)
		if err != nil {
			log.Error(r.Context(), "failed refresh the session", zap.Error(err))
			errresponse.Render(w, r, http.StatusUnauthorized, fmt.Errorf("unauthorized"))
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "kobs.accesstoken",
			Value:    accessToken,
			Path:     "/",
			Secure:   true,
			HttpOnly: true,
			Expires:  time.Now().Add(c.config.Session.ParsedInterval),
		})

		http.SetCookie(w, &http.Cookie{
			Name:     "kobs.refreshtoken",
			Value:    refreshToken,
			Path:     "/",
			Secure:   true,
			HttpOnly: true,
			Expires:  time.Now().Add(365 * 24 * time.Hour),
		})

		result.AccessToken = accessToken
	} else {
		cookie, err := r.Cookie("kobs.accesstoken")
		if err != nil {
			errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("couldn't fetch accesstoken from cookie"))
			return
		}

		result.AccessToken = cookie.Value
	}

	claims, err := jwt.ValidateToken[Session](result.AccessToken, c.config.Session.Token)
	if err != nil {
		errresponse.Render(w, r, http.StatusUnauthorized, fmt.Errorf("couldn't validate the accesstoken"))
		return
	}

	user, err := c.getUserFromDB(r.Context(), claims.Data.Email, claims.Data.Teams)
	if err != nil {
		log.Error(r.Context(), "failed to fetch the user from db", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("unexpected error when fetching user"))
		return
	}
	result.User = user

	render.JSON(w, r, result)
}

// refreshSession uses the refreshtoken to renew the users session
func (c *client) refreshSession(w http.ResponseWriter, r *http.Request) (string, string, error) {
	cookie, err := r.Cookie("kobs.refreshtoken")
	if err != nil {
		return "", "", fmt.Errorf("unexpected error when fetching cookie for refreshtoken, %w", err)
	}

	refreshToken, err := refreshtoken.FromString(cookie.Value)
	if err != nil {
		return "", "", fmt.Errorf("unable to parse refreshtoken, %w", err)
	}

	var newRefreshToken string
	var teams []string
	if refreshToken.Type == refreshtoken.Credentials {
		userConf := c.getUserFromConfig(refreshToken.UserID)
		oldPasswordHash := refreshToken.Value
		newPasswordHash := userConf.getHash()

		if oldPasswordHash != newPasswordHash {
			return "", "", fmt.Errorf("password changed, user should sign in again")
		}

		newRefreshToken = cookie.Value
		teams = userConf.Groups
	}

	if refreshToken.Type == refreshtoken.OIDC {
		tokenSource := c.oidcConfig.TokenSource(r.Context(), &oauth2.Token{RefreshToken: refreshToken.Value})
		newToken, err := tokenSource.Token()
		if err != nil {
			return "", "", fmt.Errorf("unable to fetch new token from oidc provider, %w", err)
		}

		rawIDToken, ok := newToken.Extra("id_token").(string)
		if !ok {
			return "", "", fmt.Errorf("could not get raw id token, %w", err)
		}

		// TODO: move verifier to client
		verifier := c.oidcProvider.Verifier(&oidc.Config{ClientID: c.config.OIDC.ClientID})
		idToken, err := verifier.Verify(r.Context(), rawIDToken)
		if err != nil {
			return "", "", fmt.Errorf("could not verify raw id token, %w", err)
		}

		var claims struct {
			Email   string   `json:"email"`
			Picture string   `json:"picture"`
			Groups  []string `json:"groups"`
		}
		if err := idToken.Claims(&claims); err != nil {
			return "", "", fmt.Errorf("couldn't get claims, %w", err)
		}

		newRefreshToken, err = refreshtoken.Token{
			Type:   refreshtoken.OIDC,
			Value:  newToken.RefreshToken,
			UserID: refreshToken.UserID,
		}.Encode()
		if err != nil {
			return "", "", fmt.Errorf("unexpected error when encoding refreshtoken, %w", err)
		}

		teams = claims.Groups
	}

	if newRefreshToken == "" {
		return "", "", fmt.Errorf("new refreshtoken is empty, %w", err)
	}

	accessToken, err := jwt.CreateToken(&session{Email: refreshToken.UserID, Teams: teams}, c.config.Session.Token, c.config.Session.ParsedInterval)
	if err != nil {
		return "", "", fmt.Errorf("could not create jwt token, %w", err)
	}

	return accessToken, newRefreshToken, nil
}
