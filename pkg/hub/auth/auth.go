package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/kobsio/kobs/pkg/hub/store"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

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
	router       *chi.Mux
	oidcConfig   *oauth2.Config
	oidcProvider *oidc.Provider
	storeClient  store.Client
}

// MiddlewareHandler implements a middleware for the chi router, to check if the user is authorized to access kobs. If
// we coud not get a user from the request the middleware returns an unauthorized error and the user have to redo the
// authentication process.
func (c *client) MiddlewareHandler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		user, err := c.getUserFromRequest(r)
		if err != nil || user == nil {
			errresponse.Render(w, r, err, http.StatusUnauthorized, "Unauthorized")
			return
		}

		ctx = context.WithValue(ctx, authContext.UserKey, *user)

		next.ServeHTTP(w, r.WithContext(ctx))
	}

	return http.HandlerFunc(fn)
}

// Mount returns the router of the auth client, which can be used within another chi router to mount the authentication
// endpoint in the hub API.
func (c *client) Mount() chi.Router {
	return c.router
}

// getUserFromStore returns the user information for the currently authenticated user based on his email and groups from
// the store. This is required to get the users permissions, so that we can save them in the auth context.
func (c *client) getUserFromStore(ctx context.Context, userEmail string, teamGroups []string) (authContext.User, error) {
	authContextUser := authContext.User{Email: userEmail, Teams: teamGroups}

	users, err := c.storeClient.GetUsersByEmail(ctx, userEmail)
	if err != nil {
		return authContextUser, err
	}

	for _, user := range users {
		authContextUser.Permissions.Applications = append(authContextUser.Permissions.Applications, user.Permissions.Applications...)
		authContextUser.Permissions.Teams = append(authContextUser.Permissions.Teams, user.Permissions.Teams...)
		authContextUser.Permissions.Plugins = append(authContextUser.Permissions.Plugins, user.Permissions.Plugins...)
		authContextUser.Permissions.Resources = append(authContextUser.Permissions.Resources, user.Permissions.Resources...)
	}

	if teamGroups != nil {
		teams, err := c.storeClient.GetTeamsByGroups(ctx, teamGroups)
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

// getUserFromConfig returns a user with the given email from the configured users.
func (c *client) getUserFromConfig(email string) *UserConfig {
	for _, user := range c.config.Users {
		if user.Email == email {
			return &user
		}
	}

	return nil
}

// getUserFromRequest returns a user from the current request. For that we are checking if the auth cookie is present.
// If the cookie is present and contains a value auth token we return the user information in all other cases we are
// returning an error. If auth is not enabled we return a default user, with all permissions, so that we do not have to
// handle this within other API calls, because we will always have a valid user object there.
func (c *client) getUserFromRequest(r *http.Request) (*authContext.User, error) {
	if c.config.Enabled {
		cookie, err := r.Cookie("kobs")
		if err != nil {
			return nil, err
		}

		return jwt.ValidateToken[authContext.User](cookie.Value, c.config.Session.Token)
	}

	return &authContext.User{
		Email: "",
		Teams: nil,
		Permissions: userv1.Permissions{
			Applications: []userv1.ApplicationPermissions{{Type: "all"}},
			Teams:        []string{"*"},
			Plugins:      []userv1.Plugin{{Satellite: "*", Type: "*", Name: "*"}},
			Resources:    []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"*"}, Namespaces: []string{"*"}, Resources: []string{"*"}, Verbs: []string{"*"}}},
		},
	}, nil
}

// userHandler returns the current user. For that we try to get the user from the request if this fails we return an
// error. This method is indented to be used within the AuthContext in the React app, so that we can check if the user
// is authenticated and we can render the app or if we have to render the login page.
func (c *client) userHandler(w http.ResponseWriter, r *http.Request) {
	user, err := c.getUserFromRequest(r)
	if err != nil || user == nil {
		errresponse.Render(w, r, err, http.StatusUnauthorized, "Unauthorized")
		return
	}

	render.JSON(w, r, user)
}

// signinHandler handles the login of users, which are provided via the configuration file of the hub. For that we have
// to check if the user from the request is present in the configuration and if the provided password matches the
// configured password. If this is the case we are are creating a user object with all the users permissions and using
// it in the session token. The session token is then set as cookie, so it can be validated with each request.
func (c *client) signinHandler(w http.ResponseWriter, r *http.Request) {
	var signinRequest SigninRequest

	err := json.NewDecoder(r.Body).Decode(&signinRequest)
	if err != nil {
		log.Warn(r.Context(), "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	userConfig := c.getUserFromConfig(signinRequest.Email)
	if userConfig == nil {
		// When no user is found for the provided email address, we use a fixed password hash to prevent user
		// enumeration by timing requests. Here we are comparing the bcrypt-hashed version of "fakepassword" against
		// the user provided password.
		bcrypt.CompareHashAndPassword([]byte("$2y$10$UPPBv.HThEllgJZINbFwYOsru62d.LT0EqG3XLug2pG81IvemopH2"), []byte(signinRequest.Password))

		log.Warn(r.Context(), "Invalid email or password")
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid email or password")
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(userConfig.Password), []byte(signinRequest.Password))
	if err != nil {
		log.Warn(r.Context(), "Invalid email or password", zap.Error(err))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid email or password")
		return
	}

	user, err := c.getUserFromStore(r.Context(), userConfig.Email, userConfig.Groups)
	if err != nil {
		log.Warn(r.Context(), "Could not get user", zap.Error(err), zap.String("user", userConfig.Email), zap.Strings("teams", userConfig.Groups))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get user")
		return
	}

	token, err := jwt.CreateToken(user, c.config.Session.Token, c.config.Session.ParsedInterval)
	if err != nil {
		log.Warn(r.Context(), "Could not create jwt token", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not create jwt token")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "kobs",
		Value:    token,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().Add(c.config.Session.ParsedInterval),
	})

	render.JSON(w, r, nil)
}

// signoutHandler handles the logout for an user. For this we are setting the value of the auth cookie to an empty
// string and we adjust the expiration date of the cookie.
func (c *client) signoutHandler(w http.ResponseWriter, r *http.Request) {
	cookies := r.Cookies()

	for _, cookie := range cookies {
		if strings.HasPrefix(cookie.Name, "kobs") {
			http.SetCookie(w, &http.Cookie{
				Name:     cookie.Name,
				Value:    "",
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Unix(0, 0),
			})
		}
	}

	render.JSON(w, r, nil)
}

// oidcRedirectHandler returns the login for the OIDC provider, which can then be used by the user to authenticate via
// the configured provider. If no OIDC provider is configured this will return an error.
//
// We also "abusing" the state parameter by adding a redirect url, so that we have access to this url in the
// oidcCallbackHandler and that we can redirect the user to this url.
func (c *client) oidcHandler(w http.ResponseWriter, r *http.Request) {
	if c.oidcConfig == nil || c.oidcProvider == nil {
		log.Warn(r.Context(), "OIDC provider is not configured")
		errresponse.Render(w, r, nil, http.StatusBadRequest, "OIDC provider is not configured")
		return
	}

	data := struct {
		URL string `json:"url"`
	}{
		c.oidcConfig.AuthCodeURL(c.config.OIDC.State + url.QueryEscape(r.URL.Query().Get("redirect"))),
	}

	render.JSON(w, r, data)
}

// oidcCallbackHandler handles the callback from the OIDC login flow. Once we finished the OIDC flow and retrieved the
// user claims, we get the user object for the auth context and save the object in a cookie.
func (c *client) oidcCallbackHandler(w http.ResponseWriter, r *http.Request) {
	if c.oidcConfig == nil || c.oidcProvider == nil {
		log.Warn(r.Context(), "OIDC provider is not configured")
		errresponse.Render(w, r, nil, http.StatusBadRequest, "OIDC provider is not configured")
		return
	}

	state := r.URL.Query().Get("state")

	if !strings.HasPrefix(state, c.config.OIDC.State) {
		log.Warn(r.Context(), "Invalid state", zap.String("state", state))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid state")
		return
	}

	verifier := c.oidcProvider.Verifier(&oidc.Config{ClientID: c.config.OIDC.ClientID})

	oauth2Token, err := c.oidcConfig.Exchange(r.Context(), r.URL.Query().Get("code"))
	if err != nil {
		log.Warn(r.Context(), "Could not exchange authorization code into token", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not exchange authorization code into token")
		return
	}

	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		log.Warn(r.Context(), "Could not get raw id token")
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not get raw id token")
		return
	}

	idToken, err := verifier.Verify(r.Context(), rawIDToken)
	if err != nil {
		log.Warn(r.Context(), "Could not verify raw id token", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not verify raw id token")
		return
	}

	var claims struct {
		Email   string   `json:"email"`
		Picture string   `json:"picture"`
		Groups  []string `json:"groups"`
	}
	if err := idToken.Claims(&claims); err != nil {
		log.Warn(r.Context(), "Could not get claims", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get claims")
		return
	}

	user, err := c.getUserFromStore(r.Context(), claims.Email, claims.Groups)
	if err != nil {
		log.Warn(r.Context(), "Could not get user", zap.Error(err), zap.String("user", claims.Email), zap.Strings("teams", claims.Groups))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get user")
		return
	}

	token, err := jwt.CreateToken(user, c.config.Session.Token, c.config.Session.ParsedInterval)
	if err != nil {
		log.Warn(r.Context(), "Could not create jwt token", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not create jwt token")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "kobs",
		Value:    token,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().Add(c.config.Session.ParsedInterval),
	})

	data := struct {
		URL string `json:"url"`
	}{
		strings.TrimPrefix(state, c.config.OIDC.State),
	}

	render.JSON(w, r, data)
}

// NewClient returns a new auth client for handling authentication and authorization within the kobs hub. The auth
// client exports two mount function, one for mounting the middleware to verify requests and one for mounting the router
// for all auth related API endpoints.
func NewClient(config Config, storeClient store.Client) (Client, error) {
	sessionInterval := time.Duration(48 * time.Hour)
	if parsedSessionInterval, err := time.ParseDuration(config.Session.Interval); err == nil {
		sessionInterval = parsedSessionInterval
	}

	config.Session.ParsedInterval = sessionInterval

	var oidcConfig *oauth2.Config
	var oidcProvider *oidc.Provider
	if config.OIDC.Enabled {
		oidcScopes := []string{"openid", "profile", "email", "groups"}
		if len(config.OIDC.Scopes) > 0 {
			oidcScopes = config.OIDC.Scopes
		}

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
			Scopes:       oidcScopes,
		}
	}

	c := &client{
		config:       config,
		router:       chi.NewRouter(),
		oidcConfig:   oidcConfig,
		oidcProvider: oidcProvider,
		storeClient:  storeClient,
	}

	c.router.Get("/", c.userHandler)
	c.router.Post("/signin", c.signinHandler)
	c.router.Get("/signout", c.signoutHandler)
	c.router.Get("/oidc", c.oidcHandler)
	c.router.Get("/oidc/callback", c.oidcCallbackHandler)

	return c, nil
}
