package rss

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/rss/instance"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/mmcdole/gofeed"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("rss")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("rss")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("rss")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("rss")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestGetFeed(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("rss")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/feed", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getFeed(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should return null when no urls where provided", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("rss")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/feed", nil)
		req.Header.Set("x-kobs-plugin", "rss")
		w := httptest.NewRecorder()

		router.getFeed(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})

	t.Run("should return null when url could not be parsed", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("rss")
		i.EXPECT().GetFeed("invalid").Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/feed?url=invalid", nil)
		req.Header.Set("x-kobs-plugin", "rss")
		w := httptest.NewRecorder()

		router.getFeed(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})

	t.Run("should return feed", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("rss")
		i.EXPECT().GetFeed("invalid").Return(&gofeed.Feed{Title: "Test"}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/feed?url=invalid", nil)
		req.Header.Set("x-kobs-plugin", "rss")
		w := httptest.NewRecorder()

		router.getFeed(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestMount(t *testing.T) {
	router, err := Mount([]plugin.Instance{{Name: "rss"}})
	require.NoError(t, err)
	require.NotNil(t, router)
}
