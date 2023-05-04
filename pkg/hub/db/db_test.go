package db

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	"github.com/kobsio/kobs/pkg/plugins/plugin"

	"github.com/orlangure/gnomock"
	"github.com/orlangure/gnomock/preset/mongo"
	"github.com/stretchr/testify/require"
)

func setupDatabase(t *testing.T) (string, *gnomock.Container) {
	err := os.MkdirAll("/tmp/mongodb/", os.ModePerm)
	if err != nil {
		t.Fatal(err)
	}
	p := mongo.Preset(mongo.WithData("/tmp/mongodb/"))
	c, err := gnomock.Start(p)
	if err != nil {
		t.Fatal(err)
	}

	return fmt.Sprintf("mongodb://%s", c.DefaultAddress()), c
}

func TestNewClient(t *testing.T) {
	c1, err1 := NewClient(Config{URI: ""})
	require.Error(t, err1)
	require.Empty(t, c1)

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	c2, err2 := NewClient(Config{URI: uri})
	require.NoError(t, err2)
	require.NotEmpty(t, c2)
}

func TestSaveAndGetPlugins(t *testing.T) {
	plugins := []plugin.Instance{{
		Name: "test-cluster",
		Type: "prometheus",
	}, {
		Name: "test-cluster",
		Type: "klogs",
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SavePlugins(context.Background(), "test-cluster", plugins)
	require.NoError(t, err)

	storedPlugins1, err := c.GetPlugins(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedPlugins1))

	time.Sleep(2 * time.Second)

	err = c.SavePlugins(context.Background(), "test-cluster", plugins[0:1])
	require.NoError(t, err)

	storedPlugins2, err := c.GetPlugins(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedPlugins2))
}

func TestSaveAndGetNamespaces(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	namespaces1 := []string{"default", "kube-system"}
	err := c.SaveNamespaces(context.Background(), "test-cluster", namespaces1)
	require.NoError(t, err)

	storedNamespaces1, err := c.GetNamespaces(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedNamespaces1))

	time.Sleep(2 * time.Second)

	namespaces2 := []string{"default"}
	err = c.SaveNamespaces(context.Background(), "test-cluster", namespaces2)
	require.NoError(t, err)

	storedNamespaces2, err := c.GetNamespaces(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedNamespaces2))
}

func TestSaveAndGetCRDs(t *testing.T) {
	crds1 := []kubernetes.CRD{
		{ID: "resource1.path1/v1", Resource: "resource1", Path: "path1/v1"},
		{ID: "resource2.path2/v2", Resource: "resource2", Path: "path2/v2"},
	}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveCRDs(context.Background(), crds1)
	require.NoError(t, err)

	storedCRDs1, err := c.GetCRDs(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedCRDs1))

	time.Sleep(2 * time.Second)

	err = c.SaveCRDs(context.Background(), crds1[0:1])
	require.NoError(t, err)

	storedCRDs2, err := c.GetCRDs(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedCRDs2))
}

func TestSaveAndGetApplications(t *testing.T) {
	applications := []applicationv1.ApplicationSpec{{
		ID:        "/cluster/test-cluster/namespace/default/name/application1",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "application1",
	}, {
		ID:        "/cluster/test-cluster/namespace/default/name/application2",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "application2",
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveApplications(context.Background(), "test-cluster", applications)
	require.NoError(t, err)

	storedApplications1, err := c.GetApplications(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedApplications1))

	time.Sleep(2 * time.Second)

	err = c.SaveApplications(context.Background(), "test-cluster", applications[0:1])
	require.NoError(t, err)

	storedApplications2, err := c.GetApplications(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedApplications2))
}

func TestSaveAndGetApplication(t *testing.T) {
	application := applicationv1.ApplicationSpec{
		ID:        "/cluster/test-cluster/namespace/default/name/application1",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "application1",
	}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveApplication(context.Background(), &application)
	require.NoError(t, err)

	storedApplication1, err := c.GetApplicationByID(context.Background(), application.ID)
	require.NoError(t, err)
	require.Equal(t, application.ID, storedApplication1.ID)
	require.Equal(t, application.Cluster, storedApplication1.Cluster)
	require.Equal(t, application.Namespace, storedApplication1.Namespace)
	require.Equal(t, application.Name, storedApplication1.Name)

	time.Sleep(2 * time.Second)

	application.Name = "application2"
	err = c.SaveApplication(context.Background(), &application)
	require.NoError(t, err)

	storedApplication2, err := c.GetApplicationByID(context.Background(), application.ID)
	require.NoError(t, err)
	require.Equal(t, application.ID, storedApplication2.ID)
	require.Equal(t, application.Cluster, storedApplication2.Cluster)
	require.Equal(t, application.Namespace, storedApplication2.Namespace)
	require.Equal(t, application.Name, storedApplication2.Name)
}

func TestSaveAndGetDashboards(t *testing.T) {
	dashboards := []dashboardv1.DashboardSpec{{
		ID:        "/cluster/test-cluster/namespace/default/name/dashboard1",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "dashboard1",
	}, {
		ID:        "/cluster/test-cluster/namespace/default/name/dashboard2",
		Cluster:   "test-cluster",
		Namespace: "kube-system",
		Name:      "dashboard2",
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveDashboards(context.Background(), "test-cluster", dashboards)
	require.NoError(t, err)

	storedDashboards1, err := c.GetDashboards(context.Background(), nil, nil)
	require.NoError(t, err)
	require.Equal(t, 2, len(storedDashboards1))

	storedDashboards2, err := c.GetDashboards(context.Background(), []string{"test-cluster"}, []string{"default"})
	require.NoError(t, err)
	require.Equal(t, 1, len(storedDashboards2))

	time.Sleep(2 * time.Second)

	err = c.SaveDashboards(context.Background(), "test-cluster", dashboards[0:1])
	require.NoError(t, err)

	storedDashboards3, err := c.GetDashboards(context.Background(), nil, nil)
	require.NoError(t, err)
	require.Equal(t, 1, len(storedDashboards3))
}

func TestSaveAndGetTeams(t *testing.T) {
	teams := []teamv1.TeamSpec{{
		ID:        "/cluster/test-cluster/namespace/default/name/team1",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "team1",
	}, {
		ID:        "/cluster/test-cluster/namespace/default/name/team2",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "team2",
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveTeams(context.Background(), "test-cluster", teams)
	require.NoError(t, err)

	storedTeams1, err := c.GetTeams(context.Background(), "")
	require.NoError(t, err)
	require.Equal(t, 2, len(storedTeams1))

	time.Sleep(2 * time.Second)

	err = c.SaveTeams(context.Background(), "test-cluster", teams[0:1])
	require.NoError(t, err)

	storedTeams2, err := c.GetTeams(context.Background(), "")
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTeams2))
}

func TestSaveAndGetTeam(t *testing.T) {
	team := teamv1.TeamSpec{
		ID:        "/cluster/test-cluster/namespace/default/name/team1",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "team1",
	}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveTeam(context.Background(), &team)
	require.NoError(t, err)

	storedTeam1, err := c.GetTeamByID(context.Background(), team.ID)
	require.NoError(t, err)
	require.Equal(t, team.ID, storedTeam1.ID)
	require.Equal(t, team.Cluster, storedTeam1.Cluster)
	require.Equal(t, team.Namespace, storedTeam1.Namespace)
	require.Equal(t, team.Name, storedTeam1.Name)

	time.Sleep(2 * time.Second)

	team.Name = "team2"
	err = c.SaveTeam(context.Background(), &team)
	require.NoError(t, err)

	storedTeam2, err := c.GetTeamByID(context.Background(), team.ID)
	require.NoError(t, err)
	require.Equal(t, team.ID, storedTeam2.ID)
	require.Equal(t, team.Cluster, storedTeam2.Cluster)
	require.Equal(t, team.Namespace, storedTeam2.Namespace)
	require.Equal(t, team.Name, storedTeam2.Name)
}

func TestSaveAndGetUsers(t *testing.T) {
	users := []userv1.UserSpec{{
		ID:        "/cluster/test-cluster/namespace/default/name/user1",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "user1",
	}, {
		ID:        "/cluster/test-cluster/namespace/default/name/user2",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "user2",
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveUsers(context.Background(), "test-cluster", users)
	require.NoError(t, err)

	storedUsers1, err := c.GetUsers(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedUsers1))

	time.Sleep(2 * time.Second)

	err = c.SaveUsers(context.Background(), "test-cluster", users[0:1])
	require.NoError(t, err)

	storedUsers2, err := c.GetUsers(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedUsers2))
}

func TestSaveAndGetUser(t *testing.T) {
	user := userv1.UserSpec{
		ID:        "/cluster/test-cluster/namespace/default/name/user1",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "user1",
	}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveUser(context.Background(), &user)
	require.NoError(t, err)

	storedUser1, err := c.GetUserByID(context.Background(), user.ID)
	require.NoError(t, err)
	require.Equal(t, user.ID, storedUser1.ID)
	require.Equal(t, user.Cluster, storedUser1.Cluster)
	require.Equal(t, user.Namespace, storedUser1.Namespace)
	require.Equal(t, user.Name, storedUser1.Name)

	time.Sleep(2 * time.Second)

	user.Name = "user2"
	err = c.SaveUser(context.Background(), &user)
	require.NoError(t, err)

	storedUser2, err := c.GetUserByID(context.Background(), user.ID)
	require.NoError(t, err)
	require.Equal(t, user.ID, storedUser2.ID)
	require.Equal(t, user.Cluster, storedUser2.Cluster)
	require.Equal(t, user.Namespace, storedUser2.Namespace)
	require.Equal(t, user.Name, storedUser2.Name)
}

func TestSaveAndGetTags(t *testing.T) {
	applications := []applicationv1.ApplicationSpec{{
		ID:        "/cluster/test-cluster/namespace/default/name/application1",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "application1",
		Tags:      []string{"tag1", "tag2", "tag3"},
	}, {
		ID:        "/cluster/test-cluster/namespace/default/name/application2",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "application2",
		Tags:      []string{"tag3", "tag4", "tag5"},
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveTags(context.Background(), applications)
	require.NoError(t, err)

	storedTags1, err := c.GetTags(context.Background())
	require.NoError(t, err)
	require.Equal(t, 5, len(storedTags1))
}

func TestSaveAndGetTopology(t *testing.T) {
	applications := []applicationv1.ApplicationSpec{{
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "application1",
		Topology: applicationv1.Topology{
			Dependencies: []applicationv1.Dependency{{
				Cluster:   "test-cluster",
				Namespace: "default",
				Name:      "application2",
			}},
		},
	}, {
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "application2",
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveTopology(context.Background(), "test-cluster", applications)
	require.NoError(t, err)

	storedTopology1, err := c.GetTopologyByIDs(context.Background(), "targetID", []string{"/cluster/test-cluster/namespace/default/name/application2"})
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTopology1))

	storedTopology2, err := c.GetTopologyByIDs(context.Background(), "sourceID", []string{"/cluster/test-cluster/namespace/default/name/application1"})
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTopology2))
}

func TestGetNamespacesByClusters(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveNamespaces(context.Background(), "test-cluster1", []string{"default", "kube-system"})
	require.NoError(t, err)
	err = c.SaveNamespaces(context.Background(), "test-cluster2", []string{"default", "kube-system", "istio-system"})
	require.NoError(t, err)

	storedNamespaces1, err := c.GetNamespacesByClusters(context.Background(), []string{"test-cluster1"})
	require.NoError(t, err)
	require.Equal(t, 2, len(storedNamespaces1))

	storedNamespaces2, err := c.GetNamespacesByClusters(context.Background(), []string{"test-cluster1", "test-cluster2"})
	require.NoError(t, err)
	require.Equal(t, 5, len(storedNamespaces2))

	storedNamespaces3, err := c.GetNamespacesByClusters(context.Background(), []string{})
	require.NoError(t, err)
	require.Equal(t, 5, len(storedNamespaces3))

	storedNamespaces4, err := c.GetNamespacesByClusters(context.Background(), nil)
	require.NoError(t, err)
	require.Equal(t, 5, len(storedNamespaces4))
}

func TestGetCRDByID(t *testing.T) {
	crds := []kubernetes.CRD{
		{ID: "resource1.path1/v1", Resource: "resource1", Path: "path1/v1"},
		{ID: "resource2.path2/v2", Resource: "resource2", Path: "path2/v2"},
	}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveCRDs(context.Background(), crds)
	require.NoError(t, err)

	crd1, err := c.GetCRDByID(context.Background(), "resource1.path1/v1")
	require.NoError(t, err)
	require.NotNil(t, crd1)

	crd2, err := c.GetCRDByID(context.Background(), "resource3.path3/v3")
	require.Error(t, err)
	require.Nil(t, crd2)
}

func TestGetApplicationsByFilter(t *testing.T) {
	applications1 := []applicationv1.ApplicationSpec{
		{ID: "cluster/test-cluster1/namespace/default/application1", Cluster: "test-cluster1", Namespace: "default", Name: "application1", Teams: []string{"team1"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
		{ID: "cluster/test-cluster1/namespace/default/application2", Cluster: "test-cluster1", Namespace: "default", Name: "application2", Teams: []string{"team1", "team2"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
		{ID: "cluster/test-cluster1/namespace/default/application3", Cluster: "test-cluster1", Namespace: "default", Name: "application3", Teams: []string{"team3"}, Tags: []string{}, Topology: applicationv1.Topology{External: true}},
		{ID: "cluster/test-cluster1/namespace/default/application4", Cluster: "test-cluster2", Namespace: "default", Name: "application4", Teams: []string{"team1", "team2", "team3"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
	}
	applications2 := []applicationv1.ApplicationSpec{
		{ID: "cluster/test-cluster1/namespace/default/application5", Cluster: "test-cluster2", Namespace: "default", Name: "application5", Teams: []string{}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
		{ID: "cluster/test-cluster1/namespace/kube-system/application6", Cluster: "test-cluster2", Namespace: "kube-system", Name: "application6", Teams: []string{"team1"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
		{ID: "cluster/test-cluster1/namespace/kube-system/application7", Cluster: "test-cluster2", Namespace: "kube-system", Name: "application7", Teams: []string{}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
		{ID: "cluster/test-cluster1/namespace/kube-system/application8", Cluster: "test-cluster2", Namespace: "kube-system", Name: "application8", Teams: []string{"team3"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
		{ID: "cluster/test-cluster1/namespace/kube-system/application9", Cluster: "test-cluster2", Namespace: "kube-system", Name: "application9", Teams: []string{"team1"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
		{ID: "cluster/test-cluster1/namespace/kube-system/application10", Cluster: "test-cluster2", Namespace: "kube-system", Name: "application10", Teams: []string{}, Tags: []string{"core", "provider", "logging"}, Topology: applicationv1.Topology{External: true}},
	}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveApplications(context.Background(), "test-cluster1", applications1)
	require.NoError(t, err)
	err = c.SaveApplications(context.Background(), "test-cluster2", applications2)
	require.NoError(t, err)

	getApplicationsNames := func(storedApplications []applicationv1.ApplicationSpec) []string {
		var names []string
		for _, a := range storedApplications {
			names = append(names, a.Name)
		}
		return names
	}

	for _, tt := range []struct {
		name                 string
		teams                []string
		clusters             []string
		namespaces           []string
		tags                 []string
		searchTerm           string
		limit                int
		offset               int
		expectedError        bool
		expectedApplications []string
		expectedCount        int
	}{
		{name: "searchTerm can not be compiled to regexp", teams: nil, clusters: nil, namespaces: nil, tags: nil, searchTerm: "*", limit: 100, offset: 0, expectedError: true, expectedApplications: nil, expectedCount: 0},
		{name: "no filters", teams: nil, clusters: nil, namespaces: nil, tags: nil, searchTerm: "", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application1", "application10", "application2", "application3", "application4", "application5", "application6", "application7", "application8", "application9"}, expectedCount: 10},
		{name: "no filters but limit", teams: nil, clusters: nil, namespaces: nil, tags: nil, searchTerm: "", limit: 5, offset: 0, expectedError: false, expectedApplications: []string{"application1", "application10", "application2", "application3", "application4"}, expectedCount: 10},
		{name: "no filters but limit and offset", teams: nil, clusters: nil, namespaces: nil, tags: nil, searchTerm: "", limit: 5, offset: 5, expectedError: false, expectedApplications: []string{"application5", "application6", "application7", "application8", "application9"}, expectedCount: 10},
		{name: "only searchTerm", teams: nil, clusters: nil, namespaces: nil, tags: nil, searchTerm: "application1", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application1", "application10"}, expectedCount: 2},
		{name: "filter by team", teams: []string{"team2"}, clusters: nil, namespaces: nil, tags: nil, searchTerm: "", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application2", "application4"}, expectedCount: 2},
		{name: "filter by teams", teams: []string{"team1", "team3"}, clusters: nil, namespaces: nil, tags: nil, searchTerm: "", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application1", "application2", "application3", "application4", "application6", "application8", "application9"}, expectedCount: 7},
		{name: "filter by cluster and namespace", teams: nil, clusters: []string{"test-cluster1", "test-cluster2"}, namespaces: []string{"default"}, tags: nil, searchTerm: "", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application1", "application2", "application3", "application4", "application5"}, expectedCount: 5},
		{name: "filter by tags", teams: nil, clusters: nil, namespaces: nil, tags: []string{"logging"}, searchTerm: "", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application10"}, expectedCount: 1},
	} {
		t.Run(tt.name, func(t *testing.T) {
			storedApplications, err := c.GetApplicationsByFilter(context.Background(), tt.teams, tt.clusters, tt.namespaces, tt.tags, tt.searchTerm, tt.limit, tt.offset)
			if tt.expectedError {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
			require.Equal(t, tt.expectedApplications, getApplicationsNames(storedApplications))

			count, err := c.GetApplicationsByFilterCount(context.Background(), tt.teams, tt.clusters, tt.namespaces, tt.tags, tt.searchTerm)
			if tt.expectedError {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
			require.Equal(t, tt.expectedCount, count)
		})
	}
}

func TestGetApplicationsByGroup(t *testing.T) {
	applications1 := []applicationv1.ApplicationSpec{
		{ID: "1", Cluster: "test-cluster1", Namespace: "default", Name: "application1", Teams: []string{"team1"}},
		{ID: "2", Cluster: "test-cluster1", Namespace: "default", Name: "application2", Teams: []string{"team1"}},
		{ID: "3", Cluster: "test-cluster1", Namespace: "kube-system", Name: "application3", Teams: []string{"team1"}},
		{ID: "4", Cluster: "test-cluster1", Namespace: "kube-system", Name: "application4", Teams: []string{"team1"}},
	}
	applications2 := []applicationv1.ApplicationSpec{
		{ID: "5", Cluster: "test-cluster2", Namespace: "default", Name: "application1", Teams: []string{"team1"}},
		{ID: "6", Cluster: "test-cluster2", Namespace: "default", Name: "application2", Teams: []string{"team1"}},
		{ID: "7", Cluster: "test-cluster2", Namespace: "kube-system", Name: "application3", Teams: []string{"team1"}},
		{ID: "8", Cluster: "test-cluster2", Namespace: "kube-system", Name: "application4", Teams: []string{"team1"}},
		{ID: "9", Cluster: "test-cluster2", Namespace: "kube-system", Name: "application5", Teams: []string{"team1"}},
		{ID: "10", Cluster: "test-cluster2", Namespace: "kube-system", Name: "application6", Teams: []string{"team1"}},
	}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveApplications(context.Background(), "test-cluster1", applications1)
	require.NoError(t, err)
	err = c.SaveApplications(context.Background(), "test-cluster2", applications2)
	require.NoError(t, err)

	for _, tt := range []struct {
		name           string
		teams          []string
		groups         []string
		expectedGroups []ApplicationGroup
	}{
		{name: "require groups and teams", teams: nil, groups: nil, expectedGroups: nil},
		{name: "team must be in group", teams: []string{"team2"}, groups: []string{"name", "namespace"}, expectedGroups: nil},
		{name: "return groups", teams: []string{"team1"}, groups: []string{"name", "namespace"}, expectedGroups: []ApplicationGroup{
			{ID: ApplicationGroupID{Cluster: "", Namespace: "default", Name: "application1"}, Clusters: []string{"test-cluster1", "test-cluster2"}, Namespaces: []string{"default", "default"}, Names: []string{"application1", "application1"}, Description: "", Teams: []string{"team1"}},
			{ID: ApplicationGroupID{Cluster: "", Namespace: "default", Name: "application2"}, Clusters: []string{"test-cluster1", "test-cluster2"}, Namespaces: []string{"default", "default"}, Names: []string{"application2", "application2"}, Description: "", Teams: []string{"team1"}},
			{ID: ApplicationGroupID{Cluster: "", Namespace: "kube-system", Name: "application3"}, Clusters: []string{"test-cluster1", "test-cluster2"}, Namespaces: []string{"kube-system", "kube-system"}, Names: []string{"application3", "application3"}, Description: "", Teams: []string{"team1"}},
			{ID: ApplicationGroupID{Cluster: "", Namespace: "kube-system", Name: "application4"}, Clusters: []string{"test-cluster1", "test-cluster2"}, Namespaces: []string{"kube-system", "kube-system"}, Names: []string{"application4", "application4"}, Description: "", Teams: []string{"team1"}},
			{ID: ApplicationGroupID{Cluster: "", Namespace: "kube-system", Name: "application5"}, Clusters: []string{"test-cluster2"}, Namespaces: []string{"kube-system"}, Names: []string{"application5"}, Description: "", Teams: []string{"team1"}},
			{ID: ApplicationGroupID{Cluster: "", Namespace: "kube-system", Name: "application6"}, Clusters: []string{"test-cluster2"}, Namespaces: []string{"kube-system"}, Names: []string{"application6"}, Description: "", Teams: []string{"team1"}},
		}},
		{name: "return groups for multiple teams", teams: []string{"team1", "team2"}, groups: []string{"name", "namespace"}, expectedGroups: []ApplicationGroup{
			{ID: ApplicationGroupID{Cluster: "", Namespace: "default", Name: "application1"}, Clusters: []string{"test-cluster1", "test-cluster2"}, Namespaces: []string{"default", "default"}, Names: []string{"application1", "application1"}, Description: "", Teams: []string{"team1"}},
			{ID: ApplicationGroupID{Cluster: "", Namespace: "default", Name: "application2"}, Clusters: []string{"test-cluster1", "test-cluster2"}, Namespaces: []string{"default", "default"}, Names: []string{"application2", "application2"}, Description: "", Teams: []string{"team1"}},
			{ID: ApplicationGroupID{Cluster: "", Namespace: "kube-system", Name: "application3"}, Clusters: []string{"test-cluster1", "test-cluster2"}, Namespaces: []string{"kube-system", "kube-system"}, Names: []string{"application3", "application3"}, Description: "", Teams: []string{"team1"}},
			{ID: ApplicationGroupID{Cluster: "", Namespace: "kube-system", Name: "application4"}, Clusters: []string{"test-cluster1", "test-cluster2"}, Namespaces: []string{"kube-system", "kube-system"}, Names: []string{"application4", "application4"}, Description: "", Teams: []string{"team1"}},
			{ID: ApplicationGroupID{Cluster: "", Namespace: "kube-system", Name: "application5"}, Clusters: []string{"test-cluster2"}, Namespaces: []string{"kube-system"}, Names: []string{"application5"}, Description: "", Teams: []string{"team1"}},
			{ID: ApplicationGroupID{Cluster: "", Namespace: "kube-system", Name: "application6"}, Clusters: []string{"test-cluster2"}, Namespaces: []string{"kube-system"}, Names: []string{"application6"}, Description: "", Teams: []string{"team1"}},
		}},
	} {
		t.Run(tt.name, func(t *testing.T) {
			storedGroups, err := c.GetApplicationsByGroup(context.Background(), tt.teams, tt.groups)
			require.NoError(t, err)
			require.Equal(t, tt.expectedGroups, storedGroups)
		})
	}
}

func TestGetApplicationByID(t *testing.T) {
	applications := []applicationv1.ApplicationSpec{{
		ID:        "/cluster/test-cluster/namespace/default/name/application1",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "application1",
	}, {
		ID:        "/cluster/test-cluster/namespace/default/name/application2",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "application2",
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveApplications(context.Background(), "test-cluster", applications)
	require.NoError(t, err)

	storedApplication1, err := c.GetApplicationByID(context.Background(), "/cluster/test-cluster/namespace/default/name/application1")
	require.NoError(t, err)
	require.NotNil(t, storedApplication1)

	storedApplication2, err := c.GetApplicationByID(context.Background(), "/cluster/test-cluster/namespace/default/name/application3")
	require.Error(t, err)
	require.Nil(t, storedApplication2)
}

func TestGetDashboardByID(t *testing.T) {
	dashboards := []dashboardv1.DashboardSpec{{
		ID:        "/cluster/test-cluster/namespace/default/name/dashboard1",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "dashboard1",
	}, {
		ID:        "/cluster/test-cluster/namespace/default/name/dashboard2",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "dashboard2",
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveDashboards(context.Background(), "test-cluster", dashboards)
	require.NoError(t, err)

	storedDashboard1, err := c.GetDashboardByID(context.Background(), "/cluster/test-cluster/namespace/default/name/dashboard1")
	require.NoError(t, err)
	require.NotNil(t, storedDashboard1)

	storedDashboard2, err := c.GetDashboardByID(context.Background(), "/cluster/test-cluster/namespace/default/name/dashboard3")
	require.Error(t, err)
	require.Nil(t, storedDashboard2)
}

func TestGetTeamsByIDs(t *testing.T) {
	teams := []teamv1.TeamSpec{{
		ID:        "team1@kobs.io",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "team1",
	}, {
		ID:        "team2@kobs.io",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "team2",
	}, {
		ID:        "team3@kobs.io",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "team3",
	}, {
		ID:        "team3@kobs.io",
		Cluster:   "stage-de1",
		Namespace: "default",
		Name:      "team3",
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveTeams(context.Background(), "test-cluster", teams)
	require.NoError(t, err)

	storedTeams1, err := c.GetTeamsByIDs(context.Background(), []string{"team1@kobs.io"}, "")
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTeams1))

	storedTeams2, err := c.GetTeamsByIDs(context.Background(), []string{"team1@kobs.io", "team2@kobs.io"}, "")
	require.NoError(t, err)
	require.Equal(t, 2, len(storedTeams2))

	storedTeams3, err := c.GetTeamsByIDs(context.Background(), []string{}, "")
	require.NoError(t, err)
	require.Equal(t, 0, len(storedTeams3))

	storedTeams4, err := c.GetTeamsByIDs(context.Background(), nil, "")
	require.NoError(t, err)
	require.Equal(t, 0, len(storedTeams4))

	storedTeams5, err := c.GetTeamsByIDs(context.Background(), []string{"team3@kobs.io"}, "")
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTeams5))

	storedTeams6, err := c.GetTeamsByIDs(context.Background(), []string{"team1@kobs.io", "team2@kobs.io"}, "team2")
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTeams6))
}

func TestGetTeamByID(t *testing.T) {
	teams := []teamv1.TeamSpec{{
		ID:        "team1@kobs.io",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "team1",
		Dashboards: []dashboardv1.Reference{
			{Cluster: "test-cluster", Namespace: "default", Name: "dashboard1", Title: "Dashboard 1"},
		},
	}, {
		ID:        "team2@kobs.io",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "team2",
		Dashboards: []dashboardv1.Reference{
			{Cluster: "test-cluster", Namespace: "default", Name: "dashboard1", Title: "Dashboard 1"},
		},
	}, {
		ID:        "team3@kobs.io",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "team3",
		Dashboards: []dashboardv1.Reference{
			{Cluster: "test-cluster", Namespace: "default", Name: "dashboard1", Title: "Dashboard 1"},
		},
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveTeams(context.Background(), "test-cluster", teams)
	require.NoError(t, err)

	storedTeam1, err := c.GetTeamByID(context.Background(), "team1@kobs.io")
	require.NoError(t, err)
	require.NotNil(t, storedTeam1)

	storedTeam2, err := c.GetTeamByID(context.Background(), "team4@kobs.io")
	require.Error(t, err)
	require.Nil(t, storedTeam2)
}

func TestGetGetUserByID(t *testing.T) {
	users := []userv1.UserSpec{{
		ID:        "user1@kobs.io",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "user1",
	}, {
		ID:        "user2@kobs.io",
		Cluster:   "test-cluster",
		Namespace: "default",
		Name:      "user2",
	}}

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	err := c.SaveUsers(context.Background(), "test-cluster", users)
	require.NoError(t, err)

	storedUser1, err := c.GetUserByID(context.Background(), "user1@kobs.io")
	require.NoError(t, err)
	require.NotNil(t, storedUser1)

	storedUser2, err := c.GetUserByID(context.Background(), "user4@kobs.io")
	require.NoError(t, err)
	require.Nil(t, storedUser2)
}
