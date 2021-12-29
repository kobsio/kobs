package users

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	user "github.com/kobsio/kobs/pkg/api/apis/user/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestIsMember(t *testing.T) {
	require.Equal(t, true, isMember([]user.TeamReference{{Cluster: "cluster2", Namespace: "namespace2", Name: "team1"}}, "cluster1", "namespace1", "cluster2", "namespace2", "team1"))
	require.Equal(t, false, isMember([]user.TeamReference{{Cluster: "cluster2", Namespace: "namespace2", Name: "team1"}}, "cluster1", "namespace1", "cluster2", "namespace2", "team2"))
}

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
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"name1\",\"id\":\"id1\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"permissions\":{\"plugins\":null,\"resources\":null}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return([]user.UserSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "name1", ID: "id1"}}, nil)
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
			expectedBody:       "{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"name1\",\"id\":\"id1\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"permissions\":{\"plugins\":null,\"resources\":null}}\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)
			mockClusterClient.On("GetUser", mock.Anything, "namespace1", "user1").Return(&user.UserSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "name1", ID: "id1"}, nil)
			mockClusterClient.On("GetUser", mock.Anything, "namespace1", "user2").Return(nil, fmt.Errorf("could not get user"))

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "").Return(nil)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)

			router := Router{chi.NewRouter(), mockClustersClient, Config{}}
			router.Get("/user", router.getUser)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			w := httptest.NewRecorder()

			router.getUser(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetTeams(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		body               []byte
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "decode json error",
			url:                "/teams",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not decode request body: EOF\"}\n",
		},
		{
			name:               "invalid cluster name",
			url:                "/teams",
			body:               []byte("{\"teams\":[{\"name\":\"team1\"}]}"),
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
		},
		{
			name:               "get team error",
			url:                "/teams?cluster=cluster1&namespace=namespace1",
			body:               []byte("{\"teams\":[{\"name\":\"team2\"}]}"),
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get team: could not get team\"}\n",
		},
		{
			name:               "get teams via defaults",
			url:                "/teams?cluster=cluster1&namespace=namespace1",
			body:               []byte("{\"teams\":[{\"name\":\"team1\"}]}"),
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"id\":\"\",\"permissions\":{\"plugins\":null,\"resources\":null}}]\n",
		},
		{
			name:               "get teams",
			url:                "/teams",
			body:               []byte("{\"teams\":[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"team1\"}]}"),
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"id\":\"\",\"permissions\":{\"plugins\":null,\"resources\":null}}]\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)
			mockClusterClient.On("GetTeam", mock.Anything, "namespace1", "team1").Return(&team.TeamSpec{}, nil)
			mockClusterClient.On("GetTeam", mock.Anything, "namespace1", "team2").Return(nil, fmt.Errorf("could not get team"))

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "").Return(nil)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)

			router := Router{chi.NewRouter(), mockClustersClient, Config{}}
			router.Get("/teams", router.getTeams)

			req, _ := http.NewRequest(http.MethodPost, tt.url, bytes.NewBuffer(tt.body))
			w := httptest.NewRecorder()

			router.getTeams(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetTeam(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClusterClient *cluster.MockClient)
	}{
		{
			name:               "get users error",
			url:                "/team",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get users: could not get users\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return(nil, fmt.Errorf("could not get users"))
			},
		},
		{
			name:               "get users",
			url:                "/team?cluster=cluster2&namespace=namespace2&name=team1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"name1\",\"id\":\"\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":[{\"cluster\":\"cluster2\",\"namespace\":\"namespace2\",\"name\":\"team1\"}],\"permissions\":{\"plugins\":null,\"resources\":null}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return([]user.UserSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "name1", Teams: []user.TeamReference{{Cluster: "cluster2", Namespace: "namespace2", Name: "team1"}}}}, nil)
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
			router.Get("/team", router.getTeam)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			w := httptest.NewRecorder()

			router.getTeam(w, req)

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
			Name:        "users",
			DisplayName: "Users",
			Description: "Define the members of your Teams.",
			Home:        true,
			Type:        "users",
		},
	}, plugins)
}
