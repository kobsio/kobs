package teams

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetTeams(t *testing.T) {
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
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"name1\",\"group\":\"team1@kobs.io\",\"permissions\":{\"plugins\":null,\"resources\":null}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "name1", Group: "team1@kobs.io"}}, nil)
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
			router.Get("/teams", router.getTeams)

			req, _ := http.NewRequest(http.MethodGet, "/teams", nil)
			w := httptest.NewRecorder()

			router.getTeams(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}
