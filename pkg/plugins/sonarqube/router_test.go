package sonarqube

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/sonarqube/instance"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("sonarqube")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("sonarqube")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("sonarqube")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("sonarqube")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestGetProjects(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("sonarqube")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projects", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getProjects(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("sonarqube")
		i.EXPECT().GetProjects(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projects", nil)
		req.Header.Set("x-kobs-plugin", "sonarqube")
		w := httptest.NewRecorder()

		router.getProjects(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get projects"]}`)
	})

	t.Run("should return projects", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("sonarqube")
		i.EXPECT().GetProjects(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projects", nil)
		req.Header.Set("x-kobs-plugin", "sonarqube")
		w := httptest.NewRecorder()

		router.getProjects(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetProjectMeasures(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("sonarqube")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projectmeasures", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getProjectMeasures(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("sonarqube")
		i.EXPECT().GetProjectMeasures(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projectmeasures", nil)
		req.Header.Set("x-kobs-plugin", "sonarqube")
		w := httptest.NewRecorder()

		router.getProjectMeasures(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get project measures"]}`)
	})

	t.Run("should return projects", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("sonarqube")
		i.EXPECT().GetProjectMeasures(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projectmeasures", nil)
		req.Header.Set("x-kobs-plugin", "sonarqube")
		w := httptest.NewRecorder()

		router.getProjectMeasures(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestMount(t *testing.T) {
	t.Run("should return error for invalid instance", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "sonarqube", Options: map[string]any{"address": []string{"localhost"}}}}, nil)
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should work", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "sonarqube"}}, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
