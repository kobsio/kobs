package v1

import (
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// User is the User CRD.
type User struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec UserSpec `json:"spec,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// UserList is the structure for a list of User CRs.
type UserList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata"`

	Items []User `json:"items"`
}

type UserSpec struct {
	ID          string                  `json:"id,omitempty" boltholdUnique:"UniqueID"`
	Satellite   string                  `json:"satellite,omitempty"`
	UpdatedAt   int64                   `json:"updatedAt,omitempty"`
	Cluster     string                  `json:"cluster,omitempty"`
	Namespace   string                  `json:"namespace,omitempty"`
	Name        string                  `json:"name,omitempty"`
	Email       string                  `json:"email" boltholdIndex:"Email"`
	Permissions Permissions             `json:"permissions,omitempty"`
	Dashboards  []dashboardv1.Reference `json:"dashboards,omitempty"`
}

type Permissions struct {
	Plugins   []Plugin    `json:"plugins"`
	Resources []Resources `json:"resources"`
}

type Plugin struct {
	Satellite   string               `json:"satellite"`
	Name        string               `json:"name"`
	Permissions apiextensionsv1.JSON `json:"permissions,omitempty"`
}

type Resources struct {
	Satellites []string `json:"satellites"`
	Clusters   []string `json:"clusters"`
	Namespaces []string `json:"namespaces"`
	Resources  []string `json:"resources"`
	Verbs      []string `json:"verbs"`
}
