package variables

import (
	"fmt"

	dashboard "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"

	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
)

// GetVariables adds the cluster, namespace and placeholders from the dashboard reference to the existing list of
// variables. The added variables are of type static and hidden in the toolbar.
func GetVariables(variables []dashboard.Variable, cluster, namespace string, placeholders map[string]string) []dashboard.Variable {
	var newVariables []dashboard.Variable

	if cluster != "" {
		newVariables = append(newVariables, dashboard.Variable{
			Name:  "__cluster",
			Label: "__cluster",
			Hide:  true,
			Plugin: dashboard.Plugin{
				Name:    "core",
				Options: &apiextensionsv1.JSON{Raw: []byte(fmt.Sprintf(`{"type": "static", "items": ["%s"]}`, cluster))},
			},
		})
	}

	if namespace != "" {
		newVariables = append(newVariables, dashboard.Variable{
			Name:  "__namespace",
			Label: "__namespace",
			Hide:  true,
			Plugin: dashboard.Plugin{
				Name:    "core",
				Options: &apiextensionsv1.JSON{Raw: []byte(fmt.Sprintf(`{"type": "static", "items": ["%s"]}`, namespace))},
			},
		})
	}

	for k, v := range placeholders {
		newVariables = append(newVariables, dashboard.Variable{
			Name:  k,
			Label: k,
			Hide:  true,
			Plugin: dashboard.Plugin{
				Name:    "core",
				Options: &apiextensionsv1.JSON{Raw: []byte(fmt.Sprintf(`{"type": "static", "items": ["%s"]}`, v))},
			},
		})
	}

	newVariables = append(newVariables, variables...)

	return newVariables
}
