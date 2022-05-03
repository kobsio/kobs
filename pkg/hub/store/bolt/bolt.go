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

func (c *client) SavePlugins(satellite string, plugins []plugin.Instance) error {
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

func (c *client) SaveClusters(satellite string, clusters []string) error {
	return nil
}

func (c *client) SaveApplications(satellite string, applications []applicationv1.ApplicationSpec) error {
	return nil
}

func (c *client) SaveDashboards(satellite string, dashboards []dashboardv1.DashboardSpec) error {
	return nil
}

func (c *client) SaveTeams(satellite string, teams []teamv1.TeamSpec) error {
	return nil
}

func (c *client) SaveUsers(satellite string, users []userv1.UserSpec) error {
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

func (c *client) GetApplicationsBySatellite(satellite string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	return nil, nil
}

func (c *client) GetApplicationsByCluster(cluster string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	return nil, nil
}

func (c *client) GetApplicationsByNamespace(namespace string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	return nil, nil
}

func (c *client) GetApplication(cluster, namespace, name string) (applicationv1.ApplicationSpec, error) {
	return applicationv1.ApplicationSpec{}, nil
}

func (c *client) GetDashboardsBySatellite(satellite string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	return nil, nil
}

func (c *client) GetDashboardsByCluster(cluster string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	return nil, nil
}

func (c *client) GetDashboardsByNamespace(namespace string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	return nil, nil
}

func (c *client) GetDashboard(cluster, namespace, name string) (dashboardv1.DashboardSpec, error) {
	return dashboardv1.DashboardSpec{}, nil
}

func (c *client) GetTeamsBySatellite(satellite string, limit, offset int) ([]teamv1.TeamSpec, error) {
	return nil, nil
}

func (c *client) GetTeamByCluster(cluster string, limit, offset int) ([]teamv1.TeamSpec, error) {
	return nil, nil
}

func (c *client) GetTeamsByNamespace(namespace string, limit, offset int) ([]teamv1.TeamSpec, error) {
	return nil, nil
}

func (c *client) GetTeam(cluster, namespace, name string) (teamv1.TeamSpec, error) {
	return teamv1.TeamSpec{}, nil
}

func (c *client) GetUsersBySatellite(satellite string, limit, offset int) ([]userv1.UserSpec, error) {
	return nil, nil
}

func (c *client) GetUsersByCluster(cluster string, limit, offset int) ([]userv1.UserSpec, error) {
	return nil, nil
}

func (c *client) GetUsersByNamespace(namespace string, limit, offset int) ([]userv1.UserSpec, error) {
	return nil, nil
}

func (c *client) GetUser(cluster, namespace, name string) (userv1.UserSpec, error) {
	return userv1.UserSpec{}, nil
}
