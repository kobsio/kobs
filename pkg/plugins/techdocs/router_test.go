package techdocs

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/techdocs/instance"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("techdocs")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("techdocs")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("techdocs")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("techdocs")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestGetIndexes(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/indexes", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getIndexes(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")
		i.EXPECT().GetIndexes(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/indexes", nil)
		req.Header.Set("x-kobs-plugin", "techdocs")
		w := httptest.NewRecorder()

		router.getIndexes(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get indexes"]}`)
	})

	t.Run("should return indexes", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")
		i.EXPECT().GetIndexes(gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/indexes", nil)
		req.Header.Set("x-kobs-plugin", "techdocs")
		w := httptest.NewRecorder()

		router.getIndexes(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetIndex(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/index", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getIndex(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")
		i.EXPECT().GetIndex(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/index", nil)
		req.Header.Set("x-kobs-plugin", "techdocs")
		w := httptest.NewRecorder()

		router.getIndex(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get index"]}`)
	})

	t.Run("should return index", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")
		i.EXPECT().GetIndex(gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/index", nil)
		req.Header.Set("x-kobs-plugin", "techdocs")
		w := httptest.NewRecorder()

		router.getIndex(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetMarkdown(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/markdown", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getMarkdown(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")
		i.EXPECT().GetMarkdown(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/markdown", nil)
		req.Header.Set("x-kobs-plugin", "techdocs")
		w := httptest.NewRecorder()

		router.getMarkdown(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get markdown"]}`)
	})

	t.Run("should return markdown", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")
		i.EXPECT().GetMarkdown(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/markdown", nil)
		req.Header.Set("x-kobs-plugin", "techdocs")
		w := httptest.NewRecorder()

		router.getMarkdown(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetFile(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/file", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getFile(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")
		i.EXPECT().GetFile(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/file?x-kobs-plugin=techdocs", nil)
		req.Header.Set("x-kobs-plugin", "techdocs")
		w := httptest.NewRecorder()

		router.getFile(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
	})

	t.Run("should return file", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("techdocs")
		i.EXPECT().GetFile(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/file?x-kobs-plugin=techdocs", nil)
		req.Header.Set("x-kobs-plugin", "techdocs")
		w := httptest.NewRecorder()

		router.getFile(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
	})
}

func TestMount(t *testing.T) {
	t.Run("should return error for invalid instance", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "techdocs", Options: map[string]any{"address": []string{"localhost"}}}})
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should work", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "techdocs", Options: map[string]any{"provider": map[string]any{"type": "local"}}}})
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
