package azure

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/azure/instance"
	"github.com/kobsio/kobs/pkg/plugins/azure/instance/monitor"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
)

func TestGetMetrics(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, *monitor.MockClient, Router) {
		ctrl := gomock.NewController(t)
		mockMonitorClient := monitor.NewMockClient(ctrl)
		mockInstance := instance.NewMockInstance(ctrl)

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, mockMonitorClient, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/monitor/metrics", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid instance name"]}`)
	})

	t.Run("should fail for invalid start time", func(t *testing.T) {
		i, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/monitor/metrics", nil)
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse start time"]}`)
	})

	t.Run("should fail for invalid end time", func(t *testing.T) {
		i, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/monitor/metrics?timeStart=0", nil)
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse end time"]}`)
	})

	t.Run("should fail if monitor client returns error", func(t *testing.T) {
		i, mc, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().MonitorClient().Return(mc)
		mc.EXPECT().GetMetrics(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/monitor/metrics?timeStart=0&timeEnd=0", nil)
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get metrics"]}`)
	})

	t.Run("should return metrics", func(t *testing.T) {
		i, mc, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().MonitorClient().Return(mc)
		mc.EXPECT().GetMetrics(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/monitor/metrics?timeStart=0&timeEnd=0", nil)
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetMetricDefinitions(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, *monitor.MockClient, Router) {
		ctrl := gomock.NewController(t)
		mockMonitorClient := monitor.NewMockClient(ctrl)
		mockInstance := instance.NewMockInstance(ctrl)

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, mockMonitorClient, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/monitor/metricdefinitions", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getMetricDefinitions(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid instance name"]}`)
	})

	t.Run("should fail if monitor client returns error", func(t *testing.T) {
		i, mc, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().MonitorClient().Return(mc)
		mc.EXPECT().GetMetricDefinitions(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/monitor/metricdefinitions", nil)
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getMetricDefinitions(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get metric definitions"]}`)
	})

	t.Run("should return metrics", func(t *testing.T) {
		i, mc, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().MonitorClient().Return(mc)
		mc.EXPECT().GetMetricDefinitions(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/monitor/metricdefinitions", nil)
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getMetricDefinitions(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}
