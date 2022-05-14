package shared

import (
	"testing"

	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"

	"github.com/stretchr/testify/require"
)

func TestGetResourcesWithCRDs(t *testing.T) {
	crds := []cluster.CRD{{
		ID:    "test",
		Scope: "Namespaced",
	}}
	require.Equal(t, 28, len(GetResources(crds)))
}

func TestCRDToResource(t *testing.T) {
	crd := cluster.CRD{
		ID:    "test",
		Scope: "Namespaced",
	}
	require.Equal(t, Resource{ID: "test", IsCRD: true, Scope: "Namespaced"}, CRDToResource(crd))
}

func TestGetResourceByID(t *testing.T) {
	require.Equal(t, Resource{ID: "pods", IsCRD: false, Path: "/api/v1", Resource: "pods", Title: "Pods", Description: "Pods are the smallest deployable units of computing that you can create and manage in Kubernetes.", Scope: "Namespaced"}, GetResourceByID("pods"))
	require.Equal(t, Resource{ID: "", IsCRD: false, Path: "", Resource: "", Title: "", Description: "", Scope: "", Colums: []cluster.CRDColumn(nil)}, GetResourceByID("fake"))
}
