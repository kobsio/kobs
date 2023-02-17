package applications

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
)

func TestGetApplications(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var kubernetesClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		kubernetesClient := kubernetes.NewMockClient(ctrl)
		return kubernetesClient
	}

	t.Run("should return an error when no cluster paramter is provided", func(t *testing.T) {
		router := Router{chi.NewRouter(), nil, defaultTracer}
		router.Get("/applications", router.getApplications)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/applications?cluster=", nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["The 'cluster' parameter can not be empty"]}`)
	})

	t.Run("should handle error from Kubernetes client", func(t *testing.T) {
		cluster := "cluster1"
		kubernetesClient := kubernetesClient(t)
		kubernetesClient.EXPECT().GetApplications(gomock.Any(), cluster, "").Return(nil, fmt.Errorf("unexpected error"))

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/applications", router.getApplications)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/applications?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to get applications"]}`)
	})

	t.Run("should list applications", func(t *testing.T) {
		cluster := "cluster1"
		kubernetesClient := kubernetesClient(t)
		kubernetesClient.
			EXPECT().
			GetApplications(gomock.Any(), cluster, "").
			Return([]applicationv1.ApplicationSpec{
				{
					Cluster:   "cluster1",
					Namespace: "namespace1",
					Name:      "application1",
					Teams:     []string{"team1"},
				},
			}, nil)

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/applications", router.getApplications)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/applications?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `
			[
				{
					"cluster": "cluster1",
					"namespace": "namespace1",
					"name": "application1",
					"teams": [ "team1" ],
					"topology": {}
				}
			]
		`)
	})
}

func TestMount(t *testing.T) {
	router := Mount(nil)
	require.NotNil(t, router)
}
