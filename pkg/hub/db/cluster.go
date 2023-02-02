package db

type Cluster struct {
	ID        string `json:"id" bson:"_id"`
	Cluster   string `json:"cluster"`
	Satellite string `json:"satellite"`
	UpdatedAt int64  `json:"updatedAt"`
}

// func ParseNamespaceID(namespaceID string) (string, string, string, error) {
// 	namespaceIDParts := strings.Split(namespaceID, "/")
// 	if len(namespaceIDParts) == 7 && namespaceIDParts[0] == "" && namespaceIDParts[1] == "satellite" && namespaceIDParts[3] == "cluster" && namespaceIDParts[5] == "namespace" {
// 		return namespaceIDParts[2], namespaceIDParts[4], namespaceIDParts[6], nil
// 	}

// 	if len(namespaceIDParts) == 5 && namespaceIDParts[0] == "" && namespaceIDParts[1] == "satellite" && namespaceIDParts[3] == "cluster" {
// 		return namespaceIDParts[2], namespaceIDParts[4], "", nil
// 	}

// 	return "", "", "", fmt.Errorf("invalid namespace id")
// }
