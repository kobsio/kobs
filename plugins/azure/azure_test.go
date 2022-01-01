package azure

import (
	"testing"

	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance"

	"github.com/stretchr/testify/require"
)

var testConfig = Config{
	{
		Name:        "azure",
		DisplayName: "Azure",
		Description: "The innovate-anywhere, create-anything cloud.",
		Credentials: instance.Credentials{
			SubscriptionID: "subscriptionID",
			TenantID:       "tenantID",
			ClientID:       "clientID",
			ClientSecret:   "clientSecret",
		},
	},
}

func TestRegister(t *testing.T) {
	plugins := &plugin.Plugins{}
	router := Register(plugins, testConfig)

	require.NotEmpty(t, router)
	require.Equal(t, &plugin.Plugins{
		plugin.Plugin{
			Name:        testConfig[0].Name,
			DisplayName: testConfig[0].DisplayName,
			Description: testConfig[0].Description,
			Type:        "azure",
		},
	}, plugins)
}
