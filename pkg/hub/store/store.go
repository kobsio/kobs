package store

import (
	"context"
	"fmt"

	"github.com/kobsio/kobs/pkg/hub/store/bolt"
	"github.com/kobsio/kobs/pkg/hub/store/sqlite"
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
)

// Client is the interface with all the methods to interact with the store.
type Client interface {
	SavePlugins(satellite string, plugins []plugin.Instance) error
	SaveClusters(satellite string, clusters []string) error
	SaveApplications(satellite string, applications []applicationv1.ApplicationSpec) error
	SaveDashboards(satellite string, dashboards []dashboardv1.DashboardSpec) error
	SaveTeams(satellite string, teams []teamv1.TeamSpec) error
	SaveUsers(satellite string, users []userv1.UserSpec) error
	GetPlugins(ctx context.Context) ([]plugin.Instance, error)
	GetClusters(ctx context.Context) ([]string, error)
	GetApplicationsBySatellite(satellite string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByCluster(cluster string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByNamespace(namespace string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplication(cluster, namespace, name string) (applicationv1.ApplicationSpec, error)
	GetDashboardsBySatellite(satellite string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboardsByCluster(cluster string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboardsByNamespace(namespace string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboard(cluster, namespace, name string) (dashboardv1.DashboardSpec, error)
	GetTeamsBySatellite(satellite string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeamByCluster(cluster string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeamsByNamespace(namespace string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeam(cluster, namespace, name string) (teamv1.TeamSpec, error)
	GetUsersBySatellite(satellite string, limit, offset int) ([]userv1.UserSpec, error)
	GetUsersByCluster(cluster string, limit, offset int) ([]userv1.UserSpec, error)
	GetUsersByNamespace(namespace string, limit, offset int) ([]userv1.UserSpec, error)
	GetUser(cluster, namespace, name string) (userv1.UserSpec, error)
}

func NewClient(driver, uri string) (Client, error) {
	switch driver {
	case "sqlite":
		return sqlite.NewClient(uri)
	case "bolt":
		return bolt.NewClient(uri)
	default:
		return nil, fmt.Errorf("invalid driver")
	}
}
