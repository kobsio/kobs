package v1beta1

import (
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	dashboard "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// Team is the Team CRD.
type Team struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec TeamSpec `json:"spec,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// TeamList is the structure for a list of Team CRs.
type TeamList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata"`

	Items []Team `json:"items"`
}

type TeamSpec struct {
	Cluster     string                `json:"cluster,omitempty"`
	Namespace   string                `json:"namespace,omitempty"`
	Name        string                `json:"name,omitempty"`
	Description string                `json:"description,omitempty"`
	Links       []Link                `json:"links,omitempty"`
	Logo        string                `json:"logo,omitempty"`
	Permissions Permissions           `json:"permissions,omitempty"`
	Dashboards  []dashboard.Reference `json:"dashboards,omitempty"`
}

type Link struct {
	Title string `json:"title"`
	Link  string `json:"link"`
}

type Reference struct {
	Cluster     string `json:"cluster,omitempty"`
	Namespace   string `json:"namespace,omitempty"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
}

type Permissions struct {
	Plugins   []string               `json:"plugins"`
	Resources []PermissionsResources `json:"resources"`
	Custom    []PermissionsCustom    `json:"custom,omitempty"`
}

type PermissionsCustom struct {
	Name        string               `json:"name"`
	Permissions apiextensionsv1.JSON `json:"permissions"`
}

type PermissionsResources struct {
	Clusters   []string `json:"clusters"`
	Namespaces []string `json:"namespaces"`
	Resources  []string `json:"resources"`
}
