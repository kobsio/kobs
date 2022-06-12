package main

import (
	"testing"

	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-techdocs/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	mockInstance := &instance.MockInstance{}
	mockInstance.On("GetName").Return("techdocs")

	router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
	instance1 := router.getInstance("default")
	require.NotNil(t, instance1)

	instance2 := router.getInstance("techdocs")
	require.NotNil(t, instance2)

	instance3 := router.getInstance("invalidname")
	require.Nil(t, instance3)
}

func TestMount(t *testing.T) {
	router1, err := Mount([]plugin.Instance{{Name: "techdocs", Options: map[string]interface{}{"provider": map[string]interface{}{"type": "local"}}}}, nil)
	require.NoError(t, err)
	require.NotNil(t, router1)

	router2, err := Mount([]plugin.Instance{{Name: "techdocs", Options: map[string]interface{}{"provider": map[string]interface{}{"type": "fake"}}}}, nil)
	require.Error(t, err)
	require.Nil(t, router2)
}
