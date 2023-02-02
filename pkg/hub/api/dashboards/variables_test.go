package dashboards

import (
	"testing"

	dashboardv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/dashboard/v1"
	"github.com/stretchr/testify/require"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
)

func TestAddPlaceholdersAsVariables(t *testing.T) {
	t.Run("variables are nil", func(t *testing.T) {
		require.Equal(t, []dashboardv1.Variable{
			{
				Name:  "placeholder1",
				Label: "placeholder1",
				Hide:  true,
				Plugin: dashboardv1.Plugin{
					Name:    "placeholder",
					Type:    "app",
					Options: &apiextensionsv1.JSON{Raw: []byte(`{"type":"string","value":"value1"}`)},
				},
			},
		}, addPlaceholdersAsVariables([]dashboardv1.Placeholder{
			{
				Name: "placeholder1",
			},
		}, nil, map[string]string{"placeholder1": "value1"}))
	})

	t.Run("placeholders are nil", func(t *testing.T) {
		require.Equal(t, []dashboardv1.Variable{
			{
				Name:  "variable1",
				Label: "Variable 1",
				Hide:  true,
				Plugin: dashboardv1.Plugin{
					Name:    "static",
					Type:    "app",
					Options: &apiextensionsv1.JSON{Raw: []byte(`["value1"]`)},
				},
			},
		}, addPlaceholdersAsVariables(nil, []dashboardv1.Variable{
			{
				Name:  "variable1",
				Label: "Variable 1",
				Hide:  true,
				Plugin: dashboardv1.Plugin{
					Name:    "static",
					Type:    "app",
					Options: &apiextensionsv1.JSON{Raw: []byte(`["value1"]`)},
				},
			},
		}, nil))
	})

	t.Run("variables and placeholders are not nil", func(t *testing.T) {
		require.Equal(t, []dashboardv1.Variable{
			{
				Name:  "placeholder1",
				Label: "placeholder1",
				Hide:  true,
				Plugin: dashboardv1.Plugin{
					Name:    "placeholder",
					Type:    "app",
					Options: &apiextensionsv1.JSON{Raw: []byte(`{"type":"string","value":"value1"}`)},
				},
			},
			{
				Name:  "variable1",
				Label: "Variable 1",
				Hide:  true,
				Plugin: dashboardv1.Plugin{
					Name:    "static",
					Type:    "app",
					Options: &apiextensionsv1.JSON{Raw: []byte(`["value1"]`)},
				},
			},
		}, addPlaceholdersAsVariables([]dashboardv1.Placeholder{
			{
				Name: "placeholder1",
			},
		}, []dashboardv1.Variable{
			{
				Name:  "variable1",
				Label: "Variable 1",
				Hide:  true,
				Plugin: dashboardv1.Plugin{
					Name:    "static",
					Type:    "app",
					Options: &apiextensionsv1.JSON{Raw: []byte(`["value1"]`)},
				},
			},
		}, map[string]string{"placeholder1": "value1"}))
	})

	t.Run("placeholder values are nil", func(t *testing.T) {
		require.Equal(t, []dashboardv1.Variable{
			{
				Name:  "placeholder1",
				Label: "placeholder1",
				Hide:  true,
				Plugin: dashboardv1.Plugin{
					Name:    "placeholder",
					Type:    "app",
					Options: &apiextensionsv1.JSON{Raw: []byte(`{"type":"string","value":"default1"}`)},
				},
			},
		}, addPlaceholdersAsVariables([]dashboardv1.Placeholder{
			{
				Name:    "placeholder1",
				Default: "default1",
			},
		}, nil, nil))
	})
}
