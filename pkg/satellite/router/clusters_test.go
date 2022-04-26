package router

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetClusters(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "get clusters",
			url:                "/clusters",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[\"cluster1\"]\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)
			mockClusterClient.On("GetName").Return("cluster1")

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			// mockClustersClient.On("GetCluster", "").Return(nil)
			// mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetClusters").Return([]cluster.Client{mockClusterClient})

			router := Router{chi.NewRouter(), Config{}, mockClustersClient}
			router.Get("/clusters", router.getClusters)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			w := httptest.NewRecorder()

			router.getClusters(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}
