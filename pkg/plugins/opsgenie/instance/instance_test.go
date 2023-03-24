package instance

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetName(t *testing.T) {
	instance := &instance{
		name: "opsgenie",
	}

	require.Equal(t, "opsgenie", instance.GetName())
}

func TestNew(t *testing.T) {
	t.Run("should return error for invalid options", func(t *testing.T) {
		instance, err := New("opsgenie", map[string]any{"apiUrl": []string{"localhost"}})
		require.Error(t, err)
		require.Nil(t, instance)
	})

	t.Run("should return instance with default metrics", func(t *testing.T) {
		instance, err := New("opsgenie", map[string]any{"apiUrl": "localhost", "apiKey": "123"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})
}
