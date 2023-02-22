package v1

import (
	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
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
	ID          string                  `json:"id,omitempty" bson:"_id"`
	UpdatedAt   int64                   `json:"updatedAt,omitempty" bson:"updatedAt"`
	Cluster     string                  `json:"cluster,omitempty" bson:"cluster"`
	Namespace   string                  `json:"namespace,omitempty" bson:"namespace"`
	Name        string                  `json:"name,omitempty" bson:"name"`
	Description string                  `json:"description,omitempty" bson:"description"`
	Links       []Link                  `json:"links,omitempty" bson:"links"`
	Logo        string                  `json:"logo,omitempty" bson:"logo"`
	Permissions userv1.Permissions      `json:"permissions,omitempty" bson:"permissions"`
	Dashboards  []dashboardv1.Reference `json:"dashboards,omitempty" bson:"dashboards"`
}

type Link struct {
	Title string `json:"title" bson:"title"`
	Link  string `json:"link" bson:"link"`
}
