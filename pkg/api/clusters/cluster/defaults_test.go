package cluster

import (
	"testing"

	application "github.com/kobsio/kobs/pkg/api/apis/application/v1beta1"
	dashboard "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"
	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	user "github.com/kobsio/kobs/pkg/api/apis/user/v1beta1"

	"github.com/stretchr/testify/require"
)

func TestSetApplicationDefaults(t *testing.T) {
	require.Equal(
		t,
		application.ApplicationSpec{
			Cluster:   "cluster1",
			Namespace: "namespace1",
			Name:      "application1",
			Teams: []application.TeamReference{
				{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"},
				{Cluster: "cluster2", Namespace: "namespace1", Name: "team2"},
				{Cluster: "cluster2", Namespace: "namespace2", Name: "team3"},
			},
			Topology: application.Topology{
				Type: "application",
				Dependencies: []application.Dependency{
					{Cluster: "cluster1", Namespace: "namespace1", Name: "application2"},
					{Cluster: "cluster2", Namespace: "namespace1", Name: "application3"},
					{Cluster: "cluster2", Namespace: "namespace2", Name: "application4", Dashboards: []dashboard.Reference{
						{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard1"},
						{Cluster: "cluster2", Namespace: "namespace1", Name: "dashboard2"},
						{Cluster: "cluster2", Namespace: "namespace2", Name: "dashboard3"},
					}},
				},
			},
			Dashboards: []dashboard.Reference{
				{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard1"},
				{Cluster: "cluster2", Namespace: "namespace1", Name: "dashboard2"},
				{Cluster: "cluster2", Namespace: "namespace2", Name: "dashboard3"},
			},
		},
		setApplicationDefaults(
			application.ApplicationSpec{
				Cluster:   "",
				Namespace: "",
				Name:      "",
				Teams: []application.TeamReference{
					{Cluster: "", Namespace: "", Name: "team1"},
					{Cluster: "cluster2", Namespace: "", Name: "team2"},
					{Cluster: "cluster2", Namespace: "namespace2", Name: "team3"},
				},
				Topology: application.Topology{
					Dependencies: []application.Dependency{
						{Cluster: "", Namespace: "", Name: "application2"},
						{Cluster: "cluster2", Namespace: "", Name: "application3"},
						{Cluster: "cluster2", Namespace: "namespace2", Name: "application4", Dashboards: []dashboard.Reference{
							{Cluster: "", Namespace: "", Name: "dashboard1"},
							{Cluster: "cluster2", Namespace: "", Name: "dashboard2"},
							{Cluster: "cluster2", Namespace: "namespace2", Name: "dashboard3"},
						}},
					},
				},
				Dashboards: []dashboard.Reference{
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
		team.TeamSpec{
			Cluster:   "cluster1",
			Namespace: "namespace1",
			Name:      "team1",
			Dashboards: []dashboard.Reference{
				{Cluster: "cluster1", Namespace: "namespace1", Name: "dashboard1"},
				{Cluster: "cluster2", Namespace: "namespace1", Name: "dashboard2"},
				{Cluster: "cluster2", Namespace: "namespace2", Name: "dashboard3"},
			},
		},
		setTeamDefaults(
			team.TeamSpec{
				Cluster:   "",
				Namespace: "",
				Name:      "",
				Dashboards: []dashboard.Reference{
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
		dashboard.DashboardSpec{
			Cluster:   "cluster1",
			Namespace: "namespace1",
			Name:      "dashboard1",
			Title:     "dashboard1",
		},
		setDashboardDefaults(
			dashboard.DashboardSpec{
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
		user.UserSpec{
			Cluster:   "cluster1",
			Namespace: "namespace1",
			Name:      "user1",
			Teams: []user.TeamReference{
				{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"},
				{Cluster: "cluster2", Namespace: "namespace1", Name: "team2"},
				{Cluster: "cluster2", Namespace: "namespace2", Name: "team3"},
			},
		},
		setUserDefaults(
			user.UserSpec{
				Cluster:   "",
				Namespace: "",
				Name:      "",
				Teams: []user.TeamReference{
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
