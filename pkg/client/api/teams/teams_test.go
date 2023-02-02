package teams

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

	teamv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/team/v1"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetTeams(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newClusterClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		clusterClient := kubernetes.NewMockClient(ctrl)
		return clusterClient
	}

	t.Run("can handle error", func(t *testing.T) {
		cluster := "cluster1"
		clusterClient := newClusterClient(t)
		clusterClient.EXPECT().GetTeams(gomock.Any(), cluster, "").Return(nil, fmt.Errorf("unexpected error"))

		router := Router{chi.NewRouter(), Config{}, clusterClient, defaultTracer}
		router.Get("/teams", router.getTeams)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/teams?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getTeams(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error":"unexpected error"}`, w)
	})

	t.Run("can list teams", func(t *testing.T) {
		cluster := "cluster1"
		clusterClient := newClusterClient(t)
		clusterClient.
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

		router := Router{chi.NewRouter(), Config{}, clusterClient, defaultTracer}
		router.Get("/teams", router.getTeams)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/teams?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getTeams(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `
			[
				{
					"id": "team1@kobs.io",
					"cluster": "cluster1",
					"namespace": "namespace1",
					"name": "name1",
					"permissions": {},
						"notifications": {
							"groups": null
						}
					}
			]
			`,
			w)
	})
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
