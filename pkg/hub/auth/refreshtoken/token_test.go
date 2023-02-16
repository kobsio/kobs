package refreshtoken

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestToken(t *testing.T) {
	t.Run("encode", func(t *testing.T) {
		encoded, err := Token{
			Type:   Credentials,
			Value:  "foo",
			UserID: "id",
		}.Encode()
		require.NoError(t, err)
		require.Equal(t, "eyJ0eXBlIjoiY3JlZGVudGlhbHMiLCJ2YWx1ZSI6ImZvbyIsInVzZXJJRCI6ImlkIn0=", encoded)
	})

	t.Run("decode", func(t *testing.T) {
		token, err := FromString("eyJ0eXBlIjoiY3JlZGVudGlhbHMiLCJ2YWx1ZSI6ImZvbyIsInVzZXJJRCI6ImlkIn0=")
		require.NoError(t, err)
		require.Equal(t, Token{
			Type:   Credentials,
			Value:  "foo",
			UserID: "id",
		}, token)
	})
}
