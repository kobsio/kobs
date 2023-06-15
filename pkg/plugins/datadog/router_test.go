package datadog

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/datadog/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("datadog")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("datadog")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("datadog")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("datadog")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestGetLogs(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("datadog")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/logs", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail for invalid timeStart parameter", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("datadog")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/logs", nil)
		req.Header.Set("x-kobs-plugin", "datadog")
		w := httptest.NewRecorder()

		router.getLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse 'timeStart' parameter"]}`)
	})

	t.Run("should fail for invalid timeEnd parameter", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("datadog")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/logs?timeStart=0", nil)
		req.Header.Set("x-kobs-plugin", "datadog")
		w := httptest.NewRecorder()

		router.getLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse 'timeEnd' parameter"]}`)
	})

	t.Run("should fail when instance returns an error for logs aggregation request", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("datadog")
		i.EXPECT().GetLogsAggregation(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/logs?timeStart=0&timeEnd=0", nil)
		req.Header.Set("x-kobs-plugin", "datadog")
		w := httptest.NewRecorder()

		router.getLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get logs aggregation"]}`)
	})

	t.Run("should fail when instance returns an error for logs request", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("datadog")
		i.EXPECT().GetLogsAggregation(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)
		i.EXPECT().GetLogs(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/logs?timeStart=0&timeEnd=0", nil)
		req.Header.Set("x-kobs-plugin", "datadog")
		w := httptest.NewRecorder()

		router.getLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get logs"]}`)
	})

	t.Run("should return logs", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("datadog")
		i.EXPECT().GetLogsAggregation(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)
		i.EXPECT().GetLogs(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/logs?timeStart=0&timeEnd=0", nil)
		req.Header.Set("x-kobs-plugin", "datadog")
		w := httptest.NewRecorder()

		router.getLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"buckets":null,"logs":null}`)
	})
}

func TestMount(t *testing.T) {
	t.Run("should return error for invalid instance", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "datadog", Options: map[string]any{"address": []string{"localhost"}}}})
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should work", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "datadog"}})
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
