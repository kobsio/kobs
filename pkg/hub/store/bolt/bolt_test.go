package bolt

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/stretchr/testify/require"
)

func TestNewClient(t *testing.T) {
	c1, err1 := NewClient("")
	require.Error(t, err1)
	require.Empty(t, c1)

	c2, err2 := NewClient("/tmp/kobs.db")
	defer os.Remove("/tmp/kobs.db")

	require.NoError(t, err2)
	require.NotEmpty(t, c2)
}

func TestSavePlugin(t *testing.T) {
	plugins := []plugin.Instance{{
		Name: "dev-de1",
		Type: "prometheus",
	}, {
		Name: "dev-de1",
		Type: "klogs",
	}}

	c, _ := NewClient("/tmp/kobs.db")
	defer os.Remove("/tmp/kobs.db")

	err := c.SavePlugins("test-satellite", plugins)
	require.NoError(t, err)

	storedPlugins1, err := c.GetPlugins(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedPlugins1))

	time.Sleep(2 * time.Second)

	err = c.SavePlugins("test-satellite", plugins[0:1])
	require.NoError(t, err)

	storedPlugins2, err := c.GetPlugins(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedPlugins2))
}
