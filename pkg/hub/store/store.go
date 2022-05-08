package store

import (
	"context"
	"fmt"

	"github.com/kobsio/kobs/pkg/hub/store/bolt"
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
)

// Client is the interface with all the methods to interact with the store.
type Client interface {
	SavePlugins(ctx context.Context, satellite string, plugins []plugin.Instance) error
	SaveClusters(ctx context.Context, satellite string, clusters []string) error
	SaveApplications(ctx context.Context, satellite string, applications []applicationv1.ApplicationSpec) error
	SaveDashboards(ctx context.Context, satellite string, dashboards []dashboardv1.DashboardSpec) error
	SaveTeams(ctx context.Context, satellite string, teams []teamv1.TeamSpec) error
	SaveUsers(ctx context.Context, satellite string, users []userv1.UserSpec) error
	GetPlugins(ctx context.Context) ([]plugin.Instance, error)
	GetClusters(ctx context.Context) ([]string, error)
	GetApplicationsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByCluster(ctx context.Context, cluster string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplication(ctx context.Context, cluster, namespace, name string) (applicationv1.ApplicationSpec, error)
	GetDashboardsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboardsByCluster(ctx context.Context, cluster string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboardsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboard(ctx context.Context, cluster, namespace, name string) (dashboardv1.DashboardSpec, error)
	GetTeamsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeamsByCluster(ctx context.Context, cluster string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeamsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeam(ctx context.Context, cluster, namespace, name string) (teamv1.TeamSpec, error)
	GetUsersBySatellite(ctx context.Context, satellite string, limit, offset int) ([]userv1.UserSpec, error)
	GetUsersByCluster(ctx context.Context, cluster string, limit, offset int) ([]userv1.UserSpec, error)
	GetUsersByNamespace(ctx context.Context, namespace string, limit, offset int) ([]userv1.UserSpec, error)
	GetUser(ctx context.Context, cluster, namespace, name string) (userv1.UserSpec, error)
}

func NewClient(driver, uri string) (Client, error) {
	switch driver {
	case "bolt":
		return bolt.NewClient(uri)
	default:
		return nil, fmt.Errorf("invalid driver")
	}
}
