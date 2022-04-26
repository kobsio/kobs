package router

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
			name:               "invalid cluster name",
			url:                "/applications?cluster=cluster2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
			prepare:            func(mockClusterClient *cluster.MockClient) {},
		},
		{
			name:               "namespaces nil and get applications error",
			url:                "/applications?cluster=cluster1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get applications: could not get applications\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return(nil, fmt.Errorf("could not get applications"))
			},
		},
		{
			name:               "namespaces nil",
			url:                "/applications?cluster=cluster1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"application1\",\"teams\":[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"team1\"}],\"topology\":{}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return([]applicationv1.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []applicationv1.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}}, nil)
			},
		},
		{
			name:               "get applications error",
			url:                "/applications?cluster=cluster1&namespace=namespace1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get applications: could not get applications\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "namespace1").Return(nil, fmt.Errorf("could not get applications"))
			},
		},
		{
			name:               "ok",
			url:                "/applications?cluster=cluster1&namespace=namespace1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"application1\",\"teams\":[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"team1\"}],\"topology\":{}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "namespace1").Return([]applicationv1.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []applicationv1.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}}, nil)
			},
		},
		{
			name:               "ok with no cluster",
			url:                "/applications?namespace=namespace1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"application1\",\"teams\":[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"team1\"}],\"topology\":{}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "namespace1").Return([]applicationv1.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []applicationv1.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetClusters").Return([]cluster.Client{mockClusterClient})
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", "cluster2").Return(nil)

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

func TestGetApplication(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "could not get cluster",
			url:                "/application",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
		},
		{
			name:               "could not get application",
			url:                "/application?cluster=cluster1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get application: could not get application\"}\n",
		},
		{
			name:               "return application",
			url:                "/application?cluster=cluster1&namespace=namespace1&name=application1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"application1\",\"topology\":{}}\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)
			mockClusterClient.On("GetApplication", mock.Anything, "namespace1", "application1").Return(&applicationv1.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application1"}, nil)
			mockClusterClient.On("GetApplication", mock.Anything, "", "").Return(nil, fmt.Errorf("could not get application"))

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "").Return(nil)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)

			router := Router{chi.NewRouter(), Config{}, mockClustersClient}
			router.Get("/application", router.getApplication)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			w := httptest.NewRecorder()

			router.getApplication(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}
