package signalsciences

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/signalsciences/instance"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("signalsciences")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("signalsciences")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("signalsciences")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("signalsciences")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestGetOverview(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/overview", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getOverview(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should handle error from instance", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")
		i.EXPECT().GetOverview(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/overview", nil)
		req.Header.Set("x-kobs-plugin", "signalsciences")
		w := httptest.NewRecorder()

		router.getOverview(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get overview"]}`)
	})

	t.Run("should return overview", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")
		i.EXPECT().GetOverview(gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/overview", nil)
		req.Header.Set("x-kobs-plugin", "signalsciences")
		w := httptest.NewRecorder()

		router.getOverview(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetSites(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/sites", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getSites(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should handle error from instance", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")
		i.EXPECT().GetSites().Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/sites", nil)
		req.Header.Set("x-kobs-plugin", "signalsciences")
		w := httptest.NewRecorder()

		router.getSites(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get sites"]}`)
	})

	t.Run("should return sites", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")
		i.EXPECT().GetSites().Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/sites", nil)
		req.Header.Set("x-kobs-plugin", "signalsciences")
		w := httptest.NewRecorder()

		router.getSites(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetAgents(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/agents", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getAgents(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should handle error from instance", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")
		i.EXPECT().GetAgents(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/agents", nil)
		req.Header.Set("x-kobs-plugin", "signalsciences")
		w := httptest.NewRecorder()

		router.getAgents(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get agents"]}`)
	})

	t.Run("should return agents", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")
		i.EXPECT().GetAgents(gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/agents", nil)
		req.Header.Set("x-kobs-plugin", "signalsciences")
		w := httptest.NewRecorder()

		router.getAgents(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetRequests(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/requests", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getRequests(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should handle error from instance", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")
		i.EXPECT().GetRequests(gomock.Any(), gomock.Any()).Return(0, "", nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/requests", nil)
		req.Header.Set("x-kobs-plugin", "signalsciences")
		w := httptest.NewRecorder()

		router.getRequests(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get requests"]}`)
	})

	t.Run("should return requests", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("signalsciences")
		i.EXPECT().GetRequests(gomock.Any(), gomock.Any()).Return(0, "", nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/requests", nil)
		req.Header.Set("x-kobs-plugin", "signalsciences")
		w := httptest.NewRecorder()

		router.getRequests(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"total": 0, "requests": null}`)
	})
}

func TestMount(t *testing.T) {
	t.Run("should return error for invalid options", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "signalsciences", Options: map[string]any{"corpName": []string{"test"}}}})
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should return router", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "signalsciences"}})
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
