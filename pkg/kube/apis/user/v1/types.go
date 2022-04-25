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
	Cluster     string            `json:"cluster,omitempty"`
	Namespace   string            `json:"namespace,omitempty"`
	Name        string            `json:"name,omitempty"`
	ID          string            `json:"id"`
	Profile     Profile           `json:"profile"`
	Teams       []TeamReference   `json:"teams,omitempty"`
	Permissions Permissions       `json:"permissions,omitempty"`
	Rows        []dashboardv1.Row `json:"rows,omitempty"`
}

type Profile struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Position string `json:"position,omitempty"`
	Bio      string `json:"bio,omitempty"`
}

type TeamReference struct {
	Cluster   string `json:"cluster,omitempty"`
	Namespace string `json:"namespace,omitempty"`
	Name      string `json:"name"`
}

type Permissions struct {
	Plugins   []Plugin    `json:"plugins"`
	Resources []Resources `json:"resources"`
}

type Plugin struct {
	Name        string               `json:"name"`
	Permissions apiextensionsv1.JSON `json:"permissions,omitempty"`
}

type Resources struct {
	Clusters   []string `json:"clusters"`
	Namespaces []string `json:"namespaces"`
	Resources  []string `json:"resources"`
	Verbs      []string `json:"verbs"`
}
