package users

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang/mock/gomock"
	"go.opentelemetry.io/otel"

	"github.com/kobsio/kobs/pkg/client/kubernetes"
	"github.com/kobsio/kobs/pkg/utils"

	userv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/user/v1"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetUsers(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newClusterClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		clusterClient := kubernetes.NewMockClient(ctrl)
		return clusterClient
	}

	t.Run("can handle error", func(t *testing.T) {
		cluster := "cluster1"
		clusterClient := newClusterClient(t)
		clusterClient.EXPECT().GetUsers(gomock.Any(), cluster, "").Return(nil, fmt.Errorf("unexpected error"))

		router := Router{chi.NewRouter(), Config{}, clusterClient, defaultTracer}
		router.Get("/users", router.getUsers)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/users?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getUsers(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error":"unexpected error"}`, w)
	})

	t.Run("can list users", func(t *testing.T) {
		cluster := "cluster1"
		clusterClient := newClusterClient(t)
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

		router := Router{chi.NewRouter(), Config{}, clusterClient, defaultTracer}
		router.Get("/users", router.getUsers)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/users?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getUsers(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `
				[
					{
						"cluster": "cluster1",
						"namespace": "namespace1",
						"name": "name1",
						"id": "user1@kobs.io",
						"permissions": {},
						"notifications": {
							"groups": null
						}
					}
				]`,
			w)
	})
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
