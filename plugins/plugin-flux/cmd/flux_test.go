package flux

import (
	"testing"

	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/stretchr/testify/require"
)

func TestMount(t *testing.T) {
	router1, err := Mount([]plugin.Instance{{Name: "flux"}}, nil)
	require.NoError(t, err)
	require.NotNil(t, router1)

	router2, err := Mount([]plugin.Instance{{Name: "flux1"}, {Name: "flux2"}}, nil)
	require.Error(t, err)
	require.Nil(t, router2)
}
