package kiali

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/kiali/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/kiali/kiali/models"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("kiali")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("kiali")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("kiali")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("kiali")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestGetNamespaces(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/namespaces", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getNamespaces(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")
		i.EXPECT().GetNamespaces(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/namespaces", nil)
		req.Header.Set("x-kobs-plugin", "kiali")
		w := httptest.NewRecorder()

		router.getNamespaces(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get namespaces"]}`)
	})

	t.Run("should return namespaces", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")
		i.EXPECT().GetNamespaces(gomock.Any()).Return([]models.Namespace{{Name: "kube-system"}, {Name: "default"}}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/namespaces", nil)
		req.Header.Set("x-kobs-plugin", "kiali")
		w := httptest.NewRecorder()

		router.getNamespaces(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `["kube-system","default"]`)
	})
}

func TestGetGraph(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/graph", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getGraph(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail for invalid duration parameter", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/graph", nil)
		req.Header.Set("x-kobs-plugin", "kiali")
		w := httptest.NewRecorder()

		router.getGraph(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse duration parameter"]}`)
	})

	t.Run("should fail for invalid injectServiceNodes parameter", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/graph?duration=30", nil)
		req.Header.Set("x-kobs-plugin", "kiali")
		w := httptest.NewRecorder()

		router.getGraph(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse injectServiceNodes parameter"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")
		i.EXPECT().GetGraph(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/graph?duration=30&injectServiceNodes=true", nil)
		req.Header.Set("x-kobs-plugin", "kiali")
		w := httptest.NewRecorder()

		router.getGraph(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get topology graph"]}`)
	})

	t.Run("should return graph", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")
		i.EXPECT().GetGraph(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/graph?duration=30&injectServiceNodes=true", nil)
		req.Header.Set("x-kobs-plugin", "kiali")
		w := httptest.NewRecorder()

		router.getGraph(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})

	t.Run("should fail when instance returns an error for application", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")
		i.EXPECT().GetApplicationGraph(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/graph?application=myservice&namespace=myservice&duration=30&injectServiceNodes=true", nil)
		req.Header.Set("x-kobs-plugin", "kiali")
		w := httptest.NewRecorder()

		router.getGraph(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get topology graph"]}`)
	})

	t.Run("should return grap for applicationh", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")
		i.EXPECT().GetApplicationGraph(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/graph?application=myservice&namespace=myservice&duration=30&injectServiceNodes=true", nil)
		req.Header.Set("x-kobs-plugin", "kiali")
		w := httptest.NewRecorder()

		router.getGraph(w, req)

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
		i.EXPECT().GetName().Return("kiali")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/metrics", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")
		i.EXPECT().GetMetrics(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/metrics", nil)
		req.Header.Set("x-kobs-plugin", "kiali")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get metrics"]}`)
	})

	t.Run("should return metrics", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("kiali")
		i.EXPECT().GetMetrics(gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/metrics", nil)
		req.Header.Set("x-kobs-plugin", "kiali")
		w := httptest.NewRecorder()

		router.getMetrics(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestMount(t *testing.T) {
	t.Run("should return error for invalid instance", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "kiali", Options: map[string]any{"address": []string{"localhost"}}}}, nil)
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should work", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "kiali"}}, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
