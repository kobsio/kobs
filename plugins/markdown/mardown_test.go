package markdown

import (
	"testing"

	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/stretchr/testify/require"
)

func TestRegister(t *testing.T) {
	plugins := &plugin.Plugins{}
	router := Register(plugins, Config{})

	require.NotEmpty(t, router)
	require.Equal(t, &plugin.Plugins{
		plugin.Plugin{
			Name:        "markdown",
			DisplayName: "Markdown",
			Description: "Render static text using Markdown.",
			Type:        "markdown",
		},
	}, plugins)
}
