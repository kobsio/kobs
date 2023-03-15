package helm

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/clusters/cluster"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestNew(t *testing.T) {
	require.NotNil(t, New())
}

func TestType(t *testing.T) {
	p := New()
	require.Equal(t, "helm", p.Type())
}

func TestMountCluster(t *testing.T) {
	p := New()

	t.Run("should return router", func(t *testing.T) {
		router, err := p.MountCluster(nil, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}

func TestMountHub(t *testing.T) {
	p := New()

	t.Run("should return router", func(t *testing.T) {
		router, err := p.MountHub(nil, nil, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}

func TestHubProxy(t *testing.T) {
	t.Run("should handle request with invalid cluster name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		clustersClient := clusters.NewMockClient(ctrl)
		clustersClient.EXPECT().GetCluster("").Return(nil)

		router, err := New().MountHub(nil, clustersClient, nil)
		require.NoError(t, err)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid cluster name"]}`)
	})

	t.Run("should handle permissions for all namespaces", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		clusterClient := cluster.NewMockClient(ctrl)
		clustersClient := clusters.NewMockClient(ctrl)
		clustersClient.EXPECT().GetCluster("").Return(clusterClient)

		router, err := New().MountHub(nil, clustersClient, nil)
		require.NoError(t, err)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})

		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to view Helm releases in all namespaces"]}`)
	})

	t.Run("should handle permissions for specific namespace", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		clusterClient := cluster.NewMockClient(ctrl)
		clustersClient := clusters.NewMockClient(ctrl)
		clustersClient.EXPECT().GetCluster("").Return(clusterClient)

		router, err := New().MountHub(nil, clustersClient, nil)
		require.NoError(t, err)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})

		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/?namespace=default", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to view Helm releases in the 'default' namespace"]}`)
	})

	t.Run("should proxy request", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		clusterClient := cluster.NewMockClient(ctrl)
		clusterClient.EXPECT().Proxy(gomock.Any(), gomock.Any())
		clustersClient := clusters.NewMockClient(ctrl)
		clustersClient.EXPECT().GetCluster("").Return(clusterClient)

		router, err := New().MountHub(nil, clustersClient, nil)
		require.NoError(t, err)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{
			Permissions: userv1.Permissions{
				Resources: []userv1.Resources{{
					Clusters:   []string{"*"},
					Namespaces: []string{"*"},
					Resources:  []string{"*"},
					Verbs:      []string{"*"},
				}},
			},
		})

		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/?namespace=default", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
	})
}
