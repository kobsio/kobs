package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// Application is the Application CRD.
type Application struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec ApplicationSpec `json:"spec,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ApplicationList is the structure for a list of Application CRs.
type ApplicationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata"`

	Items []Application `json:"items"`
}

type ApplicationSpec struct {
	ID          string                  `json:"id,omitempty" boltholdUnique:"UniqueID"`
	Satellite   string                  `json:"satellite,omitempty"`
	UpdatedAt   int64                   `json:"updatedAt,omitempty"`
	Cluster     string                  `json:"cluster,omitempty"`
	Namespace   string                  `json:"namespace,omitempty"`
	Name        string                  `json:"name,omitempty"`
	ClusterID   string                  `json:"clusterID,omitempty"`
	NamespaceID string                  `json:"namespaceID,omitempty"`
	Description string                  `json:"description,omitempty"`
	Tags        []string                `json:"tags,omitempty"`
	Links       []Link                  `json:"links,omitempty"`
	Teams       []string                `json:"teams,omitempty"`
	Topology    Topology                `json:"topology,omitempty"`
	Insights    []Insight               `json:"insights,omitempty"`
	Dashboards  []dashboardv1.Reference `json:"dashboards,omitempty"`
}

type Link struct {
	Title string `json:"title"`
	Link  string `json:"link"`
}

type Topology struct {
	Type         string       `json:"type,omitempty"`
	External     bool         `json:"external,omitempty"`
	Dependencies []Dependency `json:"dependencies,omitempty"`
}

type Dependency struct {
	Satellite   string `json:"satellite,omitempty"`
	Cluster     string `json:"cluster,omitempty"`
	Namespace   string `json:"namespace,omitempty"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
}

type Insight struct {
	Title    string             `json:"title"`
	Type     string             `json:"type"`
	Unit     string             `json:"unit,omitempty"`
	Mappings map[string]string  `json:"mappings,omitempty"`
	Plugin   dashboardv1.Plugin `json:"plugin"`
}
