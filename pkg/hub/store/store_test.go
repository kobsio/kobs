package store

import (
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNewClient(t *testing.T) {
	t.Run("store created", func(t *testing.T) {
		client, err := NewClient("bolt", "/tmp/kobs-store-test.db")
		defer os.Remove("/tmp/kobs-store-test.db")
		require.NoError(t, err)
		require.NotEmpty(t, client)
	})

	t.Run("store creation failed, invalid driver", func(t *testing.T) {
		client, err := NewClient("sqlite", "")
		require.Error(t, err)
		require.Empty(t, client)
	})
}
