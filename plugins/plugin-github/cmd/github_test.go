package github

import (
	"testing"

	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-github/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	mockInstance := &instance.MockInstance{}
	mockInstance.On("GetName").Return("github")

	router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
	instance1 := router.getInstance("default")
	require.NotNil(t, instance1)

	instance2 := router.getInstance("github")
	require.NotNil(t, instance2)

	instance3 := router.getInstance("invalidname")
	require.Nil(t, instance3)
}

func TestMount(t *testing.T) {
	router1, err := Mount([]plugin.Instance{{Name: "github", Options: map[string]any{}}}, nil)
	require.NoError(t, err)
	require.NotNil(t, router1)

	router2, err := Mount([]plugin.Instance{{Name: "github", Options: map[string]any{"organization": []string{"kobs"}}}}, nil)
	require.Error(t, err)
	require.Nil(t, router2)
}
