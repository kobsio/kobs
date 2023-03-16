package grafana

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/kobsio/kobs/pkg/plugins/grafana/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("grafana")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("grafana")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("grafana")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("grafana")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestGetDashboards(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("grafana")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/feed", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should return error on GetDashboard error for uids", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("grafana")
		i.EXPECT().GetDashboard(gomock.Any(), "test").Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboards?uid=test", nil)
		req.Header.Set("x-kobs-plugin", "grafana")
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get dashboard"]}`)
	})

	t.Run("should return dashboards for uids", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("grafana")
		i.EXPECT().GetDashboard(gomock.Any(), "test").Return(&instance.Dashboard{Type: "test"}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboards?uid=test", nil)
		req.Header.Set("x-kobs-plugin", "grafana")
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[{"id":0,"uid":"","title":"","tags":null,"url":"","folderId":0,"folderUid":"","type":"test"}]`)
	})

	t.Run("should return error on GetDashboards error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("grafana")
		i.EXPECT().GetDashboards(gomock.Any(), "test").Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboards?query=test", nil)
		req.Header.Set("x-kobs-plugin", "grafana")
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get dashboards"]}`)
	})

	t.Run("should return dashboards for uids", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("grafana")
		i.EXPECT().GetDashboards(gomock.Any(), "test").Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboards?query=test", nil)
		req.Header.Set("x-kobs-plugin", "grafana")
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestMount(t *testing.T) {
	t.Run("should return error for invalid options", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "grafana", Options: map[string]any{"address": []string{"localhost"}}}}, nil)
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should return router", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "grafana"}}, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})

}
