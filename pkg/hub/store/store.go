package store

import (
	"context"
	"fmt"

	"github.com/kobsio/kobs/pkg/hub/store/bolt"
	"github.com/kobsio/kobs/pkg/hub/store/shared"
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
)

// Client is the interface with all the methods to interact with the store.
type Client interface {
	SavePlugins(ctx context.Context, satellite string, plugins []plugin.Instance) error
	SaveClusters(ctx context.Context, satellite string, clusters []string) error
	SaveNamespaces(ctx context.Context, satellite string, namespaces map[string][]string) error
	SaveCRDs(ctx context.Context, crds []cluster.CRD) error
	SaveApplications(ctx context.Context, satellite string, applications []applicationv1.ApplicationSpec) error
	SaveDashboards(ctx context.Context, satellite string, dashboards []dashboardv1.DashboardSpec) error
	SaveTeams(ctx context.Context, satellite string, teams []teamv1.TeamSpec) error
	SaveUsers(ctx context.Context, satellite string, users []userv1.UserSpec) error
	SaveTags(ctx context.Context, applications []applicationv1.ApplicationSpec) error
	GetPlugins(ctx context.Context) ([]plugin.Instance, error)
	GetClusters(ctx context.Context) ([]shared.Cluster, error)
	GetNamespaces(ctx context.Context) ([]shared.Namespace, error)
	GetNamespacesByClusterIDs(ctx context.Context, clusterIDs []string) ([]shared.Namespace, error)
	GetCRDs(ctx context.Context) ([]cluster.CRD, error)
	GetCRDByID(ctx context.Context, id string) (*cluster.CRD, error)
	GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByFilter(ctx context.Context, teams, clusterIDs, namespaceIDs, tags []string, searchTerm, external string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByFilterCount(ctx context.Context, teams, clusterIDs, namespaceIDs, tags []string, searchTerm, external string) (int, error)
	GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error)
	GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error)
	GetTeamsByGroups(ctx context.Context, groups []string) ([]teamv1.TeamSpec, error)
	GetUsers(ctx context.Context) ([]userv1.UserSpec, error)
	GetUsersByEmail(ctx context.Context, email string) ([]userv1.UserSpec, error)
	GetTags(ctx context.Context) ([]shared.Tag, error)
}

func NewClient(driver, uri string) (Client, error) {
	switch driver {
	case "bolt":
		return bolt.NewClient(uri)
	default:
		return nil, fmt.Errorf("invalid driver")
	}
}
