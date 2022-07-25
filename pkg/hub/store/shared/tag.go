package shared

type Tag struct {
	ID        string `json:"id" bson:"_id"`
	Tag       string `json:"tag"`
	UpdatedAt int64  `json:"updatedAt"`
}
