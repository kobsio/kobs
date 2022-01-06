package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	dashboardv1 "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1"
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
	Cluster     string                  `json:"cluster,omitempty"`
	Namespace   string                  `json:"namespace,omitempty"`
	Name        string                  `json:"name,omitempty"`
	Description string                  `json:"description,omitempty"`
	Tags        []string                `json:"tags,omitempty"`
	Links       []Link                  `json:"links,omitempty"`
	Teams       []TeamReference         `json:"teams,omitempty"`
	Topology    Topology                `json:"topology,omitempty"`
	Preview     *Preview                `json:"preview,omitempty"`
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
	Cluster     string                  `json:"cluster,omitempty"`
	Namespace   string                  `json:"namespace,omitempty"`
	Name        string                  `json:"name"`
	Description string                  `json:"description,omitempty"`
	Dashboards  []dashboardv1.Reference `json:"dashboards,omitempty"`
}

type TeamReference struct {
	Cluster     string `json:"cluster,omitempty"`
	Namespace   string `json:"namespace,omitempty"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
}

type Preview struct {
	Title  string             `json:"title"`
	Plugin dashboardv1.Plugin `json:"plugin"`
}
