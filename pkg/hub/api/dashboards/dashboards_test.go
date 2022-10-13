package dashboards

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/hub/store"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetDashboardsFromReferences(t *testing.T) {
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
			name:               "get dashboard by id error",
			body:               []byte("[{\"satellite\":\"satellite1\",\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"name1\",\"title\":\"Title 1\"}]"),
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get dashboard: could not get dashboard\"}\n",
		},
		{
			name:               "get dashboards",
			body:               []byte("[{\"title\":\"Kubernetes Workloads\",\"inline\":{\"rows\":[{\"panels\":[{\"title\":\"Workloads\",\"plugin\":{\"name\":\"resources\",\"options\":[{\"namespaces\":[\"test-service\"],\"resources\":[\"pods\",\"deployments\"],\"selector\":\"app=test-service\"}]}}]}]}},{\"satellite\":\"satellite2\",\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"name1\",\"title\":\"Title 1\"}]"),
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"title\":\"Kubernetes Workloads\",\"rows\":[{\"panels\":[{\"title\":\"Workloads\",\"plugin\":{\"type\":\"\",\"name\":\"resources\",\"options\":[{\"namespaces\":[\"test-service\"],\"resources\":[\"pods\",\"deployments\"],\"selector\":\"app=test-service\"}]}}]}]},{\"title\":\"Title 1\",\"rows\":null}]\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			mockStoreClient.On("GetDashboardByID", mock.Anything, "/satellite/satellite2/cluster/cluster1/namespace/namespace1/name/name1").Return(&dashboardv1.DashboardSpec{}, nil)
			mockStoreClient.On("GetDashboardByID", mock.Anything, "/satellite/satellite1/cluster/cluster1/namespace/namespace1/name/name1").Return(nil, fmt.Errorf("could not get dashboard"))

			router := Router{chi.NewRouter(), mockStoreClient}
			router.Get("/dashboards", router.getDashboardsFromReferences)

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/dashboards", bytes.NewBuffer(tt.body))
			w := httptest.NewRecorder()

			router.getDashboardsFromReferences(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetDashboard(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "get dashboard by id error",
			url:                "/dashboard?id=/satellite/satellite1/cluster/cluster1/namespace/namespace1/name/name1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get dashboard: could not get dashboard\"}\n",
		},
		{
			name:               "get dashboards",
			url:                "/dashboard?id=/satellite/satellite2/cluster/cluster1/namespace/namespace1/name/name1&key1=value1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"placeholders\":[{\"name\":\"key1\"}],\"variables\":[{\"name\":\"key1\",\"label\":\"key1\",\"hide\":true,\"plugin\":{\"type\":\"app\",\"name\":\"placeholder\",\"options\":{\"type\":\"string\",\"value\":\"value1\"}}}],\"rows\":null}\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			mockStoreClient.On("GetDashboardByID", mock.Anything, "/satellite/satellite2/cluster/cluster1/namespace/namespace1/name/name1").Return(&dashboardv1.DashboardSpec{Placeholders: []dashboardv1.Placeholder{{Name: "key1"}}}, nil)
			mockStoreClient.On("GetDashboardByID", mock.Anything, "/satellite/satellite1/cluster/cluster1/namespace/namespace1/name/name1").Return(nil, fmt.Errorf("could not get dashboard"))

			router := Router{chi.NewRouter(), mockStoreClient}
			router.Get("/dashboard", router.getDashboard)

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			w := httptest.NewRecorder()

			router.getDashboard(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
