package auth

//go:generate mockgen -source=client.go -destination=./client_mock.go -package=auth Client

import (
	"context"
	"crypto/md5"
	"fmt"
	"net/http"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/go-chi/chi/v5"
	"github.com/kobsio/kobs/pkg/hub/db"
	"golang.org/x/oauth2"
)

type Config struct {
	Enabled bool          `json:"enabled"`
	OIDC    OIDCConfig    `json:"oidc" embed:"" prefix:"oidc."`
	Session SessionConfig `json:"session" embed:"" prefix:"session."`
	Users   []userConfig  `json:"users" kong:"-"`
}

type SessionConfig struct {
	Token          string        `json:"token"`
	Interval       string        `json:"interval"`
	ParsedInterval time.Duration `json:"-"`
}

type userConfig struct {
	Email    string   `json:"email"`
	Password string   `json:"password"`
	Groups   []string `json:"groups"`
}

func (u *userConfig) getHash() string {
	hash := md5.Sum([]byte(u.Password))
	return fmt.Sprintf("%x", hash)
}

type OIDCConfig struct {
	Enabled      bool     `json:"enabled"`
	Issuer       string   `json:"issuer"`
	ClientID     string   `json:"clientID"`
	ClientSecret string   `json:"clientSecret"`
	RedirectURL  string   `json:"redirectURL"`
	State        string   `json:"state"`
	Scopes       []string `json:"scopes"`
}

type Client interface {
	MiddlewareHandler(next http.Handler) http.Handler
	Mount() chi.Router
}

type client struct {
	config       Config
	router       *chi.Mux
	dbClient     db.Client
	oidcConfig   *oauth2.Config
	oidcProvider *oidc.Provider
}

// Mount returns the router of the auth client, which can be used within another chi router to mount the authentication
// endpoit in the hub API.
func (c *client) Mount() chi.Router {
	return c.router
}

// NewClient returns a new auth client for handling authentication and authorization within the kobs hub. The auth
// client exports two mount function, one for mounting the middleware to verify requests and one for mounting the router
// for all auth related API endpoints.
func NewClient(config Config, dbClient db.Client) (Client, error) {
	sessionInterval := time.Duration(48 * time.Hour)
	if parsedSessionInterval, err := time.ParseDuration(config.Session.Interval); err == nil {
		sessionInterval = parsedSessionInterval
	}

	config.Session.ParsedInterval = sessionInterval

	var oidcConfig *oauth2.Config
	var oidcProvider *oidc.Provider
	if config.OIDC.Enabled {
		oidcScopes := []string{"openid", "profile", "email", "groups", "offline_access"}
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
		dbClient:     dbClient,
	}

	c.router.Get("/me", c.meHandler)
	c.router.Post("/signin", c.signinHandler)
	// c.router.Get("/signout", c.signoutHandler)
	c.router.Get("/oidc", c.oidcHandler)
	c.router.Get("/oidc/callback", c.oidcCallbackHandler)

	return c, nil
}
