package dashboards

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang/mock/gomock"
	"go.opentelemetry.io/otel"

	"github.com/kobsio/kobs/pkg/client/api/testutil"
	"github.com/kobsio/kobs/pkg/client/kubernetes"
	dashboardsv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/dashboard/v1"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetDashboards(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newClusterClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		clusterClient := kubernetes.NewMockClient(ctrl)
		return clusterClient
	}

	t.Run("can handle error", func(t *testing.T) {
		cluster := "cluster1"
		clusterClient := newClusterClient(t)
		clusterClient.EXPECT().GetDashboards(gomock.Any(), cluster, "").Return(nil, fmt.Errorf("unexpected error"))

		router := Router{chi.NewRouter(), Config{}, clusterClient, defaultTracer}
		router.Get("/dashboards", router.getDashboards)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/dashboards?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		testutil.AssertStatusEq(t, http.StatusInternalServerError, w)
		testutil.AssertJSONEq(t, `{"error":"unexpected error"}`, w)
	})

	t.Run("can list dashboards", func(t *testing.T) {
		cluster := "cluster1"
		clusterClient := newClusterClient(t)
		clusterClient.
			EXPECT().
			GetDashboards(gomock.Any(), cluster, "").
			Return([]dashboardsv1.DashboardSpec{
				{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard1"},
				{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard2"},
			}, nil)

		router := Router{chi.NewRouter(), Config{}, clusterClient, defaultTracer}
		router.Get("/dashboards", router.getDashboards)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/dashboards?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		testutil.AssertStatusEq(t, http.StatusOK, w)
		testutil.AssertJSONEq(t, `
			[
				{
					"cluster": "cluster1",
					"namespace": "namespace1",
					"name": "dashboard1",
					"panels": null
				},
				{
					"cluster": "cluster1",
					"namespace": "namespace1",
					"name": "dashboard2",
					"panels": null
				}
			]`,
			w)
	})
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
