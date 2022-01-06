package helm

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/helm/pkg/client"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetReleases(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockHelmClient *client.MockClient)
	}{
		{
			name:               "invalid cluster name",
			url:                "/releases?cluster=cluster2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
			prepare:            func(mockHelmClient *client.MockClient) {},
		},
		{
			name:               "namespaces nil: could not list helm releases",
			url:                "/releases?cluster=cluster1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not list Helm releases: could not list helm releases\"}\n",
			prepare: func(mockHelmClient *client.MockClient) {
				mockHelmClient.On("List", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not list helm releases"))
			},
		},
		{
			name:               "namespaces: could not list helm releases",
			url:                "/releases?cluster=cluster1&namespace=namespace1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not list Helm releases: could not list helm releases\"}\n",
			prepare: func(mockHelmClient *client.MockClient) {
				mockHelmClient.On("List", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not list helm releases"))
			},
		},
		{
			name:               "namespaces nil: return releases",
			url:                "/releases?cluster=cluster1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"name\":\"kobs\",\"version\":2,\"namespace\":\"kobs\"}]\n",
			prepare: func(mockHelmClient *client.MockClient) {
				mockHelmClient.On("List", mock.Anything, mock.Anything).Return([]*client.Release{{Name: "kobs", Namespace: "kobs", Version: 2, Cluster: "cluster1"}}, nil)
			},
		},
		{
			name:               "namespaces: return releases",
			url:                "/releases?cluster=cluster1&namespace=namespace1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"name\":\"kobs\",\"version\":2,\"namespace\":\"kobs\"}]\n",
			prepare: func(mockHelmClient *client.MockClient) {
				mockHelmClient.On("List", mock.Anything, mock.Anything).Return([]*client.Release{{Name: "kobs", Namespace: "kobs", Version: 2, Cluster: "cluster1"}}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", "cluster2").Return(nil)

			mockHelmClient := &client.MockClient{}
			mockHelmClient.AssertExpectations(t)
			tt.prepare(mockHelmClient)

			testNewHelmClient := func(clusterClient cluster.Client) client.Client {
				return mockHelmClient
			}

			newHelmClient = testNewHelmClient

			router := Router{chi.NewRouter(), mockClustersClient, Config{}}
			router.Get("/releases", router.getReleases)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)

			w := httptest.NewRecorder()
			router.getReleases(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetRelease(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "invalid version",
			url:                "/release?cluster=cluster2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse version parameter: strconv.Atoi: parsing \\\"\\\": invalid syntax\"}\n",
		},
		{
			name:               "invalid cluster name",
			url:                "/release?cluster=cluster2&version=1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
		},
		{
			name:               "could not get release",
			url:                "/release?cluster=cluster1&namespace=namespace2&version=1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get Helm release: could not get helm release\"}\n",
		},
		{
			name:               "return release",
			url:                "/release?cluster=cluster1&namespace=namespace1&version=1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"cluster1\",\"name\":\"kobs\",\"version\":1,\"namespace\":\"kobs\"}\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", "cluster2").Return(nil)

			mockHelmClient := &client.MockClient{}
			mockHelmClient.AssertExpectations(t)
			mockHelmClient.On("Get", mock.Anything, "namespace1", mock.Anything, mock.Anything).Return(&client.Release{Name: "kobs", Namespace: "kobs", Version: 1, Cluster: "cluster1"}, nil)
			mockHelmClient.On("Get", mock.Anything, "namespace2", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get helm release"))

			testNewHelmClient := func(clusterClient cluster.Client) client.Client {
				return mockHelmClient
			}

			newHelmClient = testNewHelmClient

			router := Router{chi.NewRouter(), mockClustersClient, Config{}}
			router.Get("/release", router.getRelease)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)

			w := httptest.NewRecorder()
			router.getRelease(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetReleaseHistory(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "invalid cluster name",
			url:                "/release/history?cluster=cluster2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
		},
		{
			name:               "could not get release",
			url:                "/release?cluster=cluster1&namespace=namespace2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get Helm release: could not get helm release history\"}\n",
		},
		{
			name:               "return release",
			url:                "/release?cluster=cluster1&namespace=namespace1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"name\":\"kobs\",\"version\":1,\"namespace\":\"kobs\"},{\"cluster\":\"cluster1\",\"name\":\"kobs\",\"version\":2,\"namespace\":\"kobs\"}]\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", "cluster2").Return(nil)

			mockHelmClient := &client.MockClient{}
			mockHelmClient.AssertExpectations(t)
			mockHelmClient.On("History", mock.Anything, "namespace1", mock.Anything).Return([]*client.Release{{Name: "kobs", Namespace: "kobs", Version: 1, Cluster: "cluster1"}, {Name: "kobs", Namespace: "kobs", Version: 2, Cluster: "cluster1"}}, nil)
			mockHelmClient.On("History", mock.Anything, "namespace2", mock.Anything).Return(nil, fmt.Errorf("could not get helm release history"))

			testNewHelmClient := func(clusterClient cluster.Client) client.Client {
				return mockHelmClient
			}

			newHelmClient = testNewHelmClient

			router := Router{chi.NewRouter(), mockClustersClient, Config{}}
			router.Get("/release/history", router.getReleaseHistory)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)

			w := httptest.NewRecorder()
			router.getReleaseHistory(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestRegister(t *testing.T) {
	expectedPlugins := &plugin.Plugins{
		plugin.Plugin{
			Name:        "helm",
			DisplayName: "Helm",
			Description: "The package manager for Kubernetes.",
			Type:        "helm",
		},
	}

	plugins := &plugin.Plugins{}
	router := Register(nil, plugins, Config{})
	require.NotEmpty(t, router)
	require.Equal(t, expectedPlugins, plugins)
}
