package defaults

import (
	"fmt"

	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
)

func SetApplicationDefaults(application applicationv1.ApplicationSpec, cluster, namespace, name string) applicationv1.ApplicationSpec {
	application.ID = fmt.Sprintf("/cluster/%s/namespace/%s/name/%s", cluster, namespace, name)
	application.Cluster = cluster
	application.Namespace = namespace
	application.Name = name

	for i := 0; i < len(application.Topology.Dependencies); i++ {
		if application.Topology.Dependencies[i].Cluster == "" {
			application.Topology.Dependencies[i].Cluster = application.Cluster
		}
		if application.Topology.Dependencies[i].Namespace == "" {
			application.Topology.Dependencies[i].Namespace = application.Namespace
		}
	}

	for i := 0; i < len(application.Insights); i++ {
		if application.Insights[i].Plugin.Cluster == "" {
			application.Insights[i].Plugin.Cluster = cluster
		}
	}

	for i := 0; i < len(application.Dashboards); i++ {
		if application.Dashboards[i].Cluster == "" {
			application.Dashboards[i].Cluster = application.Cluster
		}
		if application.Dashboards[i].Namespace == "" {
			application.Dashboards[i].Namespace = application.Namespace
		}

		if application.Dashboards[i].Inline != nil {
			for j := 0; j < len(application.Dashboards[i].Inline.Variables); j++ {
				if application.Dashboards[i].Inline.Variables[j].Plugin.Cluster == "" {
					application.Dashboards[i].Inline.Variables[j].Plugin.Cluster = cluster
				}
			}

			for j := 0; j < len(application.Dashboards[i].Inline.Rows); j++ {
				for k := 0; k < len(application.Dashboards[i].Inline.Rows[j].Panels); k++ {
					if application.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Cluster == "" {
						application.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Cluster = cluster
					}
				}
			}
		}
	}

	return application
}

func SetTeamDefaults(team teamv1.TeamSpec, cluster, namespace, name string) teamv1.TeamSpec {
	team.Cluster = cluster
	team.Namespace = namespace
	team.Name = name

	for i := 0; i < len(team.Dashboards); i++ {
		if team.Dashboards[i].Cluster == "" {
			team.Dashboards[i].Cluster = team.Cluster
		}
		if team.Dashboards[i].Namespace == "" {
			team.Dashboards[i].Namespace = team.Namespace
		}

		if team.Dashboards[i].Inline != nil {
			for j := 0; j < len(team.Dashboards[i].Inline.Variables); j++ {
				if team.Dashboards[i].Inline.Variables[j].Plugin.Cluster == "" {
					team.Dashboards[i].Inline.Variables[j].Plugin.Cluster = cluster
				}
			}

			for j := 0; j < len(team.Dashboards[i].Inline.Rows); j++ {
				for k := 0; k < len(team.Dashboards[i].Inline.Rows[j].Panels); k++ {
					if team.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Cluster == "" {
						team.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Cluster = cluster
					}
				}
			}
		}
	}

	return team
}

func SetDashboardDefaults(dashboard dashboardv1.DashboardSpec, cluster, namespace, name string) dashboardv1.DashboardSpec {
	dashboard.ID = fmt.Sprintf("/cluster/%s/namespace/%s/name/%s", cluster, namespace, name)
	dashboard.Cluster = cluster
	dashboard.Namespace = namespace
	dashboard.Name = name
	dashboard.Title = name

	for i := 0; i < len(dashboard.Variables); i++ {
		if dashboard.Variables[i].Plugin.Cluster == "" {
			dashboard.Variables[i].Plugin.Cluster = cluster
		}
	}

	for i := 0; i < len(dashboard.Rows); i++ {
		for j := 0; j < len(dashboard.Rows[i].Panels); j++ {
			if dashboard.Rows[i].Panels[j].Plugin.Cluster == "" {
				dashboard.Rows[i].Panels[j].Plugin.Cluster = cluster
			}
		}
	}

	return dashboard
}

func SetUserDefaults(user userv1.UserSpec, cluster, namespace, name string) userv1.UserSpec {
	user.Cluster = cluster
	user.Namespace = namespace
	user.Name = name

	for i := 0; i < len(user.Dashboards); i++ {
		if user.Dashboards[i].Cluster == "" {
			user.Dashboards[i].Cluster = user.Cluster
		}
		if user.Dashboards[i].Namespace == "" {
			user.Dashboards[i].Namespace = user.Namespace
		}

		if user.Dashboards[i].Inline != nil {
			for j := 0; j < len(user.Dashboards[i].Inline.Variables); j++ {
				if user.Dashboards[i].Inline.Variables[j].Plugin.Cluster == "" {
					user.Dashboards[i].Inline.Variables[j].Plugin.Cluster = cluster
				}
			}

			for j := 0; j < len(user.Dashboards[i].Inline.Rows); j++ {
				for k := 0; k < len(user.Dashboards[i].Inline.Rows[j].Panels); k++ {
					if user.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Cluster == "" {
						user.Dashboards[i].Inline.Rows[j].Panels[k].Plugin.Cluster = cluster
					}
				}
			}
		}
	}

	return user
}
