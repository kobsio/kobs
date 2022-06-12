package plugins

import (
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
)

// appendIfMissing appends a value to a slice, when this value doesn't already exist in the slice.
func appendIfMissing(items []string, item string) []string {
	for _, ele := range items {
		if ele == item {
			return items
		}
	}

	return append(items, item)
}

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
