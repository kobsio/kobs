package instance

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestTokenToBase64(t *testing.T) {
	t.Run("token to base64 without error", func(t *testing.T) {
		tokenStr, err := tokenToBase64(&Token{Email: "test", Token: "test"})
		require.NoError(t, err)
		require.Equal(t, "eyJlbWFpbCI6InRlc3QiLCJ0b2tlbiI6InRlc3QifQ==", tokenStr)
	})
}

func TestTokenFromBase64(t *testing.T) {
	t.Run("token from base64 without error", func(t *testing.T) {
		token, err := tokenFromBase64("eyJlbWFpbCI6InRlc3QiLCJ0b2tlbiI6InRlc3QifQ==")
		require.NoError(t, err)
		require.Equal(t, &Token{Email: "test", Token: "test"}, token)
	})

	t.Run("token from base64 without error (not a base64 string)", func(t *testing.T) {
		token, err := tokenFromBase64("eyJlbWFpbCI6InRlc3QiLCJ0b2tlbiI6InRlc3QifQ")
		require.Error(t, err)
		require.Nil(t, token)
	})

	t.Run("token from base64 without error (invalid json)", func(t *testing.T) {
		token, err := tokenFromBase64("WyJ0ZXN0Il0K")
		require.Error(t, err)
		require.Nil(t, token)
	})
}
