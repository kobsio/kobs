package instance

import (
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestGetName(t *testing.T) {
	i := instance{name: "jira"}
	require.Equal(t, "jira", i.GetName())
}

func TestGetURL(t *testing.T) {
	i := instance{name: "jira", config: Config{URL: "jira.com"}}
	require.Equal(t, "jira.com", i.GetURL())
}

func TestTokenToCookie(t *testing.T) {
	t.Run("should return a cookie", func(t *testing.T) {
		token := &Token{Email: "admin@kobs.io", Token: "token"}
		i := instance{name: "jira", config: Config{URL: "jira.com"}}
		cookie, err := i.TokenToCookie(token)
		require.NoError(t, err)
		require.Equal(t, "kobs.plugin.jira.jira", cookie.Name)
		require.NotEmpty(t, cookie.Value)
		require.Equal(t, "/", cookie.Path)
		require.Equal(t, true, cookie.Secure)
		require.Equal(t, true, cookie.HttpOnly)
	})

	t.Run("should return an error when jwt token could not be created", func(t *testing.T) {
		i := instance{name: "jira", config: Config{URL: "jira.com", Session: SessionConfig{ParsedDuration: -1 * time.Hour}}}
		cookie, err := i.TokenToCookie(nil)
		require.Error(t, err)
		require.Nil(t, cookie)
	})
}

func TestTokenFromCookie(t *testing.T) {
	t.Run("should return a token", func(t *testing.T) {
		token := &Token{Email: "admin@kobs.io", Token: "token"}
		i := instance{name: "jira", config: Config{URL: "jira.com", Session: SessionConfig{ParsedDuration: 1 * time.Hour}}}
		cookie, err := i.TokenToCookie(token)
		require.NoError(t, err)

		tokenFromCookie, err := i.TokenFromCookie(&http.Request{Header: http.Header{"Cookie": []string{cookie.String()}}})
		require.NoError(t, err)
		require.Equal(t, token.Token, tokenFromCookie.Token)
	})

	t.Run("should return an error if cookie is not present in request", func(t *testing.T) {
		i := instance{name: "jira", config: Config{URL: "jira.com"}}
		token, err := i.TokenFromCookie(&http.Request{})
		require.Error(t, err)
		require.Nil(t, token)
	})
}

func TestNew(t *testing.T) {
	t.Run("should return a new instance", func(t *testing.T) {
		i, err := New("jira", map[string]any{"url": "jira.com"})
		require.NoError(t, err)
		require.NotNil(t, i)
	})

	t.Run("should return an error", func(t *testing.T) {
		i, err := New("jira", map[string]any{"url": []string{"jira.com"}})
		require.Error(t, err)
		require.Nil(t, i)
	})
}
