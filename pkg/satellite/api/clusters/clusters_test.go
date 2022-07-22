package clusters

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
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
			mockClustersClient.On("GetClusters", mock.Anything).Return([]cluster.Client{mockClusterClient})

			router := Router{chi.NewRouter(), Config{}, mockClustersClient}
			router.Get("/clusters", router.getClusters)

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			w := httptest.NewRecorder()

			router.getClusters(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetNamespaces(t *testing.T) {
	for _, tt := range []struct {
		name               string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClusterClient *cluster.MockClient)
	}{
		{
			name:               "get namespaces error",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get namespaces: could not get namespaces\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetNamespaces", mock.Anything).Return(nil, fmt.Errorf("could not get namespaces"))
			},
		},
		{
			name:               "get namespaces",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster1\":[\"default\",\"kube-system\"]}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetNamespaces", mock.Anything).Return([]string{"default", "kube-system"}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)
			mockClusterClient.On("GetName").Return("cluster1")

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetClusters", mock.Anything).Return([]cluster.Client{mockClusterClient})

			tt.prepare(mockClusterClient)

			router := Router{
				Mux:            chi.NewRouter(),
				config:         Config{},
				clustersClient: mockClustersClient,
			}
			router.Get("/namespaces", router.getNamespaces)

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/namespaces", nil)
			w := httptest.NewRecorder()

			router.getNamespaces(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetCRDs(t *testing.T) {
	mockClusterClient := &cluster.MockClient{}
	mockClusterClient.AssertExpectations(t)
	mockClusterClient.On("GetName").Return("cluster1")
	mockClusterClient.On("GetCRDs").Return(nil)

	mockClustersClient := &clusters.MockClient{}
	mockClustersClient.AssertExpectations(t)
	mockClustersClient.On("GetClusters", mock.Anything).Return([]cluster.Client{mockClusterClient})

	router := Router{
		Mux:            chi.NewRouter(),
		config:         Config{},
		clustersClient: mockClustersClient,
	}
	router.Get("/crds", router.getCRDs)

	req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/crds", nil)
	w := httptest.NewRecorder()

	router.getCRDs(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	require.Equal(t, "null\n", string(w.Body.Bytes()))
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
