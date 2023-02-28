package v1

import (
	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"

	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
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
	ID          string                  `json:"id,omitempty" bson:"_id"`
	UpdatedAt   int64                   `json:"updatedAt,omitempty" bson:"updatedAt"`
	Cluster     string                  `json:"cluster,omitempty" bson:"cluster"`
	Namespace   string                  `json:"namespace,omitempty" bson:"namespace"`
	Name        string                  `json:"name,omitempty" bson:"name"`
	DisplayName string                  `json:"displayName,omitempty" bson:"displayName"`
	Password    string                  `json:"password,omitempty" bson:"password"`
	Teams       []string                `json:"teams,omitempty" bson:"teams"`
	Permissions Permissions             `json:"permissions,omitempty" bson:"permissions"`
	Dashboards  []dashboardv1.Reference `json:"dashboards,omitempty" bson:"dashboards"`
	Navigation  []Navigation            `json:"navigation,omitempty" bson:"navigation"`
}

type Permissions struct {
	Applications []ApplicationPermissions `json:"applications,omitempty" bson:"applications"`
	Teams        []string                 `json:"teams,omitempty" bson:"teams"`
	Plugins      []Plugin                 `json:"plugins,omitempty" bson:"plugins"`
	Resources    []Resources              `json:"resources,omitempty" bson:"resources"`
}

type ApplicationPermissions struct {
	Type       string   `json:"type" bson:"type"`
	Clusters   []string `json:"clusters,omitempty" bson:"clusters"`
	Namespaces []string `json:"namespaces,omitempty" bson:"namespaces"`
}

type Plugin struct {
	Cluster     string               `json:"cluster" bson:"cluster"`
	Name        string               `json:"name" bson:"name"`
	Type        string               `json:"type" bson:"type"`
	Permissions apiextensionsv1.JSON `json:"permissions,omitempty" bson:"permissions"`
}

type Resources struct {
	Clusters   []string `json:"clusters" bson:"clusters"`
	Namespaces []string `json:"namespaces" bson:"namespaces"`
	Resources  []string `json:"resources" bson:"resources"`
	Verbs      []string `json:"verbs" bson:"verbs"`
}

type Navigation struct {
	Name  string           `json:"name" bson:"name"`
	Items []NavigationItem `json:"items" bson:"items"`
}

type NavigationItem struct {
	Name  string               `json:"name" bson:"name"`
	Icon  string               `json:"icon,omitempty" bson:"icon"`
	Link  string               `json:"link,omitempty" bson:"link"`
	Page  *NavigationPage      `json:"page,omitempty" bson:"page"`
	Items []NavigationSubItems `json:"items,omitempty" bson:"items"`
}

type NavigationSubItems struct {
	Name string          `json:"name" bson:"name"`
	Link string          `json:"link,omitempty" bson:"link"`
	Page *NavigationPage `json:"page,omitempty" bson:"page"`
}

type NavigationPage struct {
	Title       string                  `json:"title,omitempty" bson:"title"`
	Description string                  `json:"description,omitempty" bson:"description"`
	Dashboards  []dashboardv1.Reference `json:"dashboards,omitempty" bson:"dashboards"`
}
