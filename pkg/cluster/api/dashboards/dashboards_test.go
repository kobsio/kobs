package dashboards

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	dashboardsv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
)

func TestGetDashboards(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newKubernetesClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		kubernetesClient := kubernetes.NewMockClient(ctrl)
		return kubernetesClient
	}

	t.Run("should return an error when no cluster paramter is provided", func(t *testing.T) {
		router := Router{chi.NewRouter(), nil, defaultTracer}
		router.Get("/dashboards", router.getDashboards)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboards?cluster=", nil)
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["The 'cluster' parameter can not be empty"]}`)
	})

	t.Run("should handle error from Kubernetes client", func(t *testing.T) {
		cluster := "cluster1"
		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().GetDashboards(gomock.Any(), cluster, "").Return(nil, fmt.Errorf("unexpected error"))

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/dashboards", router.getDashboards)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/dashboards?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to get dashboards"]}`)
	})

	t.Run("should list dashboards", func(t *testing.T) {
		cluster := "cluster1"
		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.
			EXPECT().
			GetDashboards(gomock.Any(), cluster, "").
			Return([]dashboardsv1.DashboardSpec{
				{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard1"},
				{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard2"},
			}, nil)

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/dashboards", router.getDashboards)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/dashboards?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `
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
			]
		`)
	})
}

func TestMount(t *testing.T) {
	router := Mount(nil)
	require.NotNil(t, router)
}
