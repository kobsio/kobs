package clusters

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetClustersRoute(t *testing.T) {
	mockClusterClient1 := &cluster.MockClient{}
	mockClusterClient1.AssertExpectations(t)
	mockClusterClient1.On("GetName").Return("cluster1")

	mockClusterClient2 := &cluster.MockClient{}
	mockClusterClient2.AssertExpectations(t)
	mockClusterClient2.On("GetName").Return("cluster2")

	mockClustersClient := &MockClient{}
	mockClustersClient.AssertExpectations(t)
	mockClustersClient.On("GetClusters").Return([]cluster.Client{mockClusterClient1, mockClusterClient2})

	router := Router{chi.NewRouter(), mockClustersClient}
	router.Get("/", router.getClusters)

	req, _ := http.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()

	router.getClusters(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	require.Equal(t, "[\"cluster1\",\"cluster2\"]\n", string(w.Body.Bytes()))
}

func TestGetNamespacesRoute(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		errGetNamespaces   bool
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "invalid cluster name",
			url:                "/namespaces?cluster=cluster3",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
		},
		{
			name:               "could not get namespaces",
			url:                "/namespaces?cluster=cluster1&cluster=cluster2",
			errGetNamespaces:   true,
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get namespaces: could not get namespaces\"}\n",
		},
		{
			name:               "could not get namespaces",
			url:                "/namespaces?cluster=cluster1&cluster=cluster2",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[\"namespace1\",\"namespace2\",\"namespace3\",\"namespace4\",\"namespace5\"]\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient1 := &cluster.MockClient{}
			mockClusterClient1.AssertExpectations(t)
			mockClusterClient1.On("GetName").Return("cluster1")

			mockClusterClient2 := &cluster.MockClient{}
			mockClusterClient2.AssertExpectations(t)
			mockClusterClient2.On("GetName").Return("cluster2")

			mockClustersClient := &MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient1)
			mockClustersClient.On("GetCluster", "cluster2").Return(mockClusterClient2)
			mockClustersClient.On("GetCluster", "cluster3").Return(nil)

			if tt.errGetNamespaces {
				mockClusterClient1.On("GetNamespaces", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get namespaces"))
				mockClusterClient2.On("GetNamespaces", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get namespaces"))
			} else {
				mockClusterClient1.On("GetNamespaces", mock.Anything, mock.Anything).Return([]string{"namespace1", "namespace2", "namespace3"}, nil)
				mockClusterClient2.On("GetNamespaces", mock.Anything, mock.Anything).Return([]string{"namespace3", "namespace4", "namespace5"}, nil)
			}

			router := Router{chi.NewRouter(), mockClustersClient}
			router.Get("/namespaces", router.getNamespaces)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			w := httptest.NewRecorder()

			router.getNamespaces(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetCRDsRoute(t *testing.T) {
	mockClusterClient1 := &cluster.MockClient{}
	mockClusterClient1.AssertExpectations(t)
	mockClusterClient1.On("GetName").Return("cluster1")
	mockClusterClient1.On("GetCRDs").Return([]cluster.CRD{
		{Path: "monitoring.coreos.com/v1alpha1", Resource: "alertmanagerconfigs", Title: "AlertmanagerConfig", Description: "AlertmanagerConfig defines a namespaced AlertmanagerConfig to be aggregated across multiple namespaces configuring one Alertmanager cluster.", Scope: "Namespaced", Columns: []cluster.CRDColumn(nil)},
		{Path: "monitoring.coreos.com/v1", Resource: "alertmanagers", Title: "Alertmanager", Description: "Alertmanager describes an Alertmanager cluster.", Scope: "Namespaced", Columns: []cluster.CRDColumn{{Description: "The version of Alertmanager", JSONPath: ".spec.version", Name: "Version", Type: "string"}, {Description: "The desired replicas number of Alertmanagers", JSONPath: ".spec.replicas", Name: "Replicas", Type: "integer"}, {Description: "", JSONPath: ".metadata.creationTimestamp", Name: "Age", Type: "date"}}},
	})

	mockClusterClient2 := &cluster.MockClient{}
	mockClusterClient2.AssertExpectations(t)
	mockClusterClient2.On("GetName").Return("cluster2")
	mockClusterClient2.On("GetCRDs").Return([]cluster.CRD{
		{Path: "kobs.io/v1beta1", Resource: "applications", Title: "Application", Description: "Application is the Application CRD.", Scope: "Namespaced", Columns: []cluster.CRDColumn(nil)},
	})

	mockClustersClient := &MockClient{}
	mockClustersClient.AssertExpectations(t)
	mockClustersClient.On("GetClusters").Return([]cluster.Client{mockClusterClient1, mockClusterClient2})

	router := Router{chi.NewRouter(), mockClustersClient}
	router.Get("/crds", router.getCRDs)

	req, _ := http.NewRequest(http.MethodGet, "/crds", nil)
	w := httptest.NewRecorder()

	router.getCRDs(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	require.Equal(t, "[{\"path\":\"monitoring.coreos.com/v1alpha1\",\"resource\":\"alertmanagerconfigs\",\"title\":\"AlertmanagerConfig\",\"description\":\"AlertmanagerConfig defines a namespaced AlertmanagerConfig to be aggregated across multiple namespaces configuring one Alertmanager cluster.\",\"scope\":\"Namespaced\"},{\"path\":\"monitoring.coreos.com/v1\",\"resource\":\"alertmanagers\",\"title\":\"Alertmanager\",\"description\":\"Alertmanager describes an Alertmanager cluster.\",\"scope\":\"Namespaced\",\"columns\":[{\"description\":\"The version of Alertmanager\",\"jsonPath\":\".spec.version\",\"name\":\"Version\",\"type\":\"string\"},{\"description\":\"The desired replicas number of Alertmanagers\",\"jsonPath\":\".spec.replicas\",\"name\":\"Replicas\",\"type\":\"integer\"},{\"description\":\"\",\"jsonPath\":\".metadata.creationTimestamp\",\"name\":\"Age\",\"type\":\"date\"}]},{\"path\":\"kobs.io/v1beta1\",\"resource\":\"applications\",\"title\":\"Application\",\"description\":\"Application is the Application CRD.\",\"scope\":\"Namespaced\"}]\n", string(w.Body.Bytes()))
}

func TestNewRouter(t *testing.T) {
	mockClustersClient := &MockClient{}
	router := NewRouter(mockClustersClient)
	require.NotEmpty(t, router)
}
