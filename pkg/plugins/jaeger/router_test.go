package jaeger

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/jaeger/instance"
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
		mockInstance.EXPECT().GetName().Return("jaeger")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("jaeger")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("jaeger")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("jaeger")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestGetServices(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/services", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getServices(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")
		i.EXPECT().GetServices(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/services", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getServices(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get services"]}`)
	})

	t.Run("should return services", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")
		i.EXPECT().GetServices(gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/services", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getServices(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetOperations(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/operations", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getOperations(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")
		i.EXPECT().GetOperations(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/operations", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getOperations(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get operations"]}`)
	})

	t.Run("should return operations", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")
		i.EXPECT().GetOperations(gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/operations", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getOperations(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetTraces(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/traces", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getTraces(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail for invalid start time", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/traces", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getTraces(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse start time"]}`)
	})

	t.Run("should fail for invalid end time", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/traces?timeStart=0", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getTraces(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse end time"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")
		i.EXPECT().GetTraces(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/traces?timeStart=0&timeEnd=0", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getTraces(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get traces"]}`)
	})

	t.Run("should return traces", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")
		i.EXPECT().GetTraces(gomock.Any(), "", "", "", "myoperation", "myservice", "", int64(0), int64(0)).Return(map[string]any{"data": []map[string]any{{"traceID": "f821489350cd7465fcc727e92e32a237"}}}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/traces?operation=myoperation&service=myservice&timeStart=0&timeEnd=0", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getTraces(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"data": [{"traceID": "f821489350cd7465fcc727e92e32a237"}]}`)
	})
}

func TestGetTrace(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/operations", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getTrace(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")
		i.EXPECT().GetTrace(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/trace", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getTrace(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get trace"]}`)
	})

	t.Run("should return trace", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")
		i.EXPECT().GetTrace(gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/trace", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getTrace(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetMetrics(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/metrics", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail for invalid start time", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/metrics", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse start time"]}`)
	})

	t.Run("should fail for invalid end time", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/metrics?timeStart=0", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse end time"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")
		i.EXPECT().GetMetrics(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/metrics?timeStart=0&timeEnd=0", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get metrics"]}`)
	})

	t.Run("should return metrics", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jaeger")
		i.EXPECT().GetMetrics(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/metrics?timeStart=0&timeEnd=0", nil)
		req.Header.Set("x-kobs-plugin", "jaeger")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestMount(t *testing.T) {
	t.Run("should return error for invalid instance", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "jaeger", Options: map[string]any{"address": []string{"localhost"}}}}, nil)
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should work", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "jaeger"}}, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
