package plugins

import (
	"github.com/kobsio/kobs/pkg/plugins/plugin"
)

// filterInstances only returns the plugin instances, which have the specified type.
func filterInstances(pluginType string, instances []plugin.Instance) []plugin.Instance {
	var filteredInstances []plugin.Instance

	for _, instance := range instances {
		if instance.Type == pluginType {
			filteredInstances = append(filteredInstances, instance)
		}
	}

	return filteredInstances
}
