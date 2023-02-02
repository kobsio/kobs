package shared

import (
	"testing"

	"github.com/kobsio/kobs/pkg/client/kubernetes"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"
)

func TestGetResources(t *testing.T) {
	t.Run("contains all resources", func(t *testing.T) {
		custom := kubernetes.CRD{ID: "custom-resource"}
		r := GetResources([]kubernetes.CRD{custom})
		for _, resource := range resources {
			require.True(t, utils.Some(r, func(x Resource) bool {
				return x.ID == resource.ID
			}))
		}

		require.True(t, utils.Some(r, func(x Resource) bool {
			return x.ID == custom.ID
		}))

	})

	t.Run("some resources are namespaced", func(t *testing.T) {
		r := GetResources([]kubernetes.CRD{{Scope: "namespaced"}})
		require.True(t, utils.Some(r, func(x Resource) bool {
			return x.Scope == "Namespaced"
		}))
	})
}

func TestGetResourceByID(t *testing.T) {
	t.Run("can get by id", func(t *testing.T) {
		target := resources[0]
		require.Equal(t, target, GetResourceByID(target.ID))
	})

	t.Run("returns empty resource, when not found", func(t *testing.T) {
		require.Equal(t, Resource{}, GetResourceByID("this doesnt exist"))
	})
}
