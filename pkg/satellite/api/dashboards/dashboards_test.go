package dashboards

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetDashboards(t *testing.T) {
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
				mockClusterClient.On("GetDashboards", mock.Anything, "").Return([]dashboardv1.DashboardSpec{
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
			mockClustersClient.On("GetClusters", mock.Anything).Return([]cluster.Client{mockClusterClient})

			tt.prepare(mockClusterClient)

			router := Router{
				Mux:            chi.NewRouter(),
				config:         Config{},
				clustersClient: mockClustersClient,
			}
			router.Get("/dashboards", router.getDashboards)

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboards", nil)
			w := httptest.NewRecorder()

			router.getDashboards(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
