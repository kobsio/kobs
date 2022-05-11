package clusters

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/kobsio/kobs/pkg/hub/store/shared"

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
		prepare            func(t *testing.T, mockStoreClient *store.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "get clusters fails",
			url:                "/clusters",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get clusters: could not get clusters\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return(nil, fmt.Errorf("could not get clusters"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getClusters(w, req)
			},
		},
		{
			name:               "get clusters",
			url:                "/clusters",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"satellite1\":[{\"id\":\"\",\"cluster\":\"dev-de1\",\"satellite\":\"satellite1\",\"updatedAt\":0},{\"id\":\"\",\"cluster\":\"dev-us1\",\"satellite\":\"satellite1\",\"updatedAt\":0}],\"satellite2\":[{\"id\":\"\",\"cluster\":\"stage-de1\",\"satellite\":\"satellite2\",\"updatedAt\":0}]}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return([]shared.Cluster{
					{Cluster: "dev-de1", Satellite: "satellite1"},
					{Cluster: "dev-us1", Satellite: "satellite1"},
					{Cluster: "stage-de1", Satellite: "satellite2"},
				}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getClusters(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient}

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("name", strings.Split(tt.url, "/")[1])
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestGetNamespaces(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(t *testing.T, mockStoreClient *store.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "get clusters fails",
			url:                "/namespaces",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get namespaces: could not get namespaces\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetNamespacesByClusterIDs", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get namespaces"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getNamespaces(w, req)
			},
		},
		{
			name:               "get namespaces",
			url:                "/namespaces",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"dev-de1 (satellite1)\":[{\"id\":\"\",\"namespace\":\"default\",\"cluster\":\"dev-de1\",\"satellite\":\"satellite1\",\"clusterID\":\"\",\"updatedAt\":0},{\"id\":\"\",\"namespace\":\"kube-system\",\"cluster\":\"dev-de1\",\"satellite\":\"satellite1\",\"clusterID\":\"\",\"updatedAt\":0}],\"stage-de1 (satellite2)\":[{\"id\":\"\",\"namespace\":\"default\",\"cluster\":\"stage-de1\",\"satellite\":\"satellite2\",\"clusterID\":\"\",\"updatedAt\":0}]}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetNamespacesByClusterIDs", mock.Anything, mock.Anything).Return([]shared.Namespace{
					{Namespace: "default", Cluster: "dev-de1", Satellite: "satellite1"},
					{Namespace: "kube-system", Cluster: "dev-de1", Satellite: "satellite1"},
					{Namespace: "default", Cluster: "stage-de1", Satellite: "satellite2"},
				}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getNamespaces(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient}

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("name", strings.Split(tt.url, "/")[1])
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestMount(t *testing.T) {
	router := Mount(nil)
	require.NotNil(t, router)
}
