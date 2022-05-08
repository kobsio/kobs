package bolt

import (
	"context"
	"fmt"
	"time"

	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	bh "github.com/timshannon/bolthold"
	bolt "go.etcd.io/bbolt"
)

type client struct {
	store *bh.Store
}

func NewClient(uri string) (*client, error) {
	store, err := bh.Open(uri, 0666, nil)
	if err != nil {
		return nil, err
	}

	return &client{
		store: store,
	}, nil
}

func (c *client) SavePlugins(ctx context.Context, satellite string, plugins []plugin.Instance) error {
	txTime := time.Now().Unix()

	err := c.store.Bolt().Update(func(tx *bolt.Tx) error {
		for _, p := range plugins {
			p.ID = fmt.Sprintf("/satellite/%s/type/%s/name/%s", satellite, p.Type, p.Name)
			p.Satellite = satellite
			p.UpdatedAt = txTime

			err := c.store.TxUpsert(tx, p.ID, p)
			if err != nil {
				return err
			}
		}

		return c.store.TxDeleteMatching(tx, &plugin.Instance{}, bh.Where("Satellite").Eq(satellite).And("UpdatedAt").Lt(txTime))
	})

	return err
}

func (c *client) SaveClusters(ctx context.Context, satellite string, clusters []string) error {
	return nil
}

func (c *client) SaveApplications(ctx context.Context, satellite string, applications []applicationv1.ApplicationSpec) error {
	return nil
}

func (c *client) SaveDashboards(ctx context.Context, satellite string, dashboards []dashboardv1.DashboardSpec) error {
	return nil
}

func (c *client) SaveTeams(ctx context.Context, satellite string, teams []teamv1.TeamSpec) error {
	return nil
}

func (c *client) SaveUsers(ctx context.Context, satellite string, users []userv1.UserSpec) error {
	return nil
}

func (c *client) GetPlugins(ctx context.Context) ([]plugin.Instance, error) {
	var plugins []plugin.Instance

	err := c.store.Find(&plugins, &bh.Query{})
	if err != nil {
		return nil, err
	}

	return plugins, nil
}

func (c *client) GetClusters(ctx context.Context) ([]string, error) {
	return nil, nil
}

func (c *client) GetApplicationsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	return nil, nil
}

func (c *client) GetApplicationsByCluster(ctx context.Context, cluster string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	return nil, nil
}

func (c *client) GetApplicationsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	return nil, nil
}

func (c *client) GetApplication(ctx context.Context, cluster, namespace, name string) (applicationv1.ApplicationSpec, error) {
	return applicationv1.ApplicationSpec{}, nil
}

func (c *client) GetDashboardsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	return nil, nil
}

func (c *client) GetDashboardsByCluster(ctx context.Context, cluster string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	return nil, nil
}

func (c *client) GetDashboardsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	return nil, nil
}

func (c *client) GetDashboard(ctx context.Context, cluster, namespace, name string) (dashboardv1.DashboardSpec, error) {
	return dashboardv1.DashboardSpec{}, nil
}

func (c *client) GetTeamsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]teamv1.TeamSpec, error) {
	return nil, nil
}

func (c *client) GetTeamsByCluster(ctx context.Context, cluster string, limit, offset int) ([]teamv1.TeamSpec, error) {
	return nil, nil
}

func (c *client) GetTeamsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]teamv1.TeamSpec, error) {
	return nil, nil
}

func (c *client) GetTeam(ctx context.Context, cluster, namespace, name string) (teamv1.TeamSpec, error) {
	return teamv1.TeamSpec{}, nil
}

func (c *client) GetUsersBySatellite(ctx context.Context, satellite string, limit, offset int) ([]userv1.UserSpec, error) {
	return nil, nil
}

func (c *client) GetUsersByCluster(ctx context.Context, cluster string, limit, offset int) ([]userv1.UserSpec, error) {
	return nil, nil
}

func (c *client) GetUsersByNamespace(ctx context.Context, namespace string, limit, offset int) ([]userv1.UserSpec, error) {
	return nil, nil
}

func (c *client) GetUser(ctx context.Context, cluster, namespace, name string) (userv1.UserSpec, error) {
	return userv1.UserSpec{}, nil
}
