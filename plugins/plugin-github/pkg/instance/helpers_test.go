package instance

import (
	"testing"

	"golang.org/x/oauth2"

	"github.com/stretchr/testify/require"
)

func TestTokenToBase64(t *testing.T) {
	t.Run("token to base64 without error", func(t *testing.T) {
		tokenStr, err := tokenToBase64(&oauth2.Token{AccessToken: "1234"})
		require.NoError(t, err)
		require.Equal(t, "eyJhY2Nlc3NfdG9rZW4iOiIxMjM0IiwiZXhwaXJ5IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ==", tokenStr)
	})
}

func TestTokenFromBase64(t *testing.T) {
	t.Run("token from base64 without error", func(t *testing.T) {
		token, err := tokenFromBase64("eyJhY2Nlc3NfdG9rZW4iOiIxMjM0IiwiZXhwaXJ5IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ==")
		require.NoError(t, err)
		require.Equal(t, &oauth2.Token{AccessToken: "1234"}, token)
	})

	t.Run("token from base64 without error (not a base64 string)", func(t *testing.T) {
		token, err := tokenFromBase64("eyJhY2Nlc3NfdG9rZW4iOiIxMjM0IiwiZXhwaXJ5IjoiMDAwMS0wMS0wMVQwMDowMDowMFoifQ")
		require.Error(t, err)
		require.Nil(t, token)
	})

	t.Run("token from base64 without error (invalid json)", func(t *testing.T) {
		token, err := tokenFromBase64("eyJhY2Nlc3NfdG9rZW4iOlsiMTIzNCJdfQ==")
		require.Error(t, err)
		require.Nil(t, token)
	})
}
