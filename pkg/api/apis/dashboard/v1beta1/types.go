package v1beta1

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
	Cluster      string        `json:"cluster,omitempty"`
	Namespace    string        `json:"namespace,omitempty"`
	Name         string        `json:"name,omitempty"`
	Title        string        `json:"title,omitempty"`
	Description  string        `json:"description,omitempty"`
	Placeholders []Placeholder `json:"placeholders,omitempty"`
	Variables    []Variable    `json:"variables,omitempty"`
	Rows         []Row         `json:"rows"`
}

type Placeholder struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
}

type Variable struct {
	Name   string `json:"name"`
	Label  string `json:"label,omitempty"`
	Hide   bool   `json:"hide,omitempty"`
	Plugin Plugin `json:"plugin"`
}

type Row struct {
	Title       string  `json:"title,omitempty"`
	Description string  `json:"description,omitempty"`
	Size        int64   `json:"size,omitempty"`
	Panels      []Panel `json:"panels"`
}

type Panel struct {
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	ColSpan     int64  `json:"colSpan,omitempty"`
	RowSpan     int64  `json:"rowSpan,omitempty"`
	Plugin      Plugin `json:"plugin"`
}

type Plugin struct {
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
	Variables []Variable `json:"variables,omitempty"`
	Rows      []Row      `json:"rows"`
}
