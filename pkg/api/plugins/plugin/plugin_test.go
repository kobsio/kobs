package plugin

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAppend(t *testing.T) {
	var plugins Plugins
	plugins.Append(Plugin{Name: "Plugin1"})
	require.Equal(t, Plugins{{Name: "Plugin1"}}, plugins)
}
