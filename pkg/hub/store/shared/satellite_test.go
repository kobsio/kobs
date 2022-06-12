package shared

import (
	"testing"

	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"

	"github.com/stretchr/testify/require"
)

func TestSetSatelliteForApplication(t *testing.T) {
	require.Equal(
		t,
		applicationv1.ApplicationSpec{
			Topology: applicationv1.Topology{
				Dependencies: []applicationv1.Dependency{
					{Satellite: "test-satellite1"},
					{Satellite: "test-satellite2"},
				},
			},
			Dashboards: []dashboardv1.Reference{
				{Satellite: "test-satellite1"},
				{Satellite: "test-satellite2"},
				{Satellite: "test-satellite2", Inline: &dashboardv1.ReferenceInline{
					Rows: []dashboardv1.Row{
						{Panels: []dashboardv1.Panel{
							{Plugin: dashboardv1.Plugin{Satellite: "test-satellite1"}},
							{Plugin: dashboardv1.Plugin{Satellite: "test-satellite2"}},
						}},
					},
				}},
			},
		},
		SetSatelliteForApplication(
			applicationv1.ApplicationSpec{
				Topology: applicationv1.Topology{
					Dependencies: []applicationv1.Dependency{
						{Satellite: ""},
						{Satellite: "test-satellite2"},
					},
				},
				Dashboards: []dashboardv1.Reference{
					{Satellite: ""},
					{Satellite: "test-satellite2"},
					{Satellite: "test-satellite2", Inline: &dashboardv1.ReferenceInline{
						Rows: []dashboardv1.Row{
							{Panels: []dashboardv1.Panel{
								{Plugin: dashboardv1.Plugin{Satellite: ""}},
								{Plugin: dashboardv1.Plugin{Satellite: "test-satellite2"}},
							}},
						},
					}},
				},
			},
			"test-satellite1",
		),
	)
}

func TestSetSatelliteForDashboard(t *testing.T) {
	require.Equal(
		t,
		dashboardv1.DashboardSpec{
			Rows: []dashboardv1.Row{
				{Panels: []dashboardv1.Panel{
					{Plugin: dashboardv1.Plugin{Satellite: "test-satellite1"}},
					{Plugin: dashboardv1.Plugin{Satellite: "test-satellite2"}},
				}},
			},
		},
		SetSatelliteForDashboard(
			dashboardv1.DashboardSpec{
				Rows: []dashboardv1.Row{
					{Panels: []dashboardv1.Panel{
						{Plugin: dashboardv1.Plugin{Satellite: ""}},
						{Plugin: dashboardv1.Plugin{Satellite: "test-satellite2"}},
					}},
				},
			},
			"test-satellite1",
		),
	)
}

func TestSetSatelliteForTeam(t *testing.T) {
	require.Equal(
		t,
		teamv1.TeamSpec{
			Dashboards: []dashboardv1.Reference{
				{Satellite: "test-satellite1"},
				{Satellite: "test-satellite2"},
				{Satellite: "test-satellite2", Inline: &dashboardv1.ReferenceInline{
					Rows: []dashboardv1.Row{
						{Panels: []dashboardv1.Panel{
							{Plugin: dashboardv1.Plugin{Satellite: "test-satellite1"}},
							{Plugin: dashboardv1.Plugin{Satellite: "test-satellite2"}},
						}},
					},
				}},
			},
		},
		SetSatelliteForTeam(
			teamv1.TeamSpec{
				Dashboards: []dashboardv1.Reference{
					{Satellite: ""},
					{Satellite: "test-satellite2"},
					{Satellite: "test-satellite2", Inline: &dashboardv1.ReferenceInline{
						Rows: []dashboardv1.Row{
							{Panels: []dashboardv1.Panel{
								{Plugin: dashboardv1.Plugin{Satellite: ""}},
								{Plugin: dashboardv1.Plugin{Satellite: "test-satellite2"}},
							}},
						},
					}},
				},
			},
			"test-satellite1",
		),
	)
}

func TestSetSatelliteForUser(t *testing.T) {
	require.Equal(
		t,
		userv1.UserSpec{
			Dashboards: []dashboardv1.Reference{
				{Satellite: "test-satellite1"},
				{Satellite: "test-satellite2"},
				{Satellite: "test-satellite2", Inline: &dashboardv1.ReferenceInline{
					Rows: []dashboardv1.Row{
						{Panels: []dashboardv1.Panel{
							{Plugin: dashboardv1.Plugin{Satellite: "test-satellite1"}},
							{Plugin: dashboardv1.Plugin{Satellite: "test-satellite2"}},
						}},
					},
				}},
			},
		},
		SetSatelliteForUser(
			userv1.UserSpec{
				Dashboards: []dashboardv1.Reference{
					{Satellite: ""},
					{Satellite: "test-satellite2"},
					{Satellite: "test-satellite2", Inline: &dashboardv1.ReferenceInline{
						Rows: []dashboardv1.Row{
							{Panels: []dashboardv1.Panel{
								{Plugin: dashboardv1.Plugin{Satellite: ""}},
								{Plugin: dashboardv1.Plugin{Satellite: "test-satellite2"}},
							}},
						},
					}},
				},
			},
			"test-satellite1",
		),
	)
}
