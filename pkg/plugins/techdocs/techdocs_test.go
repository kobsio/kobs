package techdocs

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNew(t *testing.T) {
	require.NotNil(t, New())
}

func TestType(t *testing.T) {
	p := New()
	require.Equal(t, "techdocs", p.Type())
}

func TestMountCluster(t *testing.T) {
	p := New()

	t.Run("should return nil", func(t *testing.T) {
		router, err := p.MountCluster(nil, nil)
		require.NoError(t, err)
		require.Nil(t, router)
	})
}

func TestMountHub(t *testing.T) {
	p := New()

	t.Run("should return router", func(t *testing.T) {
		router, err := p.MountHub(nil, nil, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
