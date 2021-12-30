package teams

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
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
			name:               "get teams error",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get teams: could not get teams\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetTeams", mock.Anything, "").Return(nil, fmt.Errorf("could not get teams"))
			},
		},
		{
			name:               "get teams",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"name1\",\"id\":\"id1\",\"permissions\":{\"plugins\":null,\"resources\":null}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]team.TeamSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "name1", ID: "id1"}}, nil)
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
			router.Get("/teams", router.getTeams)

			req, _ := http.NewRequest(http.MethodGet, "/teams", nil)
			w := httptest.NewRecorder()

			router.getTeams(w, req)

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
			url:                "/team",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
		},
		{
			name:               "get team error",
			url:                "/team?cluster=cluster1&namespace=namespace1&name=team2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get team: could not get team\"}\n",
		},
		{
			name:               "get team",
			url:                "/team?cluster=cluster1&namespace=namespace1&name=team1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"name1\",\"id\":\"id1\",\"permissions\":{\"plugins\":null,\"resources\":null}}\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)
			mockClusterClient.On("GetTeam", mock.Anything, "namespace1", "team1").Return(&team.TeamSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "name1", ID: "id1"}, nil)
			mockClusterClient.On("GetTeam", mock.Anything, "namespace1", "team2").Return(nil, fmt.Errorf("could not get team"))

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "").Return(nil)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)

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
			Name:        "teams",
			DisplayName: "Teams",
			Description: "Define an ownership for your Kubernetes resources.",
			Home:        true,
			Type:        "teams",
		},
	}, plugins)
}
