package applications

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang/mock/gomock"
	"go.opentelemetry.io/otel"

	"github.com/kobsio/kobs/pkg/client/api/testutil"
	applicationv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/application/v1"

	"github.com/kobsio/kobs/pkg/client/kubernetes"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetApplications(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newClusterClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		clusterClient := kubernetes.NewMockClient(ctrl)
		return clusterClient
	}

	t.Run("can handle error", func(t *testing.T) {
		cluster := "cluster1"
		clusterClient := newClusterClient(t)
		clusterClient.EXPECT().GetApplications(gomock.Any(), cluster, "").Return(nil, fmt.Errorf("unexpected error"))

		router := Router{chi.NewRouter(), Config{}, clusterClient, defaultTracer}
		router.Get("/applications", router.getApplications)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/applications?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		testutil.AssertEqualStatus(t, http.StatusInternalServerError, w)
		testutil.AssertJSONEq(t, `{"error":"unexpected error"}`, w)
	})

	t.Run("can list applications", func(t *testing.T) {
		cluster := "cluster1"
		clusterClient := newClusterClient(t)
		clusterClient.
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

		router := Router{chi.NewRouter(), Config{}, clusterClient, defaultTracer}
		router.Get("/applications", router.getApplications)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, fmt.Sprintf("/applications?cluster=%s", cluster), nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		testutil.AssertEqualStatus(t, http.StatusOK, w)
		testutil.AssertJSONEq(t, `
			[
				{
					"cluster": "cluster1",
					"namespace": "namespace1",
					"name": "application1",
					"teams": [ "team1" ],
					"topology": {}
				}
			]`,
			w)
	})
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
