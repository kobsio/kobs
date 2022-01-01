package instance

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNew(t *testing.T) {
	t.Run("credentials error", func(t *testing.T) {
		actualInstance, actualErr := New(Config{})
		require.Error(t, actualErr)
		require.Empty(t, actualInstance)
	})

	t.Run("get instance", func(t *testing.T) {
		actualInstance, actualErr := New(Config{Credentials: Credentials{SubscriptionID: "asdf", TenantID: "asdf", ClientID: "asdf", ClientSecret: "asdf"}})
		require.NoError(t, actualErr)
		require.NotEmpty(t, actualInstance)
	})
}
