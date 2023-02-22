package v1

import (
	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
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
	ID          string                  `json:"id,omitempty" bson:"_id"`
	UpdatedAt   int64                   `json:"updatedAt,omitempty" bson:"updatedAt"`
	Cluster     string                  `json:"cluster,omitempty" bson:"cluster"`
	Namespace   string                  `json:"namespace,omitempty" bson:"namespace"`
	Name        string                  `json:"name,omitempty" bson:"name"`
	Description string                  `json:"description,omitempty" bson:"description"`
	Tags        []string                `json:"tags,omitempty" bson:"tags"`
	Links       []Link                  `json:"links,omitempty" bson:"links"`
	Teams       []string                `json:"teams,omitempty" bson:"teams"`
	Topology    Topology                `json:"topology,omitempty" bson:"topology"`
	Insights    []Insight               `json:"insights,omitempty" bson:"insights"`
	Dashboards  []dashboardv1.Reference `json:"dashboards,omitempty" bson:"dashboards"`
}

type Link struct {
	Title string `json:"title" bson:"title"`
	Link  string `json:"link" bson:"link"`
}

type Topology struct {
	External     bool         `json:"external,omitempty" bson:"external"`
	Dependencies []Dependency `json:"dependencies,omitempty" bson:"dependencies"`
}

type Dependency struct {
	Cluster     string `json:"cluster,omitempty" bson:"cluster"`
	Namespace   string `json:"namespace,omitempty" bson:"namespace"`
	Name        string `json:"name" bson:"name"`
	Description string `json:"description,omitempty" bson:"description"`
}

type Insight struct {
	Title    string             `json:"title" bson:"title"`
	Type     string             `json:"type" bson:"type"`
	Unit     string             `json:"unit,omitempty" bson:"unit"`
	Mappings map[string]string  `json:"mappings,omitempty" bson:"mappings"`
	Plugin   dashboardv1.Plugin `json:"plugin" bson:"plugin"`
}
