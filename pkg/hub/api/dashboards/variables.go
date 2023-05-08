package dashboards

import (
	"encoding/json"

	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"

	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
)

// addPlaceholdersAsVariables adds the placeholders from a reference to the list of variables of the dashboard
func addPlaceholdersAsVariables(placeholders []dashboardv1.Placeholder, variables []dashboardv1.Variable, placeholderValues map[string]string) []dashboardv1.Variable {
	var newVariables []dashboardv1.Variable

	for _, placeholder := range placeholders {
		placeholderValue := placeholder.Default
		if val, ok := placeholderValues[placeholder.Name]; ok {
			placeholderValue = val
		}

		placeholderType := placeholder.Type
		if placeholderType == "" {
			placeholderType = "string"
		}

		options, err := json.Marshal(struct {
			Type  string `json:"type"`
			Value string `json:"value"`
		}{
			placeholderType,
			placeholderValue,
		})

		if err == nil {
			newVariables = append(newVariables, dashboardv1.Variable{
				Name:  placeholder.Name,
				Label: placeholder.Name,
				Hide:  true,
				Plugin: dashboardv1.Plugin{
					Name:    "placeholder",
					Type:    "core",
					Options: &apiextensionsv1.JSON{Raw: options},
				},
			})
		}
	}

	newVariables = append(newVariables, variables...)

	return newVariables
}
