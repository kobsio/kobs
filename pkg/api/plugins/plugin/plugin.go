package plugin

// Plugin defines the structure for all plugins. All plugins must register with the configured name, display name,
// description and type. The optional options field can be used to use values from the plugin configuration in the
// frontend.
type Plugin struct {
	Satellite string                 `json:"satellite"`
	Name      string                 `json:"name"`
	Type      string                 `json:"type"`
	Options   map[string]interface{} `json:"options"`
}

// Plugins is our custom type, which holds the plugin data of all plugins.
type Plugins []Plugin

// Append is used to add a new plugin instance to our custom plugins type.
func (p *Plugins) Append(plugin Plugin) {
	*p = append(*p, plugin)
}

// AppendMultiple is used to add multiple new plugin instance to our custom plugins type.
func (p *Plugins) AppendMultiple(plugins []Plugin) {
	*p = append(*p, plugins...)
}
