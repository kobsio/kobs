package cluster

import (
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
)

func setApplicationDefaults(application applicationv1.ApplicationSpec, cluster, namespace, name string) applicationv1.ApplicationSpec {
	application.Cluster = cluster
	application.Namespace = namespace
	application.Name = name

	if application.Topology.Type == "" {
		application.Topology.Type = "default"
	}

	for i := 0; i < len(application.Topology.Dependencies); i++ {
		if application.Topology.Dependencies[i].Cluster == "" {
			application.Topology.Dependencies[i].Cluster = application.Cluster
		}
		if application.Topology.Dependencies[i].Namespace == "" {
			application.Topology.Dependencies[i].Namespace = application.Namespace
		}
	}

	for i := 0; i < len(application.Dashboards); i++ {
		if application.Dashboards[i].Cluster == "" {
			application.Dashboards[i].Cluster = application.Cluster
		}
		if application.Dashboards[i].Namespace == "" {
			application.Dashboards[i].Namespace = application.Namespace
		}
	}

	return application
}

func setTeamDefaults(team teamv1.TeamSpec, cluster, namespace, name string) teamv1.TeamSpec {
	team.Cluster = cluster
	team.Namespace = namespace
	team.Name = name

	// TODO: Remove before v1.0.0, because this is only a workaround, so that the authentication handling works for the
	// old and the new kobs implementation.
	if team.Group == "" {
		team.Group = team.ID
	}

	for i := 0; i < len(team.Dashboards); i++ {
		if team.Dashboards[i].Cluster == "" {
			team.Dashboards[i].Cluster = team.Cluster
		}
		if team.Dashboards[i].Namespace == "" {
			team.Dashboards[i].Namespace = team.Namespace
		}
	}

	return team
}

func setDashboardDefaults(dashboard dashboardv1.DashboardSpec, cluster, namespace, name string) dashboardv1.DashboardSpec {
	dashboard.Cluster = cluster
	dashboard.Namespace = namespace
	dashboard.Name = name
	dashboard.Title = name

	return dashboard
}

func setUserDefaults(user userv1.UserSpec, cluster, namespace, name string) userv1.UserSpec {
	user.Cluster = cluster
	user.Namespace = namespace
	user.Name = name

	// TODO: Remove before v1.0.0, because this is only a workaround, so that the authentication handling works for the
	// old and the new kobs implementation.
	if user.Email == "" {
		user.Email = user.ID
	}

	return user
}
