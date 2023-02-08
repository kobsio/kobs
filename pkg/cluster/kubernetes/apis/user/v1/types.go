package v1

import (
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
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
	ID            string                  `json:"id,omitempty" bson:"_id"`
	UpdatedAt     int64                   `json:"updatedAt,omitempty"`
	Cluster       string                  `json:"cluster,omitempty"`
	Namespace     string                  `json:"namespace,omitempty"`
	Name          string                  `json:"name,omitempty"`
	Permissions   Permissions             `json:"permissions,omitempty"`
	Dashboards    []dashboardv1.Reference `json:"dashboards,omitempty"`
	Notifications Notifications           `json:"notifications,omitempty"`
}

type Permissions struct {
	Applications []ApplicationPermissions `json:"applications,omitempty"`
	Teams        []string                 `json:"teams,omitempty"`
	Plugins      []Plugin                 `json:"plugins,omitempty"`
	Resources    []Resources              `json:"resources,omitempty"`
}

type ApplicationPermissions struct {
	Type       string   `json:"type"`
	Clusters   []string `json:"clusters,omitempty"`
	Namespaces []string `json:"namespaces,omitempty"`
}

type Plugin struct {
	Cluster     string               `json:"cluster"`
	Name        string               `json:"name"`
	Type        string               `json:"type"`
	Permissions apiextensionsv1.JSON `json:"permissions,omitempty"`
}

type Resources struct {
	Clusters   []string `json:"clusters"`
	Namespaces []string `json:"namespaces"`
	Resources  []string `json:"resources"`
	Verbs      []string `json:"verbs"`
}

type Notifications struct {
	Groups []NotificationsGroup `json:"groups"`
}

type NotificationsGroup struct {
	Title  string             `json:"title"`
	Plugin dashboardv1.Plugin `json:"plugin"`
}
