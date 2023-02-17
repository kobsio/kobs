package users

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
)

func TestGetUsers(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newKubernetesClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		clusterClient := kubernetes.NewMockClient(ctrl)
		return clusterClient
	}

	t.Run("should return an error when no cluster paramter is provided", func(t *testing.T) {
		router := Router{chi.NewRouter(), nil, defaultTracer}
		router.Get("/users", router.getUsers)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/users?cluster=", nil)
		w := httptest.NewRecorder()

		router.getUsers(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["The 'cluster' parameter can not be empty"]}`)
	})

	t.Run("should handle error from Kubernetes client", func(t *testing.T) {
		cluster := "cluster1"
		clusterClient := newKubernetesClient(t)
		clusterClient.EXPECT().GetUsers(gomock.Any(), cluster, "").Return(nil, fmt.Errorf("unexpected error"))

		router := Router{chi.NewRouter(), clusterClient, defaultTracer}
		router.Get("/users", router.getUsers)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/users?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getUsers(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to get users"]}`)
	})

	t.Run("should list users", func(t *testing.T) {
		cluster := "cluster1"
		clusterClient := newKubernetesClient(t)
		clusterClient.
			EXPECT().
			GetUsers(gomock.Any(), cluster, "").
			Return([]userv1.UserSpec{
				{
					Cluster:   "cluster1",
					Namespace: "namespace1",
					Name:      "name1",
					ID:        "user1@kobs.io",
				},
			}, nil)

		router := Router{chi.NewRouter(), clusterClient, defaultTracer}
		router.Get("/users", router.getUsers)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/users?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getUsers(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `
			[
				{
					"cluster": "cluster1",
					"namespace": "namespace1",
					"name": "name1",
					"id": "user1@kobs.io",
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
