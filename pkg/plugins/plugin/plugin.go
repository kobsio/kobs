package plugin

// Instance is the structure of a single plugin instance, which can be configured by a user. The `id` of the plugin must
// be constructed based on the `cluster`, `type` and `name` of the plugin.
type Instance struct {
	ID              string         `json:"id" bson:"_id"`
	Cluster         string         `json:"cluster"`
	Name            string         `json:"name"`
	Description     string         `json:"description"`
	Type            string         `json:"type"`
	Options         map[string]any `json:"options"`
	FrontendOptions map[string]any `json:"frontendOptions"`
	UpdatedAt       int64          `json:"updatedAt"`
}
