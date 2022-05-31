package dashboards

import (
	"fmt"

	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"

	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
)

// addPlaceholdersAsVariables adds the placeholders from a reference to the list of variables of the dashboard
func addPlaceholdersAsVariables(variables []dashboardv1.Variable, placeholders map[string]string) []dashboardv1.Variable {
	var newVariables []dashboardv1.Variable

	for k, v := range placeholders {
		newVariables = append(newVariables, dashboardv1.Variable{
			Name:  k,
			Label: k,
			Hide:  true,
			Plugin: dashboardv1.Plugin{
				Name:    "static",
				Type:    "app",
				Options: &apiextensionsv1.JSON{Raw: []byte(fmt.Sprintf(`["%s"]`, v))},
			},
		})
	}

	newVariables = append(newVariables, variables...)

	return newVariables
}
