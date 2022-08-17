package instance

import (
	"context"
	"net/http"
	"testing"

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
	i := instance{name: "github", config: Config{Organization: "kobsio"}}

	t.Run("no error", func(t *testing.T) {
		cookie, err := i.TokenToCookie(&oauth2.Token{AccessToken: "1234"})
		require.NoError(t, err)
		require.Equal(t, &http.Cookie{Name: "kobs-plugin-github-kobsio", Value: "eyJhY2Nlc3NfdG9rZW4iOiIxMjM0IiwiZXhwaXJ5IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ==", Path: "/", Secure: true, HttpOnly: true}, cookie)
	})
}

func TestTokenFromCookie(t *testing.T) {
	i := instance{name: "github", config: Config{Organization: "kobsio"}}

	t.Run("no error", func(t *testing.T) {
		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "", nil)
		r.AddCookie(&http.Cookie{Name: "kobs-plugin-github-kobsio", Value: "eyJhY2Nlc3NfdG9rZW4iOiIxMjM0IiwiZXhwaXJ5IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ==", Path: "/", Secure: true, HttpOnly: true})

		token, err := i.TokenFromCookie(r)
		require.NoError(t, err)
		require.Equal(t, &oauth2.Token{AccessToken: "1234"}, token)
	})

	t.Run("with error invalid cookie value", func(t *testing.T) {
		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "", nil)
		r.AddCookie(&http.Cookie{Name: "kobs-plugin-github-kobsio", Value: "eyJhY2Nlc3NfdG9rZW4iOiIxMjM0IiwiZXhwaXJ5IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ", Path: "/", Secure: true, HttpOnly: true})

		token, err := i.TokenFromCookie(r)
		require.Error(t, err)
		require.Nil(t, token)
	})

	t.Run("with error invalid cookie name", func(t *testing.T) {
		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "", nil)
		r.AddCookie(&http.Cookie{Name: "kobs-plugin-github", Value: "eyJhY2Nlc3NfdG9rZW4iOiIxMjM0IiwiZXhwaXJ5IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ==", Path: "/", Secure: true, HttpOnly: true})

		token, err := i.TokenFromCookie(r)
		require.Error(t, err)
		require.Nil(t, token)
	})
}

func TestOAuthLoginURL(t *testing.T) {
	i := instance{name: "github", config: Config{Organization: "kobsio", OAuth: OAuthConfig{State: "test"}}, oauthConfig: &oauth2.Config{ClientID: "clientID", ClientSecret: "clientSecret", Scopes: []string{"user", "repo", "notifications", "project"}, Endpoint: githuboauth.Endpoint}}
	require.Equal(t, "https://github.com/login/oauth/authorize?access_type=online&client_id=clientID&response_type=code&scope=user+repo+notifications+project&state=test", i.OAuthLoginURL())
}

func TestNew(t *testing.T) {
	t.Run("no error", func(t *testing.T) {
		i, err := New("github", map[string]any{"organization": "kobsio"})
		require.NoError(t, err)
		require.NotNil(t, i)
	})

	t.Run("with error", func(t *testing.T) {
		i, err := New("github", map[string]any{"organization": []string{"kobsio"}})
		require.Error(t, err)
		require.Nil(t, i)
	})
}
