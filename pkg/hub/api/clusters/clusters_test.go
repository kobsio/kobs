package clusters

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/clusters/cluster"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"

	"github.com/go-chi/chi/v5"
)

func TestGetClusters(t *testing.T) {
	t.Run("can get clusters", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		clusterClient := clusters.NewMockClient(ctrl)
		cluster1 := cluster.NewMockClient(ctrl)
		cluster1.EXPECT().GetName().Return("cluster-1")
		cluster2 := cluster.NewMockClient(ctrl)
		cluster2.EXPECT().GetName().Return("cluster-2")
		clusterClient.EXPECT().GetClusters().Return([]cluster.Client{
			cluster1,
			cluster2,
		})
		router := Router{chi.NewRouter(), dbClient, clusterClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/clusters", nil)
		w := httptest.NewRecorder()
		router.getClusters(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t,
			`{
				"clusters": ["cluster-1", "cluster-2"]
			}`, w)
	})
}

func TestGetNamespaces(t *testing.T) {
	t.Run("get namespaces fails", func(t *testing.T) {
		cluster := "cluster-1"
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetNamespacesByClusters(gomock.Any(), []string{cluster}).Return(nil, fmt.Errorf("could not get namespaces"))
		clusterClient := clusters.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, clusterClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		path := fmt.Sprintf("/namespaces?clusterID=%s", cluster)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, path, nil)
		w := httptest.NewRecorder()
		router.getNamespaces(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t,
			`{"error": "could not get namespaces"}`, w)

	})

	t.Run("get namespaces fails", func(t *testing.T) {
		cluster := "cluster-1"
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetNamespacesByClusters(gomock.Any(), []string{cluster}).Return([]db.Namespace{
			{Namespace: "default", Cluster: "dev-de1"},
			{Namespace: "kube-system", Cluster: "dev-de1"},
			{Namespace: "default", Cluster: "stage-de1"},
		}, nil)
		clusterClient := clusters.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, clusterClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		path := fmt.Sprintf("/namespaces?clusterID=%s", cluster)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, path, nil)
		w := httptest.NewRecorder()
		router.getNamespaces(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t,
			`["default","kube-system"]`,
			w)
	})
}

func TestGetResources(t *testing.T) {
	t.Run("get crds fails", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetCRDs(gomock.Any()).Return(nil, fmt.Errorf("could not get crds"))
		clusterClient := clusters.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, clusterClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/crds", nil)
		w := httptest.NewRecorder()
		router.getResources(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error": "could not get Custom Resource Definitions"}`, w)
	})

	t.Run("can get crds", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetCRDs(gomock.Any()).Return(nil, nil)
		clusterClient := clusters.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, clusterClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/crds", nil)
		w := httptest.NewRecorder()
		router.getResources(w, req)
		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONSnapshotEq(t, "crds.json", w)
	})
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil, nil)
	require.NotNil(t, router)
}
