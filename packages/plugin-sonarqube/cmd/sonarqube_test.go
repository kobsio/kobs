package main

import (
	"testing"

	"github.com/kobsio/kobs/packages/plugin-sonarqube/pkg/instance"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	mockInstance := &instance.MockInstance{}
	mockInstance.On("GetName").Return("sonarqube")

	router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
	instance1 := router.getInstance("default")
	require.NotNil(t, instance1)

	instance2 := router.getInstance("sonarqube")
	require.NotNil(t, instance2)

	instance3 := router.getInstance("invalidname")
	require.Nil(t, instance3)
}

func TestMount(t *testing.T) {
	router, err := Mount([]plugin.Instance{{Name: "sonarqube"}}, nil)
	require.NoError(t, err)
	require.NotNil(t, router)
}
