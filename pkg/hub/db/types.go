package db

import (
	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
)

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

type ApplicationGroup struct {
	ID          ApplicationGroupID     `json:"id" bson:"_id"`
	Clusters    []string               `json:"clusters,omitempty" bson:"clusters"`
	Namespaces  []string               `json:"namespaces,omitempty" bson:"namespaces"`
	Names       []string               `json:"names,omitempty" bson:"names"`
	Description string                 `json:"description" bson:"description"`
	Tags        []string               `json:"tags,omitempty" bson:"tags"`
	Teams       []string               `json:"teams,omitempty" bson:"teams"`
	Topology    applicationv1.Topology `json:"topology,omitempty" bson:"topology"`
}

type ApplicationGroupID struct {
	Cluster   string `json:"cluster,omitempty" bson:"cluster"`
	Namespace string `json:"namespace,omitempty" bson:"namespace"`
	Name      string `json:"name,omitempty" bson:"name"`
}
