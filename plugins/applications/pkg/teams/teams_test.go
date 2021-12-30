package teams

import (
	"context"
	"fmt"
	"testing"

	application "github.com/kobsio/kobs/pkg/api/apis/application/v1beta1"
	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGet(t *testing.T) {
	mockClusterClient := &cluster.MockClient{}
	mockClusterClient.AssertExpectations(t)
	mockClusterClient.On("GetName").Return("cluster")

	mockClustersClient := &clusters.MockClient{}
	mockClustersClient.AssertExpectations(t)
	mockClustersClient.On("GetClusters").Return([]cluster.Client{mockClusterClient})

	t.Run("get teams and get applications error", func(t *testing.T) {
		mockClusterClient.On("GetTeams", mock.Anything, "").Return(nil, fmt.Errorf("could not get teams")).Once()
		mockClusterClient.On("GetApplications", mock.Anything, "").Return(nil, fmt.Errorf("could not get teams")).Once()
		teams := Get(context.Background(), mockClustersClient)
		require.Empty(t, teams)
	})

	t.Run("return teams", func(t *testing.T) {
		mockClusterClient.On("GetTeams", mock.Anything, "").Return([]team.TeamSpec{
			{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"},
		}, nil).Once()
		mockClusterClient.On("GetApplications", mock.Anything, "").Return([]application.ApplicationSpec{
			{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []application.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}},
		}, nil).Once()

		teams := Get(context.Background(), mockClustersClient)
		require.Equal(t, []Team{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1", Applications: []application.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []application.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}}}}, teams)
	})
}

func TestGetApplications(t *testing.T) {
	applicationsList := []application.ApplicationSpec{
		{Cluster: "cluster1", Namespace: "namespace1", Name: "application1"},
		{Cluster: "cluster1", Namespace: "namespace1", Name: "application2"},
		{Cluster: "cluster1", Namespace: "namespace1", Name: "application3"},
	}

	teamsList := []Team{
		{Cluster: "cluster1", Namespace: "namespace1", Name: "team1", Applications: applicationsList},
		{Cluster: "cluster1", Namespace: "namespace1", Name: "team2", Applications: applicationsList},
	}

	require.Equal(t, applicationsList, GetApplications(teamsList, "cluster1", "namespace1", "team1"))
	require.Equal(t, []application.ApplicationSpec(nil), GetApplications(teamsList, "cluster1", "namespace1", "team3"))
}

func TestDoesApplicationContainsTeam(t *testing.T) {
	require.Equal(t, true, doesApplicationContainsTeam(application.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []application.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}, "cluster1", "namespace1", "team1"))
	require.Equal(t, true, doesApplicationContainsTeam(application.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []application.TeamReference{{Cluster: "", Namespace: "namespace1", Name: "team1"}}}, "cluster1", "namespace1", "team1"))
	require.Equal(t, true, doesApplicationContainsTeam(application.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []application.TeamReference{{Cluster: "", Namespace: "", Name: "team1"}}}, "cluster1", "namespace1", "team1"))
	require.Equal(t, false, doesApplicationContainsTeam(application.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []application.TeamReference{{Cluster: "", Namespace: "", Name: "team1"}}}, "cluster1", "namespace1", "team2"))
}
