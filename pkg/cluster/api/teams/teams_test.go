package teams

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
)

func TestGetTeams(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newKubernetesClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		kubernetesClient := kubernetes.NewMockClient(ctrl)
		return kubernetesClient
	}

	t.Run("should return an error when no cluster paramter is provided", func(t *testing.T) {
		router := Router{chi.NewRouter(), nil, defaultTracer}
		router.Get("/teams", router.getTeams)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/teams?cluster=", nil)
		w := httptest.NewRecorder()

		router.getTeams(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["The 'cluster' parameter can not be empty"]}`)
	})

	t.Run("should handle error from Kubernetes client", func(t *testing.T) {
		cluster := "cluster1"
		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().GetTeams(gomock.Any(), cluster, "").Return(nil, fmt.Errorf("unexpected error"))

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/teams", router.getTeams)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/teams?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getTeams(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to get teams"]}`)
	})

	t.Run("should list teams", func(t *testing.T) {
		cluster := "cluster1"
		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.
			EXPECT().
			GetTeams(gomock.Any(), cluster, "").
			Return([]teamv1.TeamSpec{
				{
					Cluster:   "cluster1",
					Namespace: "namespace1",
					Name:      "name1",
					ID:        "team1@kobs.io",
				},
			}, nil)

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/teams", router.getTeams)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/teams?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getTeams(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `
			[
				{
					"id": "team1@kobs.io",
					"cluster": "cluster1",
					"namespace": "namespace1",
					"name": "name1",
					"permissions": {}
				}
			]
		`)
	})
}

func TestMount(t *testing.T) {
	router := Mount(nil)
	require.NotNil(t, router)
}
