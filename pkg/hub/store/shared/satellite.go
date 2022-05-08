package shared

import (
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
)

func SetSatelliteForApplication(application applicationv1.ApplicationSpec, satellite string) applicationv1.ApplicationSpec {
	for i := 0; i < len(application.Topology.Dependencies); i++ {
		if application.Topology.Dependencies[i].Satellite == "" {
			application.Topology.Dependencies[i].Satellite = satellite
		}
	}

	for i := 0; i < len(application.Dashboards); i++ {
		if application.Dashboards[i].Satellite == "" {
			application.Dashboards[i].Satellite = satellite
		}

		if application.Dashboards[i].Inline != nil {
			for j := 0; j < len(application.Dashboards[i].Inline.Rows); j++ {
				for k := 0; k < len(application.Dashboards[i].Inline.Rows[j].Panels); k++ {
					if application.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Satellite == "" {
						application.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Satellite = satellite
					}
				}
			}
		}
	}

	return application
}

func SetSatelliteForDashboard(dashboard dashboardv1.DashboardSpec, satellite string) dashboardv1.DashboardSpec {
	for i := 0; i < len(dashboard.Rows); i++ {
		for j := 0; j < len(dashboard.Rows[i].Panels); j++ {
			if dashboard.Rows[i].Panels[j].Plugin.Satellite == "" {
				dashboard.Rows[i].Panels[j].Plugin.Satellite = satellite
			}
		}

	}

	return dashboard
}

func SetSatelliteForTeam(team teamv1.TeamSpec, satellite string) teamv1.TeamSpec {
	for i := 0; i < len(team.Dashboards); i++ {
		if team.Dashboards[i].Satellite == "" {
			team.Dashboards[i].Satellite = satellite
		}

		if team.Dashboards[i].Inline != nil {
			for j := 0; j < len(team.Dashboards[i].Inline.Rows); j++ {
				for k := 0; k < len(team.Dashboards[i].Inline.Rows[j].Panels); k++ {
					if team.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Satellite == "" {
						team.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Satellite = satellite
					}
				}
			}
		}
	}

	return team
}

func SetSatelliteForUser(user userv1.UserSpec, satellite string) userv1.UserSpec {
	for i := 0; i < len(user.Dashboards); i++ {
		if user.Dashboards[i].Satellite == "" {
			user.Dashboards[i].Satellite = satellite
		}

		if user.Dashboards[i].Inline != nil {
			for j := 0; j < len(user.Dashboards[i].Inline.Rows); j++ {
				for k := 0; k < len(user.Dashboards[i].Inline.Rows[j].Panels); k++ {
					if user.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Satellite == "" {
						user.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Satellite = satellite
					}
				}
			}
		}
	}

	return user
}
