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
	UpdatedAt    int64         `json:"updatedAt,omitempty" bson:"updatedAt"`
	Cluster      string        `json:"cluster,omitempty" bson:"cluster"`
	Namespace    string        `json:"namespace,omitempty" bson:"namespace"`
	Name         string        `json:"name,omitempty" bson:"name"`
	Title        string        `json:"title,omitempty" bson:"title"`
	Description  string        `json:"description,omitempty" bson:"description"`
	HideToolbar  bool          `json:"hideToolbar,omitempty" bson:"hideToolbar"`
	DefaultTime  string        `json:"defaultTime,omitempty" bson:"defaultTime"`
	Placeholders []Placeholder `json:"placeholders,omitempty" bson:"placeholders"`
	Variables    []Variable    `json:"variables,omitempty" bson:"variables"`
	Rows         []Row         `json:"rows" bson:"rows"`
}

type Placeholder struct {
	Name        string `json:"name" bson:"name"`
	Description string `json:"description,omitempty" bson:"description"`
	Default     string `json:"default,omitempty" bson:"default"`
	Type        string `json:"type,omitempty" bson:"type"`
}

type Variable struct {
	Name             string `json:"name" bson:"name"`
	Label            string `json:"label,omitempty" bson:"label"`
	Hide             bool   `json:"hide,omitempty" bson:"hide"`
	IncludeAllOption bool   `json:"includeAllOption,omitempty" bson:"includeAllOption"`
	Plugin           Plugin `json:"plugin" bson:"plugin"`
}

type Row struct {
	Title       string  `json:"title,omitempty" bson:"title"`
	Description string  `json:"description,omitempty" bson:"description"`
	If          string  `json:"if,omitempty" bson:"if"`
	AutoHeight  bool    `json:"autoHeight,omitempty" bson:"autoHeight"`
	Panels      []Panel `json:"panels" bson:"panels"`
}

type Panel struct {
	Title       string `json:"title" bson:"title"`
	Description string `json:"description,omitempty" bson:"description"`
	X           int64  `json:"x,omitempty" bson:"x"`
	Y           int64  `json:"y,omitempty" bson:"y"`
	W           int64  `json:"w,omitempty" bson:"w"`
	H           int64  `json:"h,omitempty" bson:"h"`
	Plugin      Plugin `json:"plugin" bson:"plugin"`
}

type Plugin struct {
	Type    string                `json:"type" bson:"type"`
	Cluster string                `json:"cluster,omitempty" bson:"cluster"`
	Name    string                `json:"name" bson:"name"`
	Options *apiextensionsv1.JSON `json:"options,omitempty" bson:"options"`
}

type Reference struct {
	Cluster      string            `json:"cluster,omitempty" bson:"cluster"`
	Namespace    string            `json:"namespace,omitempty" bson:"namespace"`
	Name         string            `json:"name,omitempty" bson:"name"`
	Title        string            `json:"title" bson:"title"`
	Description  string            `json:"description,omitempty" bson:"description"`
	Placeholders map[string]string `json:"placeholders,omitempty" bson:"placeholders"`
	Inline       *ReferenceInline  `json:"inline,omitempty" bson:"inline"`
}

type ReferenceInline struct {
	HideToolbar bool       `json:"hideToolbar,omitempty" bson:"hideToolbar"`
	DefaultTime string     `json:"defaultTime,omitempty" bson:"defaultTime"`
	Variables   []Variable `json:"variables,omitempty" bson:"variables"`
	Rows        []Row      `json:"rows" bson:"rows"`
}
