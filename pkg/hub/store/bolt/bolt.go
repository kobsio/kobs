package bolt

import (
	"context"
	"fmt"
	"regexp"
	"time"

	"github.com/kobsio/kobs/pkg/hub/store/shared"
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"
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
				ID:        fmt.Sprintf("/satellite/%s/cluster/%s", satellite, clusterName),
				Cluster:   clusterName,
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

func (c *client) SaveNamespaces(ctx context.Context, satellite string, namespaces map[string][]string) error {
	updatedAt := time.Now().Unix()

	err := c.store.Bolt().Update(func(tx *bolt.Tx) error {
		for k, v := range namespaces {
			for _, n := range v {
				namespace := shared.Namespace{
					ID:        fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s", satellite, k, n),
					Namespace: n,
					Cluster:   k,
					Satellite: satellite,
					ClusterID: fmt.Sprintf("/satellite/%s/cluster/%s", satellite, k),
					UpdatedAt: updatedAt,
				}

				err := c.store.TxUpsert(tx, namespace.ID, namespace)
				if err != nil {
					return err
				}
			}
		}

		return c.store.TxDeleteMatching(tx, &shared.Namespace{}, bh.Where("Satellite").Eq(satellite).And("UpdatedAt").Lt(updatedAt))
	})

	return err
}

func (c *client) SaveCRDs(ctx context.Context, crds []cluster.CRD) error {
	updatedAtTime := time.Now()
	updatedAt := updatedAtTime.Unix()

	err := c.store.Bolt().Update(func(tx *bolt.Tx) error {
		for _, crd := range crds {
			crd.UpdatedAt = updatedAt

			err := c.store.TxUpsert(tx, crd.ID, crd)
			if err != nil {
				return err
			}
		}

		return c.store.TxDeleteMatching(tx, &cluster.CRD{}, bh.Where("UpdatedAt").Lt(updatedAtTime.Add(time.Duration(-72*time.Hour)).Unix()))
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
			a.ClusterID = fmt.Sprintf("/satellite/%s/cluster/%s", satellite, a.Cluster)
			a.NamespaceID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s", satellite, a.Cluster, a.Namespace)

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
			d.ClusterID = fmt.Sprintf("/satellite/%s/cluster/%s", satellite, d.Cluster)
			d.NamespaceID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s", satellite, d.Cluster, d.Namespace)

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
			t.ClusterID = fmt.Sprintf("/satellite/%s/cluster/%s", satellite, t.Cluster)
			t.NamespaceID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s", satellite, t.Cluster, t.Namespace)

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
			u.ClusterID = fmt.Sprintf("/satellite/%s/cluster/%s", satellite, u.Cluster)
			u.NamespaceID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s", satellite, u.Cluster, u.Namespace)

			err := c.store.TxUpsert(tx, u.ID, shared.SetSatelliteForUser(u, satellite))
			if err != nil {
				return err
			}
		}

		return c.store.TxDeleteMatching(tx, &userv1.UserSpec{}, bh.Where("Satellite").Eq(satellite).And("UpdatedAt").Lt(updatedAt))
	})

	return err
}

func (c *client) SaveTags(ctx context.Context, applications []applicationv1.ApplicationSpec) error {
	updatedAtTime := time.Now()
	updatedAt := updatedAtTime.Unix()

	err := c.store.Bolt().Update(func(tx *bolt.Tx) error {
		for _, a := range applications {
			for _, t := range a.Tags {
				tag := shared.Tag{
					ID:        fmt.Sprintf("/tag/%s", t),
					Tag:       t,
					UpdatedAt: updatedAt,
				}

				err := c.store.TxUpsert(tx, tag.ID, tag)
				if err != nil {
					return err
				}
			}
		}

		return c.store.TxDeleteMatching(tx, &shared.Tag{}, bh.Where("UpdatedAt").Lt(updatedAtTime.Add(time.Duration(-72*time.Hour)).Unix()))
	})

	return err
}

func (c *client) GetPlugins(ctx context.Context) ([]plugin.Instance, error) {
	var plugins []plugin.Instance
	query := &bh.Query{}

	err := c.store.Find(&plugins, query.SortBy("ID"))
	if err != nil {
		return nil, err
	}

	return plugins, nil
}

func (c *client) GetClusters(ctx context.Context) ([]shared.Cluster, error) {
	var clusters []shared.Cluster
	query := &bh.Query{}

	err := c.store.Find(&clusters, query.SortBy("ID"))
	if err != nil {
		return nil, err
	}

	return clusters, nil
}

func (c *client) GetNamespaces(ctx context.Context) ([]shared.Namespace, error) {
	var namespaces []shared.Namespace
	query := &bh.Query{}

	err := c.store.Find(&namespaces, query.SortBy("ID"))
	if err != nil {
		return nil, err
	}

	return namespaces, nil
}

func (c *client) GetCRDs(ctx context.Context) ([]cluster.CRD, error) {
	var crds []cluster.CRD
	query := &bh.Query{}

	err := c.store.Find(&crds, query.SortBy("ID"))
	if err != nil {
		return nil, err
	}

	return crds, nil
}

func (c *client) GetCRDByID(ctx context.Context, id string) (*cluster.CRD, error) {
	var crd cluster.CRD

	err := c.store.Get(id, &crd)
	if err != nil {
		return nil, err
	}

	return &crd, nil
}

func (c *client) GetNamespacesByClusterIDs(ctx context.Context, clusterIDs []string) ([]shared.Namespace, error) {
	if len(clusterIDs) == 0 {
		return nil, nil
	}

	var namespaces []shared.Namespace

	err := c.store.Find(&namespaces, bh.Where("ClusterID").In(bh.Slice(clusterIDs)...).SortBy("ID").Index("ClusterID"))
	if err != nil {
		return nil, err
	}

	return namespaces, nil
}

func (c *client) GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error) {
	var applications []applicationv1.ApplicationSpec
	query := &bh.Query{}

	err := c.store.Find(&applications, query.SortBy("ID"))
	if err != nil {
		return nil, err
	}

	return applications, nil
}

func (c *client) GetApplicationsByFilter(ctx context.Context, teams, clusterIDs, namespaceIDs, tags []string, searchTerm, external string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	searchTermRegexp, err := regexp.Compile(searchTerm)
	if err != nil {
		return nil, err
	}

	query := bh.Where("Name").RegExp(searchTermRegexp)

	if len(teams) > 0 {
		query = query.And("Teams").ContainsAny(bh.Slice(teams)...)
	}

	if len(clusterIDs) > 0 {
		query = query.And("ClusterID").In(bh.Slice(clusterIDs)...)
	}

	if len(namespaceIDs) > 0 {
		query = query.And("NamespaceID").In(bh.Slice(namespaceIDs)...)
	}

	if len(tags) > 0 {
		query = query.And("Tags").ContainsAny(bh.Slice(tags)...)
	}

	if external == "exclude" {
		query = query.And("Topology.External").Eq(false)
	} else if external == "only" {
		query = query.And("Topology.External").Eq(true)
	}

	var applications []applicationv1.ApplicationSpec

	err = c.store.Find(&applications, query.SortBy("Name").Limit(limit).Skip(offset))
	if err != nil {
		return nil, err
	}

	return applications, nil
}

func (c *client) GetApplicationsByFilterCount(ctx context.Context, teams, clusterIDs, namespaceIDs, tags []string, searchTerm, external string) (int, error) {
	searchTermRegexp, err := regexp.Compile(searchTerm)
	if err != nil {
		return 0, err
	}

	query := bh.Where("Name").RegExp(searchTermRegexp)

	if len(teams) > 0 {
		query = query.And("Teams").ContainsAny(bh.Slice(teams)...)
	}

	if len(clusterIDs) > 0 {
		query = query.And("ClusterID").In(bh.Slice(clusterIDs)...)
	}

	if len(namespaceIDs) > 0 {
		query = query.And("NamespaceID").In(bh.Slice(namespaceIDs)...)
	}

	if len(tags) > 0 {
		query = query.And("Tags").ContainsAny(bh.Slice(tags)...)
	}

	if external == "exclude" {
		query = query.And("Topology.External").Eq(false)
	} else if external == "only" {
		query = query.And("Topology.External").Eq(true)
	}

	count, err := c.store.Count(&applicationv1.ApplicationSpec{}, query)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (c *client) GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error) {
	var dashboards []dashboardv1.DashboardSpec
	query := &bh.Query{}

	err := c.store.Find(&dashboards, query.SortBy("ID"))
	if err != nil {
		return nil, err
	}

	return dashboards, nil
}

func (c *client) GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error) {
	var teams []teamv1.TeamSpec
	query := &bh.Query{}

	err := c.store.Find(&teams, query.SortBy("Group"))
	if err != nil {
		return nil, err
	}

	return teams, nil
}

func (c *client) GetTeamsByGroups(ctx context.Context, groups []string) ([]teamv1.TeamSpec, error) {
	if len(groups) == 0 {
		return nil, nil
	}

	var teams []teamv1.TeamSpec

	err := c.store.Find(&teams, bh.Where("Group").In(bh.Slice(groups)...).SortBy("Group").Index("Group"))
	if err != nil {
		return nil, err
	}

	return teams, nil
}

func (c *client) GetUsers(ctx context.Context) ([]userv1.UserSpec, error) {
	var users []userv1.UserSpec
	query := &bh.Query{}

	err := c.store.Find(&users, query.SortBy("ID"))
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (c *client) GetUsersByEmail(ctx context.Context, email string) ([]userv1.UserSpec, error) {
	var users []userv1.UserSpec

	err := c.store.Find(&users, bh.Where("Email").Eq(email).Index("Email"))
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (c *client) GetTags(ctx context.Context) ([]shared.Tag, error) {
	var tags []shared.Tag

	err := c.store.Find(&tags, bh.Where("Tag").Ne("").SortBy("Tag"))
	if err != nil {
		return nil, err
	}

	return tags, nil
}
