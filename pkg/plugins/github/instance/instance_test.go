package instance

import (
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
	githuboauth "golang.org/x/oauth2/github"
)

func TestGetName(t *testing.T) {
	i := instance{name: "github"}
	require.Equal(t, "github", i.GetName())
}

func TestGetOrganization(t *testing.T) {
	i := instance{name: "github", config: Config{Organization: "kobsio"}}
	require.Equal(t, "kobsio", i.GetOrganization())
}

func TestTokenToCookie(t *testing.T) {
	t.Run("should return a cookie", func(t *testing.T) {
		token := &oauth2.Token{AccessToken: "accesstoken"}
		i := instance{name: "github", config: Config{Organization: "kobsio"}}
		cookie, err := i.TokenToCookie(token)
		require.NoError(t, err)
		require.Equal(t, "kobs.plugin.github.github", cookie.Name)
		require.NotEmpty(t, cookie.Value)
		require.Equal(t, "/", cookie.Path)
		require.Equal(t, true, cookie.Secure)
		require.Equal(t, true, cookie.HttpOnly)
	})

	t.Run("should return an error when jwt token could not be created", func(t *testing.T) {
		i := instance{name: "github", config: Config{Organization: "kobsio", Session: SessionConfig{ParsedDuration: -1 * time.Hour}}}
		cookie, err := i.TokenToCookie(nil)
		require.Error(t, err)
		require.Nil(t, cookie)
	})
}

func TestTokenFromCookie(t *testing.T) {
	t.Run("should return a token", func(t *testing.T) {
		token := &oauth2.Token{AccessToken: "accesstoken"}
		i := instance{name: "github", config: Config{Organization: "kobsio", Session: SessionConfig{ParsedDuration: 1 * time.Hour}}}
		cookie, err := i.TokenToCookie(token)
		require.NoError(t, err)

		tokenFromCookie, err := i.TokenFromCookie(&http.Request{Header: http.Header{"Cookie": []string{cookie.String()}}})
		require.NoError(t, err)
		require.Equal(t, token.AccessToken, tokenFromCookie.AccessToken)
	})

	t.Run("should return an error if cookie is not present in request", func(t *testing.T) {
		i := instance{name: "github", config: Config{Organization: "kobsio"}}
		token, err := i.TokenFromCookie(&http.Request{})
		require.Error(t, err)
		require.Nil(t, token)
	})
}

func TestOAuthLoginURL(t *testing.T) {
	i := instance{name: "github", config: Config{Organization: "kobsio", OAuth: OAuthConfig{State: "test"}}, oauthConfig: &oauth2.Config{ClientID: "clientID", ClientSecret: "clientSecret", Scopes: []string{"user", "repo", "notifications", "project"}, Endpoint: githuboauth.Endpoint}}
	require.Equal(t, "https://github.com/login/oauth/authorize?access_type=online&client_id=clientID&response_type=code&scope=user+repo+notifications+project&state=test", i.OAuthLoginURL())
}

func TestNew(t *testing.T) {
	t.Run("should return a new instance", func(t *testing.T) {
		i, err := New("github", map[string]any{"organization": "kobsio"})
		require.NoError(t, err)
		require.NotNil(t, i)
	})

	t.Run("should return an error", func(t *testing.T) {
		i, err := New("github", map[string]any{"organization": []string{"kobsio"}})
		require.Error(t, err)
		require.Nil(t, i)
	})
}
