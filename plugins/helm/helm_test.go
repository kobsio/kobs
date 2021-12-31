package helm

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetReleases(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "invalid cluster name",
			url:                "/releases?cluster=cluster2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", "cluster2").Return(nil)

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
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", "cluster2").Return(nil)

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
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", "cluster2").Return(nil)

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
