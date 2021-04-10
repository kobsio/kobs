package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/kobsio/kobs/pkg/api/plugins/team/proto"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// Team is the Team CRD, which consists of the Kubernetes metadata and the Team from the protobuf  definition.
type Team struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`
	Spec              *proto.Team `json:"spec"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// TeamList is the structure of a list of Team CRs.
type TeamList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata"`

	Items []Team `json:"items"`
}
