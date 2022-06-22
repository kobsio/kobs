package bolt

import (
	"context"
	"os"
	"testing"
	"time"

	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/stretchr/testify/require"
)

// func TestPrepare(t *testing.T) {
// 	applicationsSatellite1 := []applicationv1.ApplicationSpec{
// 		{Cluster: "dev-de1", Namespace: "default", Name: "application1", Description: "This is a test", Teams: []string{"team1"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "dev-de1", Namespace: "default", Name: "application2", Description: "This is a test", Teams: []string{"team1", "team2"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "dev-de1", Namespace: "default", Name: "application3", Teams: []string{"team3"}, Tags: []string{}, Topology: applicationv1.Topology{External: true}},
// 		{Cluster: "stage-de1", Namespace: "default", Name: "application4", Teams: []string{"team1", "team2", "team3"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "default", Name: "application5", Teams: []string{}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application6", Description: "This is a test", Teams: []string{"team1"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application7", Description: "This is a test", Teams: []string{}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application8", Teams: []string{"team3"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application9", Teams: []string{"team1"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application10", Teams: []string{}, Tags: []string{"core", "provider", "logging"}, Topology: applicationv1.Topology{External: true}},
// 	}
// 	applicationsSatellite2 := []applicationv1.ApplicationSpec{
// 		{Cluster: "dev-de1", Namespace: "default", Name: "application1", Teams: []string{"team1"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "dev-de1", Namespace: "default", Name: "application2", Teams: []string{"team1", "team2"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "dev-de1", Namespace: "default", Name: "application3", Description: "This is a test", Teams: []string{"team3"}, Tags: []string{}, Topology: applicationv1.Topology{External: true}},
// 		{Cluster: "stage-de1", Namespace: "default", Name: "application4", Description: "This is a test", Teams: []string{"team1", "team2", "team3"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "default", Name: "application5", Description: "This is a test", Teams: []string{}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application6", Teams: []string{"team1"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application7", Teams: []string{}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application8", Description: "This is a test", Teams: []string{"team3"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application9", Description: "This is a test", Teams: []string{"team1"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
// 		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application10", Description: "This is a test", Teams: []string{}, Tags: []string{"core", "provider", "logging"}, Topology: applicationv1.Topology{External: true}},
// 	}

// 	c, err := NewClient("/tmp/kobs.db")
// 	require.NoError(t, err)

// 	err = c.SaveApplications(context.Background(), "satellite1", applicationsSatellite1)
// 	require.NoError(t, err)
// 	err = c.SaveApplications(context.Background(), "satellite2", applicationsSatellite2)
// 	require.NoError(t, err)

// 	err = c.SaveTags(context.Background(), applicationsSatellite1)
// 	require.NoError(t, err)
// 	err = c.SaveTags(context.Background(), applicationsSatellite2)
// 	require.NoError(t, err)

// 	err = c.SaveClusters(context.Background(), "satellite1", []string{"dev-de1", "stage-de1"})
// 	require.NoError(t, err)
// 	err = c.SaveClusters(context.Background(), "satellite2", []string{"dev-de1", "stage-de1"})
// 	require.NoError(t, err)

// 	err = c.SaveNamespaces(context.Background(), "satellite1", map[string][]string{"dev-de1": {"default"}, "stage-de1": {"default", "kube-system"}})
// 	require.NoError(t, err)
// 	err = c.SaveNamespaces(context.Background(), "satellite2", map[string][]string{"dev-de1": {"default"}, "stage-de1": {"default", "kube-system"}})
// 	require.NoError(t, err)
// }

func TestNewClient(t *testing.T) {
	c1, err1 := NewClient("")
	require.Error(t, err1)
	require.Empty(t, c1)

	c2, err2 := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	require.NoError(t, err2)
	require.NotEmpty(t, c2)
}

func TestSaveAndGetPlugins(t *testing.T) {
	plugins := []plugin.Instance{{
		Name: "dev-de1",
		Type: "prometheus",
	}, {
		Name: "dev-de1",
		Type: "klogs",
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SavePlugins(context.Background(), "test-satellite", plugins)
	require.NoError(t, err)

	storedPlugins1, err := c.GetPlugins(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedPlugins1))

	time.Sleep(2 * time.Second)

	err = c.SavePlugins(context.Background(), "test-satellite", plugins[0:1])
	require.NoError(t, err)

	storedPlugins2, err := c.GetPlugins(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedPlugins2))
}

func TestSaveAndGetClusters(t *testing.T) {
	clusters := []string{"dev-de1", "stage-de1"}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveClusters(context.Background(), "test-satellite", clusters)
	require.NoError(t, err)

	storedClusters1, err := c.GetClusters(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedClusters1))

	time.Sleep(2 * time.Second)

	err = c.SaveClusters(context.Background(), "test-satellite", clusters[0:1])
	require.NoError(t, err)

	storedClusters2, err := c.GetClusters(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedClusters2))
}

func TestSaveAndGetNamespaces(t *testing.T) {
	var namespaces1 map[string][]string
	namespaces1 = make(map[string][]string)
	namespaces1["dev-de1"] = []string{"default", "kube-system"}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveNamespaces(context.Background(), "test-satellite", namespaces1)
	require.NoError(t, err)

	storedNamespaces1, err := c.GetNamespaces(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedNamespaces1))

	time.Sleep(2 * time.Second)

	var namespaces2 map[string][]string
	namespaces2 = make(map[string][]string)
	namespaces2["dev-de1"] = []string{"default"}

	err = c.SaveNamespaces(context.Background(), "test-satellite", namespaces2)
	require.NoError(t, err)

	storedNamespaces2, err := c.GetNamespaces(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedNamespaces2))
}

func TestSaveAndGetCRDs(t *testing.T) {
	crds1 := []cluster.CRD{
		{ID: "resource1.path1/v1", Resource: "resource1", Path: "path1/v1"},
		{ID: "resource2.path2/v2", Resource: "resource2", Path: "path2/v2"},
	}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

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
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "application1",
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "application2",
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveApplications(context.Background(), "test-satellite", applications)
	require.NoError(t, err)

	storedApplications1, err := c.GetApplications(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedApplications1))

	time.Sleep(2 * time.Second)

	err = c.SaveApplications(context.Background(), "test-satellite", applications[0:1])
	require.NoError(t, err)

	storedApplications2, err := c.GetApplications(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedApplications2))
}

func TestSaveAndGetDashboards(t *testing.T) {
	dashboards := []dashboardv1.DashboardSpec{{
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "dashboard1",
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "dashboard2",
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveDashboards(context.Background(), "test-satellite", dashboards)
	require.NoError(t, err)

	storedDashboards1, err := c.GetDashboards(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedDashboards1))

	time.Sleep(2 * time.Second)

	err = c.SaveDashboards(context.Background(), "test-satellite", dashboards[0:1])
	require.NoError(t, err)

	storedDashboards2, err := c.GetDashboards(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedDashboards2))
}

func TestSaveAndGetTeams(t *testing.T) {
	teams := []teamv1.TeamSpec{{
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "team1",
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "team2",
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveTeams(context.Background(), "test-satellite", teams)
	require.NoError(t, err)

	storedTeams1, err := c.GetTeams(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedTeams1))

	time.Sleep(2 * time.Second)

	err = c.SaveTeams(context.Background(), "test-satellite", teams[0:1])
	require.NoError(t, err)

	storedTeams2, err := c.GetTeams(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTeams2))
}

func TestSaveAndGetUsers(t *testing.T) {
	users := []userv1.UserSpec{{
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "user1",
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "user2",
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveUsers(context.Background(), "test-satellite", users)
	require.NoError(t, err)

	storedUsers1, err := c.GetUsers(context.Background())
	require.NoError(t, err)
	require.Equal(t, 2, len(storedUsers1))

	time.Sleep(2 * time.Second)

	err = c.SaveUsers(context.Background(), "test-satellite", users[0:1])
	require.NoError(t, err)

	storedUsers2, err := c.GetUsers(context.Background())
	require.NoError(t, err)
	require.Equal(t, 1, len(storedUsers2))
}

func TestSaveAndGetTags(t *testing.T) {
	applications := []applicationv1.ApplicationSpec{{
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "application1",
		Tags:      []string{"tag1", "tag2", "tag3"},
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "application2",
		Tags:      []string{"tag3", "tag4", "tag5"},
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveTags(context.Background(), applications)
	require.NoError(t, err)

	storedTags1, err := c.GetTags(context.Background())
	require.NoError(t, err)
	require.Equal(t, 5, len(storedTags1))
}

func TestSaveAndGetTopology(t *testing.T) {
	applications := []applicationv1.ApplicationSpec{{
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "application1",
		Topology: applicationv1.Topology{
			Dependencies: []applicationv1.Dependency{{
				Cluster:   "dev-de1",
				Namespace: "default",
				Name:      "application2",
			}},
		},
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "application2",
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveTopology(context.Background(), "test-satellite", applications)
	require.NoError(t, err)

	storedTopology1, err := c.GetTopologyByIDs(context.Background(), "TargetID", []string{"/satellite/test-satellite/cluster/dev-de1/namespace/default/name/application2"})
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTopology1))

	storedTopology2, err := c.GetTopologyByIDs(context.Background(), "SourceID", []string{"/satellite/test-satellite/cluster/dev-de1/namespace/default/name/application1"})
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTopology2))
}

func TestGetNamespacesByClusterIDs(t *testing.T) {
	var namespaces map[string][]string
	namespaces = make(map[string][]string)
	namespaces["dev-de1"] = []string{"default", "kube-system"}
	namespaces["stage-de1"] = []string{"default", "kube-system", "istio-system"}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveNamespaces(context.Background(), "test-satellite", namespaces)
	require.NoError(t, err)

	storedNamespaces1, err := c.GetNamespacesByClusterIDs(context.Background(), []string{"/satellite/test-satellite/cluster/dev-de1"})
	require.NoError(t, err)
	require.Equal(t, 2, len(storedNamespaces1))

	storedNamespaces2, err := c.GetNamespacesByClusterIDs(context.Background(), []string{"/satellite/test-satellite/cluster/dev-de1", "/satellite/test-satellite/cluster/stage-de1"})
	require.NoError(t, err)
	require.Equal(t, 5, len(storedNamespaces2))

	storedNamespaces3, err := c.GetNamespacesByClusterIDs(context.Background(), []string{})
	require.NoError(t, err)
	require.Equal(t, 0, len(storedNamespaces3))

	storedNamespaces4, err := c.GetNamespacesByClusterIDs(context.Background(), nil)
	require.NoError(t, err)
	require.Equal(t, 0, len(storedNamespaces4))
}

func TestGetCRDByID(t *testing.T) {
	crds := []cluster.CRD{
		{ID: "resource1.path1/v1", Resource: "resource1", Path: "path1/v1"},
		{ID: "resource2.path2/v2", Resource: "resource2", Path: "path2/v2"},
	}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

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
	applications := []applicationv1.ApplicationSpec{
		{Cluster: "dev-de1", Namespace: "default", Name: "application1", Teams: []string{"team1"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
		{Cluster: "dev-de1", Namespace: "default", Name: "application2", Teams: []string{"team1", "team2"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
		{Cluster: "dev-de1", Namespace: "default", Name: "application3", Teams: []string{"team3"}, Tags: []string{}, Topology: applicationv1.Topology{External: true}},
		{Cluster: "stage-de1", Namespace: "default", Name: "application4", Teams: []string{"team1", "team2", "team3"}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
		{Cluster: "stage-de1", Namespace: "default", Name: "application5", Teams: []string{}, Tags: []string{"monitoring", "observability"}, Topology: applicationv1.Topology{External: false}},
		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application6", Teams: []string{"team1"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application7", Teams: []string{}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application8", Teams: []string{"team3"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application9", Teams: []string{"team1"}, Tags: []string{"core", "provider"}, Topology: applicationv1.Topology{External: false}},
		{Cluster: "stage-de1", Namespace: "kube-system", Name: "application10", Teams: []string{}, Tags: []string{"core", "provider", "logging"}, Topology: applicationv1.Topology{External: true}},
	}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveApplications(context.Background(), "test-satellite", applications)
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
		clusterIDs           []string
		namespaceIDs         []string
		tags                 []string
		searchTerm           string
		external             string
		limit                int
		offset               int
		expectedError        bool
		expectedApplications []string
		expectedCount        int
	}{
		{name: "searchTerm can not be compiled to regexp", teams: nil, clusterIDs: nil, namespaceIDs: nil, tags: nil, searchTerm: "*", external: "include", limit: 100, offset: 0, expectedError: true, expectedApplications: nil, expectedCount: 0},
		{name: "no filters", teams: nil, clusterIDs: nil, namespaceIDs: nil, tags: nil, searchTerm: "", external: "include", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application1", "application10", "application2", "application3", "application4", "application5", "application6", "application7", "application8", "application9"}, expectedCount: 10},
		{name: "no filters but limit", teams: nil, clusterIDs: nil, namespaceIDs: nil, tags: nil, searchTerm: "", external: "include", limit: 5, offset: 0, expectedError: false, expectedApplications: []string{"application1", "application10", "application2", "application3", "application4"}, expectedCount: 10},
		{name: "no filters but limit and offset", teams: nil, clusterIDs: nil, namespaceIDs: nil, tags: nil, searchTerm: "", external: "include", limit: 5, offset: 5, expectedError: false, expectedApplications: []string{"application5", "application6", "application7", "application8", "application9"}, expectedCount: 10},
		{name: "only searchTerm", teams: nil, clusterIDs: nil, namespaceIDs: nil, tags: nil, searchTerm: "application1", external: "include", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application1", "application10"}, expectedCount: 2},
		{name: "filter by team", teams: []string{"team2"}, clusterIDs: nil, namespaceIDs: nil, tags: nil, searchTerm: "", external: "include", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application2", "application4"}, expectedCount: 2},
		{name: "filter by teams", teams: []string{"team1", "team3"}, clusterIDs: nil, namespaceIDs: nil, tags: nil, searchTerm: "", external: "include", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application1", "application2", "application3", "application4", "application6", "application8", "application9"}, expectedCount: 7},
		{name: "filter by cluster and namespace", teams: nil, clusterIDs: []string{"/satellite/test-satellite/cluster/dev-de1", "/satellite/test-satellite/cluster/stage-de1"}, namespaceIDs: []string{"/satellite/test-satellite/cluster/dev-de1/namespace/default", "/satellite/test-satellite/cluster/stage-de1/namespace/default"}, tags: nil, searchTerm: "", external: "include", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application1", "application2", "application3", "application4", "application5"}, expectedCount: 5},
		{name: "filter by cluster and namespace but exclude external", teams: nil, clusterIDs: []string{"/satellite/test-satellite/cluster/dev-de1", "/satellite/test-satellite/cluster/stage-de1"}, namespaceIDs: []string{"/satellite/test-satellite/cluster/dev-de1/namespace/default", "/satellite/test-satellite/cluster/stage-de1/namespace/default"}, tags: nil, searchTerm: "", external: "exclude", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application1", "application2", "application4", "application5"}, expectedCount: 4},
		{name: "filter by cluster and namespace but onyl external", teams: nil, clusterIDs: []string{"/satellite/test-satellite/cluster/dev-de1", "/satellite/test-satellite/cluster/stage-de1"}, namespaceIDs: []string{"/satellite/test-satellite/cluster/dev-de1/namespace/default", "/satellite/test-satellite/cluster/stage-de1/namespace/default"}, tags: nil, searchTerm: "", external: "only", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application3"}, expectedCount: 1},
		{name: "filter by tags", teams: nil, clusterIDs: nil, namespaceIDs: nil, tags: []string{"logging"}, searchTerm: "", external: "include", limit: 100, offset: 0, expectedError: false, expectedApplications: []string{"application10"}, expectedCount: 1},
	} {
		t.Run(tt.name, func(t *testing.T) {
			storedApplications, err := c.GetApplicationsByFilter(context.Background(), tt.teams, tt.clusterIDs, tt.namespaceIDs, tt.tags, tt.searchTerm, tt.external, tt.limit, tt.offset)
			if tt.expectedError {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
			require.Equal(t, tt.expectedApplications, getApplicationsNames(storedApplications))

			count, err := c.GetApplicationsByFilterCount(context.Background(), tt.teams, tt.clusterIDs, tt.namespaceIDs, tt.tags, tt.searchTerm, tt.external)
			if tt.expectedError {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
			require.Equal(t, tt.expectedCount, count)
		})
	}
}

func TestGetApplicationByID(t *testing.T) {
	applications := []applicationv1.ApplicationSpec{{
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "application1",
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "application2",
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveApplications(context.Background(), "test-satellite", applications)
	require.NoError(t, err)

	storedApplication1, err := c.GetApplicationByID(context.Background(), "/satellite/test-satellite/cluster/dev-de1/namespace/default/name/application1")
	require.NoError(t, err)
	require.NotNil(t, storedApplication1)

	storedApplication2, err := c.GetApplicationByID(context.Background(), "/satellite/test-satellite/cluster/dev-de1/namespace/default/name/application3")
	require.Error(t, err)
	require.Nil(t, storedApplication2)
}

func TestGetDashboardByID(t *testing.T) {
	dashboards := []dashboardv1.DashboardSpec{{
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "dashboard1",
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "dashboard2",
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveDashboards(context.Background(), "test-satellite", dashboards)
	require.NoError(t, err)

	storedDashboard1, err := c.GetDashboardByID(context.Background(), "/satellite/test-satellite/cluster/dev-de1/namespace/default/name/dashboard1")
	require.NoError(t, err)
	require.NotNil(t, storedDashboard1)

	storedDashboard2, err := c.GetDashboardByID(context.Background(), "/satellite/test-satellite/cluster/dev-de1/namespace/default/name/dashboard3")
	require.Error(t, err)
	require.Nil(t, storedDashboard2)
}

func TestGetTeamsByGroups(t *testing.T) {
	teams := []teamv1.TeamSpec{{
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "team1",
		Group:     "team1@kobs.io",
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "team2",
		Group:     "team2@kobs.io",
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "team3",
		Group:     "team3@kobs.io",
	}, {
		Cluster:   "stage-de1",
		Namespace: "default",
		Name:      "team3",
		Group:     "team3@kobs.io",
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveTeams(context.Background(), "test-satellite", teams)
	require.NoError(t, err)

	storedTeams1, err := c.GetTeamsByGroups(context.Background(), []string{"team1@kobs.io"})
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTeams1))

	storedTeams2, err := c.GetTeamsByGroups(context.Background(), []string{"team1@kobs.io", "team2@kobs.io"})
	require.NoError(t, err)
	require.Equal(t, 2, len(storedTeams2))

	storedTeams3, err := c.GetTeamsByGroups(context.Background(), []string{})
	require.NoError(t, err)
	require.Equal(t, 0, len(storedTeams3))

	storedTeams4, err := c.GetTeamsByGroups(context.Background(), nil)
	require.NoError(t, err)
	require.Equal(t, 0, len(storedTeams4))

	storedTeams5, err := c.GetTeamsByGroups(context.Background(), []string{"team3@kobs.io"})
	require.NoError(t, err)
	require.Equal(t, 2, len(storedTeams5))
}

func TestGetTeamByGroup(t *testing.T) {
	teams := []teamv1.TeamSpec{{
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "team1",
		Group:     "team1@kobs.io",
		Dashboards: []dashboardv1.Reference{
			{Cluster: "dev-de1", Namespace: "default", Name: "dashboard1", Title: "Dashboard 1"},
		},
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "team2",
		Group:     "team2@kobs.io",
		Dashboards: []dashboardv1.Reference{
			{Cluster: "dev-de1", Namespace: "default", Name: "dashboard1", Title: "Dashboard 1"},
		},
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "team3",
		Group:     "team3@kobs.io",
		Dashboards: []dashboardv1.Reference{
			{Cluster: "dev-de1", Namespace: "default", Name: "dashboard1", Title: "Dashboard 1"},
		},
	}, {
		Cluster:   "stage-de1",
		Namespace: "default",
		Name:      "team3",
		Group:     "team3@kobs.io",
		Dashboards: []dashboardv1.Reference{
			{Cluster: "dev-de1", Namespace: "default", Name: "dashboard1", Title: "Dashboard 1"},
		},
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveTeams(context.Background(), "test-satellite", teams)
	require.NoError(t, err)

	storedTeam1, err := c.GetTeamByGroup(context.Background(), "team1@kobs.io")
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTeam1.Dashboards))

	storedTeam2, err := c.GetTeamByGroup(context.Background(), "team3@kobs.io")
	require.NoError(t, err)
	require.Equal(t, 2, len(storedTeam2.Dashboards))

	storedTeam3, err := c.GetTeamByGroup(context.Background(), "team4@kobs.io")
	require.Error(t, err)
	require.Nil(t, storedTeam3)
}

func TestGetGetUsersByEmail(t *testing.T) {
	users := []userv1.UserSpec{{
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "user1",
		Email:     "user1@kobs.io",
	}, {
		Cluster:   "dev-de1",
		Namespace: "default",
		Name:      "user2",
		Email:     "user2@kobs.io",
	}, {
		Cluster:   "stage-de1",
		Namespace: "default",
		Name:      "user2",
		Email:     "user2@kobs.io",
	}}

	c, _ := NewClient("/tmp/kobs-test.db")
	defer os.Remove("/tmp/kobs-test.db")

	err := c.SaveUsers(context.Background(), "test-satellite", users)
	require.NoError(t, err)

	storedTeams1, err := c.GetUsersByEmail(context.Background(), "user1@kobs.io")
	require.NoError(t, err)
	require.Equal(t, 1, len(storedTeams1))

	storedTeams2, err := c.GetUsersByEmail(context.Background(), "user3@kobs.io")
	require.NoError(t, err)
	require.Equal(t, 0, len(storedTeams2))

	storedTeams3, err := c.GetUsersByEmail(context.Background(), "")
	require.NoError(t, err)
	require.Equal(t, 0, len(storedTeams3))

	storedTeams4, err := c.GetUsersByEmail(context.Background(), "user2@kobs.io")
	require.NoError(t, err)
	require.Equal(t, 2, len(storedTeams4))
}
