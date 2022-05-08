package bolt

import (
	"context"
	"fmt"
	"time"

	"github.com/kobsio/kobs/pkg/hub/store/shared"
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
	updatedAt := time.Now().Unix()

	err := c.store.Bolt().Update(func(tx *bolt.Tx) error {
		for _, p := range plugins {
			p.ID = fmt.Sprintf("/satellite/%s/type/%s/name/%s", satellite, p.Type, p.Name)
			p.Satellite = satellite
			p.UpdatedAt = updatedAt

			err := c.store.TxUpsert(tx, p.ID, p)
			if err != nil {
				return err
			}
		}

		return c.store.TxDeleteMatching(tx, &plugin.Instance{}, bh.Where("Satellite").Eq(satellite).And("UpdatedAt").Lt(updatedAt))
	})

	return err
}

func (c *client) SaveClusters(ctx context.Context, satellite string, clusters []string) error {
	updatedAt := time.Now().Unix()

	err := c.store.Bolt().Update(func(tx *bolt.Tx) error {
		for _, clusterName := range clusters {
			cluster := shared.Cluster{
				ID:        fmt.Sprintf("/satellite/%s/name/%s", satellite, clusterName),
				Satellite: satellite,
				UpdatedAt: updatedAt,
			}

			err := c.store.TxUpsert(tx, cluster.ID, cluster)
			if err != nil {
				return err
			}
		}

		return c.store.TxDeleteMatching(tx, &shared.Cluster{}, bh.Where("Satellite").Eq(satellite).And("UpdatedAt").Lt(updatedAt))
	})

	return err
}

func (c *client) SaveApplications(ctx context.Context, satellite string, applications []applicationv1.ApplicationSpec) error {
	updatedAt := time.Now().Unix()

	err := c.store.Bolt().Update(func(tx *bolt.Tx) error {
		for _, a := range applications {
			a.ID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s/name/%s", satellite, a.Cluster, a.Namespace, a.Name)
			a.Satellite = satellite
			a.UpdatedAt = updatedAt

			err := c.store.TxUpsert(tx, a.ID, shared.SetSatelliteForApplication(a, satellite))
			if err != nil {
				return err
			}
		}

		return c.store.TxDeleteMatching(tx, &applicationv1.ApplicationSpec{}, bh.Where("Satellite").Eq(satellite).And("UpdatedAt").Lt(updatedAt))
	})

	return err
}

func (c *client) SaveDashboards(ctx context.Context, satellite string, dashboards []dashboardv1.DashboardSpec) error {
	updatedAt := time.Now().Unix()

	err := c.store.Bolt().Update(func(tx *bolt.Tx) error {
		for _, d := range dashboards {
			d.ID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s/name/%s", satellite, d.Cluster, d.Namespace, d.Name)
			d.Satellite = satellite
			d.UpdatedAt = updatedAt

			err := c.store.TxUpsert(tx, d.ID, shared.SetSatelliteForDashboard(d, satellite))
			if err != nil {
				return err
			}
		}

		return c.store.TxDeleteMatching(tx, &dashboardv1.DashboardSpec{}, bh.Where("Satellite").Eq(satellite).And("UpdatedAt").Lt(updatedAt))
	})

	return err
}

func (c *client) SaveTeams(ctx context.Context, satellite string, teams []teamv1.TeamSpec) error {
	updatedAt := time.Now().Unix()

	err := c.store.Bolt().Update(func(tx *bolt.Tx) error {
		for _, t := range teams {
			t.ID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s/name/%s", satellite, t.Cluster, t.Namespace, t.Name)
			t.Satellite = satellite
			t.UpdatedAt = updatedAt

			err := c.store.TxUpsert(tx, t.ID, shared.SetSatelliteForTeam(t, satellite))
			if err != nil {
				return err
			}
		}

		return c.store.TxDeleteMatching(tx, &teamv1.TeamSpec{}, bh.Where("Satellite").Eq(satellite).And("UpdatedAt").Lt(updatedAt))
	})

	return err
}

func (c *client) SaveUsers(ctx context.Context, satellite string, users []userv1.UserSpec) error {
	updatedAt := time.Now().Unix()

	err := c.store.Bolt().Update(func(tx *bolt.Tx) error {
		for _, u := range users {
			u.ID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s/name/%s", satellite, u.Cluster, u.Namespace, u.Name)
			u.Satellite = satellite
			u.UpdatedAt = updatedAt

			err := c.store.TxUpsert(tx, u.ID, shared.SetSatelliteForUser(u, satellite))
			if err != nil {
				return err
			}
		}

		return c.store.TxDeleteMatching(tx, &userv1.UserSpec{}, bh.Where("Satellite").Eq(satellite).And("UpdatedAt").Lt(updatedAt))
	})

	return err
}

func (c *client) GetPlugins(ctx context.Context) ([]plugin.Instance, error) {
	var plugins []plugin.Instance

	err := c.store.Find(&plugins, &bh.Query{})
	if err != nil {
		return nil, err
	}

	return plugins, nil
}

func (c *client) GetClusters(ctx context.Context) ([]shared.Cluster, error) {
	var clusters []shared.Cluster

	err := c.store.Find(&clusters, &bh.Query{})
	if err != nil {
		return nil, err
	}

	return clusters, nil
}

func (c *client) GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error) {
	var applications []applicationv1.ApplicationSpec

	err := c.store.Find(&applications, &bh.Query{})
	if err != nil {
		return nil, err
	}

	return applications, nil
}

func (c *client) GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error) {
	var dashboards []dashboardv1.DashboardSpec

	err := c.store.Find(&dashboards, &bh.Query{})
	if err != nil {
		return nil, err
	}

	return dashboards, nil
}

func (c *client) GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error) {
	var teams []teamv1.TeamSpec

	err := c.store.Find(&teams, &bh.Query{})
	if err != nil {
		return nil, err
	}

	return teams, nil
}

func (c *client) GetTeamsByGroups(ctx context.Context, groups []string) ([]teamv1.TeamSpec, error) {
	var teams []teamv1.TeamSpec

	err := c.store.Find(&teams, bh.Where("Group").ContainsAny(bh.Slice(groups)...))
	if err != nil {
		return nil, err
	}

	return teams, nil
}

func (c *client) GetUsers(ctx context.Context) ([]userv1.UserSpec, error) {
	var users []userv1.UserSpec

	err := c.store.Find(&users, &bh.Query{})
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (c *client) GetUsersByEmail(ctx context.Context, email string) ([]userv1.UserSpec, error) {
	var users []userv1.UserSpec

	err := c.store.Find(&users, bh.Where("Email").Eq(email))
	if err != nil {
		return nil, err
	}

	return users, nil
}
