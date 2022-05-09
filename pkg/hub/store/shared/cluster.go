package shared

type Cluster struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Satellite string `json:"satellite"`
	UpdatedAt int64  `json:"updatedAt"`
}

type Namespace struct {
	ID        string `json:"id"`
	Namespace string `json:"namespace"`
	Cluster   string `json:"cluster"`
	Satellite string `json:"satellite"`
	UpdatedAt int64  `json:"updatedAt"`
}
