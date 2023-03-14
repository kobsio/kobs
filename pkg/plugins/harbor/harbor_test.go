package harbor

import (
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/stretchr/testify/require"
)

func TestNew(t *testing.T) {
	require.NotNil(t, New())
}

func TestType(t *testing.T) {
	p := New()
	require.Equal(t, "harbor", p.Type())
}

func TestMountCluster(t *testing.T) {
	p := New()

	t.Run("should return router", func(t *testing.T) {
		router, err := p.MountCluster(nil, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}

func TestMountHub(t *testing.T) {
	p := New()

	t.Run("should return router", func(t *testing.T) {
		router, err := p.MountHub([]plugin.Instance{{Options: map[string]any{"address": "localhost"}}}, nil, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})

	t.Run("should return error for invalid instances", func(t *testing.T) {
		router, err := p.MountHub([]plugin.Instance{{Options: map[string]any{"address": []string{"localhost"}}}}, nil, nil)
		require.Error(t, err)
		require.Nil(t, router)
	})
}
