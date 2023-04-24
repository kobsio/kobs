package pluginproxy

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/clusters/cluster"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/render"
	"github.com/golang/mock/gomock"
)

func TestProxy(t *testing.T) {
	hubHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, r, struct {
			OK bool `json:"ok"`
		}{true})
	})

	t.Run("should handle request where the header 'x-kobs-cluster' isn't set", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		clustersClient := clusters.NewMockClient(ctrl)
		mw := New(clustersClient)

		handler := mw(hubHandler)

		w := httptest.NewRecorder()
		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/path", nil)
		handler.ServeHTTP(w, r)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Required header 'x-kobs-cluster' is missing"]}`)
	})

	t.Run("should handle request to hub", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		clustersClient := clusters.NewMockClient(ctrl)
		mw := New(clustersClient)

		handler := mw(hubHandler)

		w := httptest.NewRecorder()
		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/path", nil)
		r.Header.Set("x-kobs-cluster", "hub")
		handler.ServeHTTP(w, r)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"ok": true}`)
	})

	t.Run("should handle request with a cluster target which doesn't exist", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		clustersClient := clusters.NewMockClient(ctrl)
		mw := New(clustersClient)

		handler := mw(hubHandler)

		w := httptest.NewRecorder()
		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/path", nil)
		r.Header.Set("x-kobs-cluster", "unknown")

		clustersClient.EXPECT().GetCluster("unknown").Return(nil)
		handler.ServeHTTP(w, r)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid cluster name: 'unknown'"]}`)
	})

	t.Run("should handle request that's proxied to a different cluster", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		clustersClient := clusters.NewMockClient(ctrl)
		mw := New(clustersClient)

		handler := mw(hubHandler)

		w := httptest.NewRecorder()
		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/path", nil)
		r.Header.Set("x-kobs-cluster", "foo")

		clusterClient := cluster.NewMockClient(ctrl)
		clusterClient.EXPECT().Proxy(w, r).Do(func(w http.ResponseWriter, r *http.Request) {
			render.JSON(w, r, struct {
				Foo bool `json:"foo"`
			}{true})
		})
		clustersClient.EXPECT().GetCluster("foo").Return(clusterClient)

		handler.ServeHTTP(w, r)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"foo": true}`)
	})
}
