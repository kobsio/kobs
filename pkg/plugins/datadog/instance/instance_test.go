package instance

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetName(t *testing.T) {
	instance := &instance{
		name: "datadog",
	}

	require.Equal(t, "datadog", instance.GetName())
}

func TestNew(t *testing.T) {
	t.Run("should return error for invalid options", func(t *testing.T) {
		instance, err := New("datadog", map[string]any{"address": []string{"localhost"}})
		require.Error(t, err)
		require.Nil(t, instance)
	})

	t.Run("should return instance", func(t *testing.T) {
		instance, err := New("datadog", map[string]any{"address": "localhost"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})
}
