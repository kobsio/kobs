package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
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
	ID          string                  `json:"id,omitempty"`
	Satellite   string                  `json:"satellite,omitempty"`
	UpdatedAt   int64                   `json:"updatedAt,omitempty"`
	Cluster     string                  `json:"cluster,omitempty"`
	Namespace   string                  `json:"namespace,omitempty"`
	Name        string                  `json:"name,omitempty"`
	Group       string                  `json:"group,omitempty"`
	Description string                  `json:"description,omitempty"`
	Links       []Link                  `json:"links,omitempty"`
	Permissions userv1.Permissions      `json:"permissions,omitempty"`
	Dashboards  []dashboardv1.Reference `json:"dashboards,omitempty"`
}

type Link struct {
	Title string `json:"title"`
	Link  string `json:"link"`
}
