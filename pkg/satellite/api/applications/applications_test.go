package applications

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetApplications(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClusterClient *cluster.MockClient)
	}{
		{
			name:               "get applications error",
			url:                "/applications",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get applications: could not get applications\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return(nil, fmt.Errorf("could not get applications"))
			},
		},
		{
			name:               "get applications success",
			url:                "/applications",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"application1\",\"teams\":[\"team1\"],\"topology\":{}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return([]applicationv1.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []string{"team1"}}}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetClusters", mock.Anything).Return([]cluster.Client{mockClusterClient})
			mockClustersClient.On("GetCluster", mock.Anything, "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", mock.Anything, "cluster2").Return(nil)

			tt.prepare(mockClusterClient)

			router := Router{chi.NewRouter(), Config{}, mockClustersClient}
			router.Get("/applications", router.getApplications)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			w := httptest.NewRecorder()

			router.getApplications(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
