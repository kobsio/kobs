package main

import (
	"testing"

	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-harbor/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	mockInstance := &instance.MockInstance{}
	mockInstance.On("GetName").Return("harbor")

	router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
	instance1 := router.getInstance("default")
	require.NotNil(t, instance1)

	instance2 := router.getInstance("harbor")
	require.NotNil(t, instance2)

	instance3 := router.getInstance("invalidname")
	require.Nil(t, instance3)
}

func TestMount(t *testing.T) {
	router1, err := Mount([]plugin.Instance{{Name: "harbor", Options: map[string]interface{}{}}}, nil)
	require.NoError(t, err)
	require.NotNil(t, router1)

	router2, err := Mount([]plugin.Instance{{Name: "harbor", Options: map[string]interface{}{"token": []string{"token"}}}}, nil)
	require.Error(t, err)
	require.Nil(t, router2)
}
