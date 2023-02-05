package db

type Cluster struct {
	ID        string `json:"id" bson:"_id"`
	Cluster   string `json:"cluster"`
	Satellite string `json:"satellite"`
	UpdatedAt int64  `json:"updatedAt"`
}
