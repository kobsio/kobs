package klogs

import (
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/stretchr/testify/require"
)

func TestNew(t *testing.T) {
	require.NotNil(t, New())
}

func TestType(t *testing.T) {
	require.Equal(t, "klogs", New().Type())
}

func TestMountCluster(t *testing.T) {
	t.Run("should return router", func(t *testing.T) {
		router, err := New().MountCluster([]plugin.Instance{{Name: "klogs", Options: map[string]any{"address": "localhost"}}}, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}

func TestMountHub(t *testing.T) {
	t.Run("should fail for invalid options", func(t *testing.T) {
		router, err := New().MountHub([]plugin.Instance{{Name: "klogs", Options: map[string]any{"address": []string{"localhost"}}}}, nil, nil)
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should return router", func(t *testing.T) {
		router, err := New().MountHub([]plugin.Instance{{Name: "klogs", Options: map[string]any{"address": "localhost"}}}, nil, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
