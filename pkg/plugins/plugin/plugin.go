package plugin

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
