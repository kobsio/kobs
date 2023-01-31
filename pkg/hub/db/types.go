package db

type Namespace struct {
	ID        string `json:"id" bson:"_id"`
	Namespace string `json:"namespace"`
	Cluster   string `json:"cluster"`
	UpdatedAt int64  `json:"updatedAt"`
}

type Tag struct {
	ID        string `json:"id" bson:"_id"`
	Tag       string `json:"tag"`
	UpdatedAt int64  `json:"updatedAt"`
}

type Topology struct {
	ID                  string `json:"id" bson:"_id"`
	SourceID            string `json:"sourceID"`
	SourceCluster       string `json:"sourceCluster"`
	SourceNamespace     string `json:"SourceNamespace"`
	SourceName          string `json:"SourceName"`
	TargetID            string `json:"targetID"`
	TargetCluster       string `json:"targetCluster"`
	TargetNamespace     string `json:"targetNamespace"`
	TargetName          string `json:"targetName"`
	TopologyExternal    bool   `json:"topologyExternal"`
	TopologyDescription string `json:"topologyDescription"`
	UpdatedAt           int64  `json:"updatedAt"`
}
