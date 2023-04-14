package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"context"
	"fmt"
	"net/http"
	"regexp"
	"time"

	"github.com/google/go-github/github"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/mitchellh/mapstructure"
	"golang.org/x/oauth2"
	githuboauth "golang.org/x/oauth2/github"
)

var (
	slugifyRe = regexp.MustCompile("[^a-z0-9]+")
)

// Config is the structure of the configuration for a single GitHub instance.
type Config struct {
	Organization string        `json:"organization"`
	OAuth        OAuthConfig   `json:"oauth"`
	Session      SessionConfig `json:"session"`
}

type OAuthConfig struct {
	ClientID     string `json:"clientID"`
	ClientSecret string `json:"clientSecret"`
	State        string `json:"state"`
}

type SessionConfig struct {
	Token          string        `json:"token"`
	Duration       string        `json:"duration"`
	ParsedDuration time.Duration `json:"-"`
}

type Instance interface {
	GetName() string
	GetOrganization() string
	TokenToCookie(token *oauth2.Token) (*http.Cookie, error)
	TokenFromCookie(r *http.Request) (*oauth2.Token, error)
	OAuthLoginURL() string
	OAuthCallback(ctx context.Context, state, code string) (*oauth2.Token, *github.User, error)
	OAuthIsAuthenticated(ctx context.Context, token *oauth2.Token) (*github.User, error)
}

type instance struct {
	name        string
	config      Config
	oauthConfig *oauth2.Config
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) GetOrganization() string {
	return i.config.Organization
}

// TokenToCookie returns a cookie for the given oauth token.
func (i *instance) TokenToCookie(token *oauth2.Token) (*http.Cookie, error) {
	jwtToken, err := jwt.CreateToken(token, i.config.Session.Token, i.config.Session.ParsedDuration)
	if err != nil {
		return nil, err
	}

	return &http.Cookie{
		Name:     "kobs.plugin.github." + i.name,
		Value:    jwtToken,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().Add(i.config.Session.ParsedDuration),
	}, nil
}

// TokenFromCookie returns the token from the "kobs-oauth-github" cookie in the given request.
func (i *instance) TokenFromCookie(r *http.Request) (*oauth2.Token, error) {
	cookie, err := r.Cookie("kobs.plugin.github." + i.name)
	if err != nil {
		return nil, err
	}

	return jwt.ValidateToken[oauth2.Token](cookie.Value, i.config.Session.Token)
}

func (i *instance) OAuthLoginURL() string {
	return i.oauthConfig.AuthCodeURL(i.config.OAuth.State, oauth2.AccessTypeOnline)
}

func (i *instance) OAuthCallback(ctx context.Context, state, code string) (*oauth2.Token, *github.User, error) {
	if state != i.config.OAuth.State {
		return nil, nil, fmt.Errorf("invalid oauth state, expected '%s', got '%s'", i.config.OAuth.State, state)
	}

	token, err := i.oauthConfig.Exchange(ctx, code)
	if err != nil {
		return nil, nil, err
	}

	oauthClient := i.oauthConfig.Client(ctx, token)
	client := github.NewClient(oauthClient)
	user, _, err := client.Users.Get(ctx, "")
	if err != nil {
		return nil, nil, err
	}

	return token, user, nil
}

func (i *instance) OAuthIsAuthenticated(ctx context.Context, token *oauth2.Token) (*github.User, error) {
	oauthClient := i.oauthConfig.Client(ctx, token)
	client := github.NewClient(oauthClient)
	user, _, err := client.Users.Get(ctx, "")
	if err != nil {
		return nil, err
	}

	return user, nil
}

// New returns a new GitHub instance for the given configuration.
func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	config.Session.ParsedDuration, err = time.ParseDuration(config.Session.Duration)
	if err != nil {
		config.Session.ParsedDuration = 168 * time.Hour
	}

	return &instance{
		name:   name,
		config: config,
		oauthConfig: &oauth2.Config{
			ClientID:     config.OAuth.ClientID,
			ClientSecret: config.OAuth.ClientSecret,
			Scopes:       []string{"user", "repo", "notifications", "project"},
			Endpoint:     githuboauth.Endpoint,
		},
	}, nil
}
