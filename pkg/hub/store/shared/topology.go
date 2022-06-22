package shared

// Topology is the structure of the saved topology data in our store.
type Topology struct {
	ID                  string `json:"id"`
	SourceID            string `json:"sourceID"`
	SourceSatellite     string `json:"sourceSatellite"`
	SourceCluster       string `json:"sourceCluster"`
	SourceNamespace     string `json:"SourceNamespace"`
	SourceName          string `json:"SourceName"`
	TargetID            string `json:"targetID"`
	TargetSatellite     string `json:"targetSatellite"`
	TargetCluster       string `json:"targetCluster"`
	TargetNamespace     string `json:"targetNamespace"`
	TargetName          string `json:"targetName"`
	TopologyExternal    bool   `json:"topologyExternal"`
	TopologyDescription string `json:"topologyDescription"`
	UpdatedAt           int64  `json:"updatedAt"`
}
