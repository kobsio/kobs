package instance

import (
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
