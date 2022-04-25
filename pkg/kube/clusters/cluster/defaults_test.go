package cluster

import (
	"testing"

	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"

	"github.com/stretchr/testify/require"
)

func TestSetApplicationDefaults(t *testing.T) {
	require.Equal(
		t,
		applicationv1.ApplicationSpec{
			Cluster:   "cluster1",
			Namespace: "namespace1",
			Name:      "application1",
			Teams: []applicationv1.TeamReference{
				{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"},
				{Cluster: "cluster2", Namespace: "namespace1", Name: "team2"},
				{Cluster: "cluster2", Namespace: "namespace2", Name: "team3"},
			},
			Topology: applicationv1.Topology{
				Type: "application",
				Dependencies: []applicationv1.Dependency{
					{Cluster: "cluster1", Namespace: "namespace1", Name: "application2"},
					{Cluster: "cluster2", Namespace: "namespace1", Name: "application3"},
					{Cluster: "cluster2", Namespace: "namespace2", Name: "application4", Dashboards: []dashboardv1.Reference{
						{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard1"},
						{Cluster: "cluster2", Namespace: "namespace1", Name: "dashboard2"},
						{Cluster: "cluster2", Namespace: "namespace2", Name: "dashboard3"},
					}},
				},
			},
			Dashboards: []dashboardv1.Reference{
				{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard1"},
				{Cluster: "cluster2", Namespace: "namespace1", Name: "dashboard2"},
				{Cluster: "cluster2", Namespace: "namespace2", Name: "dashboard3"},
			},
		},
		setApplicationDefaults(
			applicationv1.ApplicationSpec{
				Cluster:   "",
				Namespace: "",
				Name:      "",
				Teams: []applicationv1.TeamReference{
					{Cluster: "", Namespace: "", Name: "team1"},
					{Cluster: "cluster2", Namespace: "", Name: "team2"},
					{Cluster: "cluster2", Namespace: "namespace2", Name: "team3"},
				},
				Topology: applicationv1.Topology{
					Dependencies: []applicationv1.Dependency{
						{Cluster: "", Namespace: "", Name: "application2"},
						{Cluster: "cluster2", Namespace: "", Name: "application3"},
						{Cluster: "cluster2", Namespace: "namespace2", Name: "application4", Dashboards: []dashboardv1.Reference{
							{Cluster: "", Namespace: "", Name: "dashboard1"},
							{Cluster: "cluster2", Namespace: "", Name: "dashboard2"},
							{Cluster: "cluster2", Namespace: "namespace2", Name: "dashboard3"},
						}},
					},
				},
				Dashboards: []dashboardv1.Reference{
					{Cluster: "", Namespace: "", Name: "dashboard1"},
					{Cluster: "cluster2", Namespace: "", Name: "dashboard2"},
					{Cluster: "cluster2", Namespace: "namespace2", Name: "dashboard3"},
				},
			},
			"cluster1",
			"namespace1",
			"application1",
		),
	)
}

func TestSetTeamDefaults(t *testing.T) {
	require.Equal(
		t,
		teamv1.TeamSpec{
			Cluster:   "cluster1",
			Namespace: "namespace1",
			Name:      "team1",
			Dashboards: []dashboardv1.Reference{
				{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard1"},
				{Cluster: "cluster2", Namespace: "namespace1", Name: "dashboard2"},
				{Cluster: "cluster2", Namespace: "namespace2", Name: "dashboard3"},
			},
		},
		setTeamDefaults(
			teamv1.TeamSpec{
				Cluster:   "",
				Namespace: "",
				Name:      "",
				Dashboards: []dashboardv1.Reference{
					{Cluster: "", Namespace: "", Name: "dashboard1"},
					{Cluster: "cluster2", Namespace: "", Name: "dashboard2"},
					{Cluster: "cluster2", Namespace: "namespace2", Name: "dashboard3"},
				},
			},
			"cluster1",
			"namespace1",
			"team1",
		),
	)
}

func TestSetDashboardDefaults(t *testing.T) {
	require.Equal(
		t,
		dashboardv1.DashboardSpec{
			Cluster:   "cluster1",
			Namespace: "namespace1",
			Name:      "dashboard1",
			Title:     "dashboard1",
		},
		setDashboardDefaults(
			dashboardv1.DashboardSpec{
				Cluster:   "",
				Namespace: "",
				Name:      "",
			},
			"cluster1",
			"namespace1",
			"dashboard1",
		),
	)
}

func TestSetUserDefaults(t *testing.T) {
	require.Equal(
		t,
		userv1.UserSpec{
			Cluster:   "cluster1",
			Namespace: "namespace1",
			Name:      "user1",
			Teams: []userv1.TeamReference{
				{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"},
				{Cluster: "cluster2", Namespace: "namespace1", Name: "team2"},
				{Cluster: "cluster2", Namespace: "namespace2", Name: "team3"},
			},
		},
		setUserDefaults(
			userv1.UserSpec{
				Cluster:   "",
				Namespace: "",
				Name:      "",
				Teams: []userv1.TeamReference{
					{Cluster: "", Namespace: "", Name: "team1"},
					{Cluster: "cluster2", Namespace: "", Name: "team2"},
					{Cluster: "cluster2", Namespace: "namespace2", Name: "team3"},
				},
			},
			"cluster1",
			"namespace1",
			"user1",
		),
	)
}
