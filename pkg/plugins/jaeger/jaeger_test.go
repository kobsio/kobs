package jaeger

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNew(t *testing.T) {
	require.NotNil(t, New())
}

func TestType(t *testing.T) {
	require.Equal(t, "jaeger", New().Type())
}

func TestMountCluster(t *testing.T) {
	t.Run("should return router", func(t *testing.T) {
		router, err := New().MountCluster(nil, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}

func TestMountHub(t *testing.T) {
	t.Run("should return router", func(t *testing.T) {
		router, err := New().MountHub(nil, nil, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
