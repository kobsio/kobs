package v1beta1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// Application is the Application CRD.
type Application struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec ApplicationSpec `json:"spec,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ApplicationList is the structure for a list of Application CRs.
type ApplicationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata"`

	Items []Application `json:"items"`
}

type ApplicationSpec struct {
	Cluster      string      `json:"cluster,omitempty"`
	Namespace    string      `json:"namespace,omitempty"`
	Name         string      `json:"name,omitempty"`
	Description  string      `json:"description,omitempty"`
	Links        []Link      `json:"links,omitempty"`
	Teams        []Reference `json:"teams,omitempty"`
	Dependencies []Reference `json:"dependencies,omitempty"`
	// TODO: Add the preview options, when the Dashboard CRD was created.
	// Preview      Plugin       `json:"preview"`
	Dashboards []Reference `json:"dashboards,omitempty"`
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
