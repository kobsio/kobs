package plugin

// Instance is the structure of the configuration for a single plugin instance. Each plugin must contain a name and a
// type and an optionsl description. It can also contains a map with additional options. The options can be used to
// specify the addess, username, password, etc. to access an service within the plugin.
type Instance struct {
	ID              string                 `json:"id"`
	Satellite       string                 `json:"satellite"`
	Name            string                 `json:"name"`
	Description     string                 `json:"description"`
	Type            string                 `json:"type"`
	Options         map[string]interface{} `json:"options"`
	FrontendOptions map[string]interface{} `json:"frontendOptions"`
	UpdatedAt       int64                  `json:"updatedAt"`
}
