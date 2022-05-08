package router

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetUsers(t *testing.T) {
	for _, tt := range []struct {
		name               string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClusterClient *cluster.MockClient)
	}{
		{
			name:               "get users error",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get users: could not get users\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return(nil, fmt.Errorf("could not get users"))
			},
		},
		{
			name:               "get users",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"name1\",\"email\":\"user1@kobs.io\",\"permissions\":{\"plugins\":null,\"resources\":null}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return([]userv1.UserSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "name1", Email: "user1@kobs.io"}}, nil)
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

			router := Router{Mux: chi.NewRouter(), clustersClient: mockClustersClient, config: Config{}}
			router.Get("/users", router.getUsers)

			req, _ := http.NewRequest(http.MethodGet, "/users", nil)
			w := httptest.NewRecorder()

			router.getUsers(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetUser(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "invalid cluster name",
			url:                "/users",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
		},
		{
			name:               "get users error",
			url:                "/users?cluster=cluster1&namespace=namespace1&name=user2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get user: could not get user\"}\n",
		},
		{
			name:               "get users",
			url:                "/users?cluster=cluster1&namespace=namespace1&name=user1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"name1\",\"email\":\"user1@kobs.io\",\"permissions\":{\"plugins\":null,\"resources\":null}}\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)
			mockClusterClient.On("GetUser", mock.Anything, "namespace1", "user1").Return(&userv1.UserSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "name1", Email: "user1@kobs.io"}, nil)
			mockClusterClient.On("GetUser", mock.Anything, "namespace1", "user2").Return(nil, fmt.Errorf("could not get user"))

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "").Return(nil)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)

			router := Router{Mux: chi.NewRouter(), clustersClient: mockClustersClient, config: Config{}}
			router.Get("/user", router.getUser)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			w := httptest.NewRecorder()

			router.getUser(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}
