package auth

//go:generate mockgen -source=auth.go -destination=./auth_mock.go -package=auth Client

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/hub/app/settings"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
)

type Client interface {
	MiddlewareHandler(next http.Handler) http.Handler
	Mount() chi.Router
}

type client struct {
	config       Config
	appSettings  settings.Settings
	router       *chi.Mux
	dbClient     db.Client
	oidcConfig   *oauth2.Config
	oidcProvider *oidc.Provider
}

// MiddlewareHandler implements a middleware for the chi router, to check if the user is authorized to access kobs. If
// we coud not get a user from the request the middleware returns an unauthorized error and the user have to redo the
// authentication process.
func (c *client) MiddlewareHandler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		token, err := r.Cookie("kobs.token")
		if err != nil {
			log.Warn(ctx, "Failed to get token from cookie", zap.Error(err))
			errresponse.Render(w, r, http.StatusUnauthorized, "Failed to get token from cookie")
			return
		}

		tokenClaims, err := jwt.ValidateToken[Token](token.Value, c.config.Session.Token)
		if err != nil {
			log.Warn(ctx, "Failed to validate token", zap.Error(err))
			errresponse.Render(w, r, http.StatusUnauthorized, "Failed to validate token")
			return
		}

		session, err := c.dbClient.GetSession(ctx, tokenClaims.SessionID)
		if err != nil {
			errresponse.Render(w, r, http.StatusUnauthorized)
			return
		}

		ctx = context.WithValue(ctx, authContext.UserKey, session.User)
		next.ServeHTTP(w, r.WithContext(ctx))
	}

	return http.HandlerFunc(fn)
}

// Mount returns the router of the auth client, which can be used within another chi router to mount the authentication
// endpoint in the hub API.
func (c *client) Mount() chi.Router {
	return c.router
}

// authHandler is the request handler for authenticated users, which is called as soon as the user opens the app. If the
// user already has a valid token / session we return the user object stored within the users session. If we are not
// able to verify the token or to find a corresponding session in our database we return an unauthorized error, so that
// the user must be re-authenticated.
func (c *client) authHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	token, err := r.Cookie("kobs.token")
	if err != nil {
		log.Warn(ctx, "Failed to get token from cookie", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Failed to get token from cookie")
		return
	}

	tokenClaims, err := jwt.ValidateToken[Token](token.Value, c.config.Session.Token)
	if err != nil {
		log.Warn(ctx, "Failed to validate token", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Failed to validate token")
		return
	}

	session, err := c.dbClient.GetAndUpdateSession(ctx, tokenClaims.SessionID)
	if err != nil {
		if errors.Is(err, db.ErrSessionNotFound) {
			log.Warn(ctx, "Session not found", zap.Error(err))
			errresponse.Render(w, r, http.StatusUnauthorized)
			return
		}

		log.Warn(ctx, "Failed to update session", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to update session")
		return
	}

	user, err := c.dbClient.GetUserByID(ctx, session.User.ID)
	if err != nil {
		log.Warn(ctx, "Failed to get user from database", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get user from database")
		return
	}

	render.JSON(w, r, userResponse{
		User:       session.User,
		Dashboards: c.appSettings.GetDashboards(user),
		Navigation: c.appSettings.GetNavigation(user),
	})
}

// signinHandler is the request handler for handling the sign in of a user. To sign in a user we have to check if that
// the user has a User CR. If this is the case we check if the provided password matches the password from the CR.
// Finally we create a new user for the auth context and a new session / token, which is saved in a cookie and can be
// used in the following requests to validate the user.
func (c *client) signinHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var signinRequestData signinRequest

	err := json.NewDecoder(r.Body).Decode(&signinRequestData)
	if err != nil {
		log.Warn(ctx, "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	user, err := c.dbClient.GetUserByID(ctx, signinRequestData.Username)
	if err != nil {
		log.Warn(ctx, "Failed to get user from database", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get user from database")
		return
	}

	if user == nil {
		// When no user is found for the provided email address, we use a fixed password hash to prevent user
		// enumeration by timing requests. Here we are comparing the bcrypt-hashed version of "fakepassword" against
		// the user provided password.
		bcrypt.CompareHashAndPassword([]byte("$2y$10$UPPBv.HThEllgJZINbFwYOsru62d.LT0EqG3XLug2pG81IvemopH2"), []byte(signinRequestData.Password))

		log.Warn(ctx, "Invalid username or password")
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid username or password")
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(signinRequestData.Password))
	if err != nil {
		log.Warn(ctx, "Invalid username or password", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid username or password")
		return
	}

	authContextUser := authContext.User{
		ID:          user.ID,
		Name:        user.DisplayName,
		Teams:       user.Teams,
		Permissions: user.Permissions,
	}

	if user.Teams != nil {
		teams, err := c.dbClient.GetTeamsByIDs(ctx, user.Teams)
		if err != nil {
			log.Warn(ctx, "Failed to get teams from database", zap.Error(err))
			errresponse.Render(w, r, http.StatusBadRequest, "Failed to get teams from database")
			return
		}

		for _, team := range teams {
			authContextUser.Permissions.Applications = append(authContextUser.Permissions.Applications, team.Permissions.Applications...)
			authContextUser.Permissions.Teams = append(authContextUser.Permissions.Teams, team.Permissions.Teams...)
			authContextUser.Permissions.Plugins = append(authContextUser.Permissions.Plugins, team.Permissions.Plugins...)
			authContextUser.Permissions.Resources = append(authContextUser.Permissions.Resources, team.Permissions.Resources...)
		}
	}

	session, err := c.dbClient.CreateSession(ctx, authContextUser)
	if err != nil {
		log.Warn(ctx, "Failed to create session", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to create session")
		return
	}

	token, err := jwt.CreateToken(&Token{SessionID: session.ID}, c.config.Session.Token, c.config.Session.Duration.Duration)
	if err != nil {
		log.Warn(ctx, "Failed to create token", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to create token")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "kobs.token",
		Value:    token,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().Add(c.config.Session.Duration.Duration),
	})

	render.JSON(w, r, userResponse{
		User:       authContextUser,
		Dashboards: c.appSettings.GetDashboards(user),
		Navigation: c.appSettings.GetNavigation(user),
	})
}

// signoutHandler handle the sign out of a user. For that we have to get the token for the users current session, to
// delete this session from the database. When the session was deleted we also delete the coookie with the users token.
//
// If we are not able to get the token, to validate the token or to delete the corresponding session from the database
// we return an internal server error or bad request error.
func (c *client) signoutHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	token, err := r.Cookie("kobs.token")
	if err != nil {
		log.Warn(ctx, "Failed to get token from cookie", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get token from cookie")
		return
	}

	tokenClaims, err := jwt.ValidateToken[Token](token.Value, c.config.Session.Token)
	if err != nil {
		log.Warn(ctx, "Failed to validate token", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to validate token")
		return
	}

	err = c.dbClient.DeleteSession(ctx, tokenClaims.SessionID)
	if err != nil {
		log.Warn(ctx, "Failed to delete session", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to delete session")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "kobs.token",
		Value:    "",
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Unix(0, 0),
	})

	render.Status(r, http.StatusNoContent)
	render.JSON(w, r, nil)
}

// oidcHandler returns the login url which must be opened by a user to authenticate via the OIDC provider. If no OIDC
// provider is configured an error is returned, so that we do not show a sign in via OIDC button in the React app.
func (c *client) oidcHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	if c.oidcConfig == nil || c.oidcProvider == nil {
		log.Debug(ctx, "OIDC provider is not configured")
		errresponse.Render(w, r, http.StatusBadRequest, "OIDC provider is not configured")
		return
	}

	data := struct {
		URL string `json:"url"`
	}{
		c.oidcConfig.AuthCodeURL(c.config.OIDC.State + url.QueryEscape(r.URL.Query().Get("redirect"))),
	}

	render.JSON(w, r, data)
}

func (c *client) oidcCallbackHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	if c.oidcConfig == nil || c.oidcProvider == nil {
		log.Warn(ctx, "OIDC provider is not configured")
		errresponse.Render(w, r, http.StatusBadRequest, "OIDC provider is not configured")
		return
	}

	state := r.URL.Query().Get("state")

	if !strings.HasPrefix(state, c.config.OIDC.State) {
		log.Warn(ctx, "Invalid 'state' parameter", zap.String("state", state))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid 'state' parameter")
		return
	}

	verifier := c.oidcProvider.Verifier(&oidc.Config{ClientID: c.config.OIDC.ClientID})

	oauth2Token, err := c.oidcConfig.Exchange(ctx, r.URL.Query().Get("code"))
	if err != nil {
		log.Warn(ctx, "Failed to exchange authorization code into token", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to exchange authorization code into token")
		return
	}

	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		log.Warn(ctx, "Faile to get raw id token")
		errresponse.Render(w, r, http.StatusBadRequest, "Faile to get raw id token")
		return
	}

	idToken, err := verifier.Verify(ctx, rawIDToken)
	if err != nil {
		log.Warn(ctx, "Failed to verify raw id token", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to verify raw id token")
		return
	}

	var claims struct {
		Email  string   `json:"email"`
		Name   string   `json:"name"`
		Groups []string `json:"groups"`
	}
	if err := idToken.Claims(&claims); err != nil {
		log.Warn(ctx, "Failed to get claims", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get claims")
		return
	}

	authContextUser := &authContext.User{
		ID:    claims.Email,
		Name:  claims.Name,
		Teams: claims.Groups,
	}

	user, err := c.dbClient.GetUserByID(ctx, authContextUser.ID)
	if err != nil {
		log.Warn(ctx, "Failed to get user from database", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get user from database")
		return
	}

	if user != nil {
		authContextUser.Permissions.Applications = append(authContextUser.Permissions.Applications, user.Permissions.Applications...)
		authContextUser.Permissions.Teams = append(authContextUser.Permissions.Teams, user.Permissions.Teams...)
		authContextUser.Permissions.Plugins = append(authContextUser.Permissions.Plugins, user.Permissions.Plugins...)
		authContextUser.Permissions.Resources = append(authContextUser.Permissions.Resources, user.Permissions.Resources...)
	}

	if authContextUser.Teams != nil {
		teams, err := c.dbClient.GetTeamsByIDs(ctx, authContextUser.Teams)
		if err != nil {
			log.Warn(ctx, "Failed to get teams from database", zap.Error(err))
			errresponse.Render(w, r, http.StatusBadRequest, "Failed to get teams from database")
			return
		}

		for _, team := range teams {
			authContextUser.Permissions.Applications = append(authContextUser.Permissions.Applications, team.Permissions.Applications...)
			authContextUser.Permissions.Teams = append(authContextUser.Permissions.Teams, team.Permissions.Teams...)
			authContextUser.Permissions.Plugins = append(authContextUser.Permissions.Plugins, team.Permissions.Plugins...)
			authContextUser.Permissions.Resources = append(authContextUser.Permissions.Resources, team.Permissions.Resources...)
		}
	}

	session, err := c.dbClient.CreateSession(ctx, *authContextUser)
	if err != nil {
		log.Warn(ctx, "Failed to create session", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to create session")
		return
	}

	token, err := jwt.CreateToken(&Token{SessionID: session.ID}, c.config.Session.Token, c.config.Session.Duration.Duration)
	if err != nil {
		log.Warn(ctx, "Failed to create token", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to create token")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "kobs.token",
		Value:    token,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().Add(c.config.Session.Duration.Duration),
	})

	data := struct {
		User userResponse `json:"user"`
		URL  string       `json:"url"`
	}{
		User: userResponse{
			User:       *authContextUser,
			Dashboards: c.appSettings.GetDashboards(user),
			Navigation: c.appSettings.GetNavigation(user),
		},
		URL: strings.TrimPrefix(state, c.config.OIDC.State),
	}

	render.JSON(w, r, data)
}

// NewClient returns a new auth client for handling authentication and authorization within the kobs hub. The auth
// client exports two mount function, one for mounting the middleware to verify requests and one for mounting the router
// for all auth related API endpoints.
func NewClient(config Config, appSettings settings.Settings, dbClient db.Client) (Client, error) {
	var oidcConfig *oauth2.Config
	var oidcProvider *oidc.Provider

	if config.OIDC.Enabled {
		provider, err := oidc.NewProvider(context.Background(), config.OIDC.Issuer)
		if err != nil {
			return nil, err
		}
		oidcProvider = provider

		oidcConfig = &oauth2.Config{
			ClientID:     config.OIDC.ClientID,
			ClientSecret: config.OIDC.ClientSecret,
			RedirectURL:  config.OIDC.RedirectURL,
			Endpoint:     provider.Endpoint(),
			Scopes:       config.OIDC.Scopes,
		}
	}

	c := &client{
		config:       config,
		appSettings:  appSettings,
		router:       chi.NewRouter(),
		oidcConfig:   oidcConfig,
		oidcProvider: oidcProvider,
		dbClient:     dbClient,
	}

	c.router.Get("/", c.authHandler)
	c.router.Post("/signin", c.signinHandler)
	c.router.Get("/signout", c.signoutHandler)
	c.router.Get("/oidc", c.oidcHandler)
	c.router.Get("/oidc/callback", c.oidcCallbackHandler)

	return c, nil
}
