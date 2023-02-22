package db

type Namespace struct {
	ID        string `json:"id" bson:"_id"`
	Namespace string `json:"namespace" bson:"namespace"`
	Cluster   string `json:"cluster" bson:"cluster"`
	UpdatedAt int64  `json:"updatedAt" bson:"updatedAt"`
}

type Tag struct {
	ID        string `json:"id" bson:"_id"`
	Tag       string `json:"tag" bson:"tag"`
	UpdatedAt int64  `json:"updatedAt" bson:"updatedAt"`
}

type Topology struct {
	ID                  string `json:"id" bson:"_id"`
	SourceID            string `json:"sourceID" bson:"sourceID"`
	SourceCluster       string `json:"sourceCluster" bson:"sourceCluster"`
	SourceNamespace     string `json:"SourceNamespace" bson:"SourceNamespace"`
	SourceName          string `json:"SourceName" bson:"SourceName"`
	TargetID            string `json:"targetID" bson:"targetID"`
	TargetCluster       string `json:"targetCluster" bson:"targetCluster"`
	TargetNamespace     string `json:"targetNamespace" bson:"targetNamespace"`
	TargetName          string `json:"targetName" bson:"targetName"`
	TopologyExternal    bool   `json:"topologyExternal" bson:"topologyExternal"`
	TopologyDescription string `json:"topologyDescription" bson:"topologyDescription"`
	UpdatedAt           int64  `json:"updatedAt" bson:"updatedAt"`
}
