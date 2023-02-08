package v1

import (
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// Dashboard is the Dashboard CRD.
type Dashboard struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec DashboardSpec `json:"spec,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// DashboardList is the structure for a list of Dashboard CRs.
type DashboardList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata"`

	Items []Dashboard `json:"items"`
}

type DashboardSpec struct {
	ID           string        `json:"id,omitempty" bson:"_id"`
	UpdatedAt    int64         `json:"updatedAt,omitempty"`
	Cluster      string        `json:"cluster,omitempty"`
	Namespace    string        `json:"namespace,omitempty"`
	Name         string        `json:"name,omitempty"`
	Title        string        `json:"title,omitempty"`
	Description  string        `json:"description,omitempty"`
	HideToolbar  bool          `json:"hideToolbar,omitempty"`
	Placeholders []Placeholder `json:"placeholders,omitempty"`
	Variables    []Variable    `json:"variables,omitempty"`
	Panels       []Panel       `json:"panels"`
}

type Placeholder struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Default     string `json:"default,omitempty"`
	Type        string `json:"type,omitempty"`
}

type Variable struct {
	Name   string `json:"name"`
	Label  string `json:"label,omitempty"`
	Hide   bool   `json:"hide,omitempty"`
	Plugin Plugin `json:"plugin"`
}

type Panel struct {
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	X           int64  `json:"x,omitempty"`
	Y           int64  `json:"y,omitempty"`
	W           int64  `json:"w,omitempty"`
	H           int64  `json:"h,omitempty"`
	Plugin      Plugin `json:"plugin"`
}

type Plugin struct {
	Type    string                `json:"type"`
	Cluster string                `json:"cluster"`
	Name    string                `json:"name"`
	Options *apiextensionsv1.JSON `json:"options,omitempty"`
}

type Reference struct {
	Cluster      string            `json:"cluster,omitempty"`
	Namespace    string            `json:"namespace,omitempty"`
	Name         string            `json:"name,omitempty"`
	Title        string            `json:"title"`
	Description  string            `json:"description,omitempty"`
	Placeholders map[string]string `json:"placeholders,omitempty"`
	Inline       *ReferenceInline  `json:"inline,omitempty"`
}

type ReferenceInline struct {
	HideToolbar bool       `json:"hideToolbar,omitempty"`
	Variables   []Variable `json:"variables,omitempty"`
	Panels      []Panel    `json:"panels"`
}
