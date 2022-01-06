package variables

import (
	"fmt"

	dashboardv1 "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1"

	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
)

// GetVariables adds the cluster, namespace and placeholders from the dashboard reference to the existing list of
// variables. The added variables are of type static and hidden in the toolbar.
func GetVariables(variables []dashboardv1.Variable, cluster, namespace string, placeholders map[string]string) []dashboardv1.Variable {
	var newVariables []dashboardv1.Variable

	if cluster != "" {
		newVariables = append(newVariables, dashboardv1.Variable{
			Name:  "__cluster",
			Label: "__cluster",
			Hide:  true,
			Plugin: dashboardv1.Plugin{
				Name:    "core",
				Options: &apiextensionsv1.JSON{Raw: []byte(fmt.Sprintf(`{"type": "static", "items": ["%s"]}`, cluster))},
			},
		})
	}

	if namespace != "" {
		newVariables = append(newVariables, dashboardv1.Variable{
			Name:  "__namespace",
			Label: "__namespace",
			Hide:  true,
			Plugin: dashboardv1.Plugin{
				Name:    "core",
				Options: &apiextensionsv1.JSON{Raw: []byte(fmt.Sprintf(`{"type": "static", "items": ["%s"]}`, namespace))},
			},
		})
	}

	for k, v := range placeholders {
		newVariables = append(newVariables, dashboardv1.Variable{
			Name:  k,
			Label: k,
			Hide:  true,
			Plugin: dashboardv1.Plugin{
				Name:    "core",
				Options: &apiextensionsv1.JSON{Raw: []byte(fmt.Sprintf(`{"type": "static", "items": ["%s"]}`, v))},
			},
		})
	}

	newVariables = append(newVariables, variables...)

	return newVariables
}
