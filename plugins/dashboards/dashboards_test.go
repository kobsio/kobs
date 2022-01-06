package dashboards

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	dashboard "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetAllDashboards(t *testing.T) {
	for _, tt := range []struct {
		name               string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClusterClient *cluster.MockClient)
	}{
		{
			name:               "get dashboards error",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get dashboards: could not get dashboards\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetDashboards", mock.Anything, "").Return(nil, fmt.Errorf("could not get dashboards"))
			},
		},
		{
			name:               "get dashboards",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"dashboard1\",\"rows\":null},{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"dashboard2\",\"rows\":null}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetDashboards", mock.Anything, "").Return([]dashboard.DashboardSpec{
					{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard1"},
					{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard2"},
				}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetClusters").Return([]cluster.Client{mockClusterClient})

			tt.prepare(mockClusterClient)

			router := Router{chi.NewRouter(), mockClustersClient, Config{}}
			router.Get("/dashboards", router.getAllDashboards)

			req, _ := http.NewRequest(http.MethodGet, "/dashboards", nil)
			w := httptest.NewRecorder()

			router.getAllDashboards(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetDashboards(t *testing.T) {
	for _, tt := range []struct {
		name               string
		body               []byte
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "decode json error",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not decode request body: EOF\"}\n",
		},
		{
			name:               "invalid cluster name",
			body:               []byte("{\"references\":[{\"title\":\"Kubernetes Workloads\",\"inline\":{\"rows\":[{\"panels\":[{\"title\":\"Workloads\",\"plugin\":{\"name\":\"resources\",\"options\":[{\"namespaces\":[\"test-service\"],\"resources\":[\"pods\",\"deployments\"],\"selector\":\"app=test-service\"}]}}]}]}},{\"cluster\":\"cluster2\",\"namespace\":\"kobs\",\"name\":\"resource-usage\",\"title\":\"Resource Usage\",\"placeholders\":{\"namespace\":\"test-service\"}}]}"),
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
		},
		{
			name:               "get dashboard error",
			body:               []byte("{\"references\":[{\"title\":\"Kubernetes Workloads\",\"inline\":{\"rows\":[{\"panels\":[{\"title\":\"Workloads\",\"plugin\":{\"name\":\"resources\",\"options\":[{\"namespaces\":[\"test-service\"],\"resources\":[\"pods\",\"deployments\"],\"selector\":\"app=test-service\"}]}}]}]}},{\"cluster\":\"cluster1\",\"namespace\":\"kobs\",\"name\":\"resource-usage-wrong\",\"title\":\"Resource Usage\",\"placeholders\":{\"namespace\":\"test-service\"}}]}"),
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get dashboard: could not get dashboard\"}\n",
		},
		{
			name:               "get dashboards",
			body:               []byte("{\"cluster\":\"\",\"namespace\":\"\",\"references\":[{\"title\":\"Kubernetes Workloads\",\"inline\":{\"rows\":[{\"panels\":[{\"title\":\"Workloads\",\"plugin\":{\"name\":\"resources\",\"options\":[{\"namespaces\":[\"test-service\"],\"resources\":[\"pods\",\"deployments\"],\"selector\":\"app=test-service\"}]}}]}]}},{\"cluster\":\"cluster1\",\"namespace\":\"kobs\",\"name\":\"resource-usage\",\"title\":\"Resource Usage\",\"placeholders\":{\"namespace\":\"test-service\"}}]}"),
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"-\",\"namespace\":\"-\",\"name\":\"-\",\"title\":\"Kubernetes Workloads\",\"rows\":[{\"panels\":[{\"title\":\"Workloads\",\"plugin\":{\"name\":\"resources\",\"options\":[{\"namespaces\":[\"test-service\"],\"resources\":[\"pods\",\"deployments\"],\"selector\":\"app=test-service\"}]}}]}]},{\"title\":\"Resource Usage\",\"variables\":[{\"name\":\"namespace\",\"label\":\"namespace\",\"hide\":true,\"plugin\":{\"name\":\"core\",\"options\":{\"type\":\"static\",\"items\":[\"test-service\"]}}}],\"rows\":null}]\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)
			mockClusterClient.On("GetDashboard", mock.Anything, "kobs", "resource-usage").Return(&dashboard.DashboardSpec{}, nil)
			mockClusterClient.On("GetDashboard", mock.Anything, "kobs", "resource-usage-wrong").Return(nil, fmt.Errorf("could not get dashboard"))

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", "cluster2").Return(nil)

			router := Router{chi.NewRouter(), mockClustersClient, Config{}}
			router.Get("/dashboards", router.getDashboards)

			req, _ := http.NewRequest(http.MethodPost, "/dashboards", bytes.NewBuffer(tt.body))
			w := httptest.NewRecorder()

			router.getDashboards(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetDashboard(t *testing.T) {
	for _, tt := range []struct {
		name               string
		body               []byte
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClusterClient *cluster.MockClient)
	}{
		{
			name:               "decode json error",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not decode request body: EOF\"}\n",
			prepare:            func(mockClusterClient *cluster.MockClient) {},
		},
		{
			name:               "invalid cluster name",
			body:               []byte("{\"cluster\":\"cluster2\",\"name\":\"dashboard1\",\"namespace\":\"namespace1\",\"placeholders\":{\"namespace\":\"kobs\"}}"),
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
			prepare:            func(mockClusterClient *cluster.MockClient) {},
		},
		{
			name:               "get dashboard error",
			body:               []byte("{\"cluster\":\"cluster1\",\"name\":\"dashboard2\",\"namespace\":\"namespace1\",\"placeholders\":{\"namespace\":\"kobs\"}}"),
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get dashboard: could not get dashboard\"}\n",
			prepare:            func(mockClusterClient *cluster.MockClient) {},
		},
		{
			name:               "get dashboard without placeholders",
			body:               []byte("{\"cluster\":\"cluster1\",\"name\":\"dashboard1\",\"namespace\":\"namespace1\"}"),
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"rows\":null}\n",
			prepare:            func(mockClusterClient *cluster.MockClient) {},
		},
		{
			name:               "get dashboard with placeholders",
			body:               []byte("{\"cluster\":\"cluster1\",\"name\":\"dashboard1\",\"namespace\":\"namespace1\",\"placeholders\":{\"namespace\":\"kobs\"}}"),
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"variables\":[{\"name\":\"namespace\",\"label\":\"namespace\",\"hide\":true,\"plugin\":{\"name\":\"core\",\"options\":{\"type\":\"static\",\"items\":[\"kobs\"]}}}],\"rows\":null}\n",
			prepare:            func(mockClusterClient *cluster.MockClient) {},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)
			mockClusterClient.On("GetDashboard", mock.Anything, "namespace1", "dashboard1").Return(&dashboard.DashboardSpec{}, nil)
			mockClusterClient.On("GetDashboard", mock.Anything, "namespace1", "dashboard2").Return(nil, fmt.Errorf("could not get dashboard"))

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", "cluster2").Return(nil)

			tt.prepare(mockClusterClient)

			router := Router{chi.NewRouter(), mockClustersClient, Config{}}
			router.Get("/dashboard", router.getDashboard)

			req, _ := http.NewRequest(http.MethodPost, "/dashboard", bytes.NewBuffer(tt.body))
			w := httptest.NewRecorder()

			router.getDashboard(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestRegister(t *testing.T) {
	plugins := &plugin.Plugins{}
	router := Register(nil, plugins, Config{})

	require.NotEmpty(t, router)
	require.Equal(t, &plugin.Plugins{
		plugin.Plugin{
			Name:        "dashboards",
			DisplayName: "Dashboards",
			Description: "Create dashboards for your Teams and Applications.",
			Type:        "dashboards",
		},
	}, plugins)
}
