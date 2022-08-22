package instance

import (
	"context"
	"net/http"

	"github.com/kobsio/kobs/pkg/middleware/roundtripper"

	"github.com/andygrunwald/go-jira"
	"github.com/mitchellh/mapstructure"
)

// Config is the structure of the configuration for a single GitHub instance.
type Config struct {
	URL string `json:"url"`
}

type Instance interface {
	GetName() string
	GetURL() string
	TokenToCookie(token *Token) (*http.Cookie, error)
	TokenFromCookie(r *http.Request) (*Token, error)
	GetSelf(ctx context.Context, token *Token) (*jira.User, error)
	GetProjects(ctx context.Context, token *Token) (*jira.ProjectList, error)
	GetIssues(ctx context.Context, token *Token, jql string, startAt, maxResults int) ([]jira.Issue, int, error)
}

type instance struct {
	name   string
	config Config
	client *http.Client
}

func (i *instance) getAuthenticatedClient(token *Token) (*jira.Client, error) {
	client, err := jira.NewClient(i.client, i.config.URL)
	if err != nil {
		return nil, err
	}

	client.Authentication.SetBasicAuth(token.Email, token.Token)

	return client, nil
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) GetURL() string {
	return i.config.URL
}

// TokenToCookie returns a cookie for the given oauth token.
func (i *instance) TokenToCookie(token *Token) (*http.Cookie, error) {
	cookieValue, err := tokenToBase64(token)
	if err != nil {
		return nil, err
	}

	return &http.Cookie{
		Name:     "kobs-plugin-jira-" + i.name,
		Value:    cookieValue,
		Secure:   true,
		HttpOnly: true,
		Path:     "/",
	}, nil
}

// TokenFromCookie returns the token from the "kobs-oauth-github" cookie in the given request.
func (i *instance) TokenFromCookie(r *http.Request) (*Token, error) {
	cookie, err := r.Cookie("kobs-plugin-jira-" + i.name)
	if err != nil {
		return nil, err
	}

	return tokenFromBase64(cookie.Value)
}

func (i *instance) GetSelf(ctx context.Context, token *Token) (*jira.User, error) {
	client, err := i.getAuthenticatedClient(token)
	if err != nil {
		return nil, err
	}

	user, _, err := client.User.GetSelfWithContext(ctx)
	return user, err
}

func (i *instance) GetProjects(ctx context.Context, token *Token) (*jira.ProjectList, error) {
	client, err := i.getAuthenticatedClient(token)
	if err != nil {
		return nil, err
	}

	projects, _, err := client.Project.GetListWithContext(ctx)
	return projects, err
}

func (i *instance) GetIssues(ctx context.Context, token *Token, jql string, startAt, maxResults int) ([]jira.Issue, int, error) {
	client, err := i.getAuthenticatedClient(token)
	if err != nil {
		return nil, 0, err
	}

	issues, response, err := client.Issue.SearchWithContext(ctx, jql, &jira.SearchOptions{StartAt: startAt, MaxResults: maxResults})
	return issues, response.Total, err
}

// New returns a new GitHub instance for the given configuration.
func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	return &instance{
		name:   name,
		config: config,
		client: &http.Client{
			Transport: roundtripper.DefaultRoundTripper,
		},
	}, nil
}
