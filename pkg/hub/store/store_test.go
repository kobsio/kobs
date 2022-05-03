package store

import (
	"context"
	"database/sql"
	"testing"

	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/stretchr/testify/require"
)

func TestStore_Plugins(t *testing.T) {
	client, err := NewClient("sqlite", "file::memory:?cache=shared")
	require.NoError(t, err)

	instances := []plugin.Instance{{
		Name:        "plugin1",
		Type:        "prometheus",
		Description: "",
		Address:     "",
	}, {
		Name:        "plugin2",
		Type:        "prometheus",
		Description: "description for prometheus",
		Address:     "https://prometheus.kobs.io",
	}}

	err = client.SavePlugins("test.satellite", instances)
	require.NoError(t, err)

	storedInstances, err := client.GetPlugins(context.Background())
	require.NoError(t, err)
	require.Equal(t, instances, storedInstances)
}

func TestStore_GetClusters(t *testing.T) {
	client, err := NewClient("sqlite", "file::memory:?cache=shared")
	require.NoError(t, err)

	clusters := []string{"cluster1", "cluster2"}

	err = client.SaveClusters("test-satellite", clusters)
	require.NoError(t, err)

	storedClusters, err := client.GetClusters(context.Background())
	require.NoError(t, err)
	require.Equal(t, clusters, storedClusters)
}

func TestStore(t *testing.T) {

	// Connect to DB and wipe all data
	db, err := sql.Open("sqlite", "file::memory:?cache=shared")
	if err != nil {
		t.FailNow()
	}
	// Truncate all test data
	_, _ = db.Exec("DROP TABLE specs")

	// Test
	client, err := NewClient("sqlite", "file::memory:?cache=shared")
	require.NoError(t, err)

	applications := []applicationv1.ApplicationSpec{{
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name1",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name2",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace2",
		Name:      "test-name3",
	},
	}
	err = client.SaveApplications("test-satellite", applications)
	require.NoError(t, err)

	storedApplication, err := client.GetApplication("test-cluster", "test-namespace1", "test-name1")
	require.NoError(t, err)
	require.Equal(t, applications[0], storedApplication)
}

func TestStore_GetApplicationsBySatellite(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file::memory:?cache=shared")
	if err != nil {
		t.FailNow()
	}
	// Truncate all test data
	_, _ = db.Exec("DROP TABLE specs")
	// Setup schema
	_, _ = db.Exec(schema)
	// Insert test data
	_, err = db.Exec("INSERT INTO specs VALUES " +
		"('application', 'test-cluster', 'test-namespace1', 'test-name1', 'test-satellite', '{\"cluster\":\"test-cluster\",\"namespace\":\"test-namespace1\",\"name\":\"test-name1\",\"topology\":{}}' )," +
		"('application', 'test-cluster', 'test-namespace1', 'test-name2', 'test-satellite', '{\"cluster\":\"test-cluster\",\"namespace\":\"test-namespace1\",\"name\":\"test-name2\",\"topology\":{}}' )," +
		"('application', 'test-cluster', 'test-namespace2', 'test-name3', 'test-satellite', '{\"cluster\":\"test-cluster\",\"namespace\":\"test-namespace2\",\"name\":\"test-name3\",\"topology\":{}}' )," +
		"('application', 'dummy', 'test-namespace1', 'test-name1', 'dummy-satellite', '{\"cluster\":\"dummy\",\"namespace\":\"test-namespace1\",\"name\":\"test-name1\",\"topology\":{}}' )," +
		"('application', 'dummy', 'test-namespace1', 'test-name2', 'dummy-satellite', '{\"cluster\":\"dummy\",\"namespace\":\"test-namespace1\",\"name\":\"test-name2\",\"topology\":{}}' )," +
		"('application', 'dummy', 'test-namespace2', 'test-name3', 'dummy-satellite', '{\"cluster\":\"dummy\",\"namespace\":\"test-namespace2\",\"name\":\"test-name3\",\"topology\":{}}' )" +
		"")

	// Test
	client, err := NewClient("sqlite", "file::memory:?cache=shared")
	require.NoError(t, err)

	applications := []applicationv1.ApplicationSpec{{
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name1",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name2",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace2",
		Name:      "test-name3",
	},
	}

	storedApplications, err := client.GetApplicationsBySatellite("test-satellite", 1, 0)
	require.NoError(t, err)
	require.Equal(t, applications[0:1:1], storedApplications)

	storedApplications, err = client.GetApplicationsBySatellite("test-satellite", 1, 1)
	require.NoError(t, err)
	require.Equal(t, applications[1:2:2], storedApplications)
}

func TestStore_GetApplicationsByCluster(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file::memory:?cache=shared")
	if err != nil {
		t.FailNow()
	}
	// Truncate all test data
	_, _ = db.Exec("DROP TABLE specs")
	// Setup schema
	_, _ = db.Exec(schema)
	// Insert test data
	_, err = db.Exec("INSERT INTO specs VALUES " +
		"('application', 'test-cluster', 'test-namespace1', 'test-name1', 'test-satellite', '{\"cluster\":\"test-cluster\",\"namespace\":\"test-namespace1\",\"name\":\"test-name1\",\"topology\":{}}' )," +
		"('application', 'test-cluster', 'test-namespace1', 'test-name2', 'test-satellite', '{\"cluster\":\"test-cluster\",\"namespace\":\"test-namespace1\",\"name\":\"test-name2\",\"topology\":{}}' )," +
		"('application', 'test-cluster', 'test-namespace2', 'test-name3', 'test-satellite', '{\"cluster\":\"test-cluster\",\"namespace\":\"test-namespace2\",\"name\":\"test-name3\",\"topology\":{}}' )," +
		"('application', 'dummy', 'test-namespace1', 'test-name1', 'dummy-satellite', '{\"cluster\":\"dummy\",\"namespace\":\"test-namespace1\",\"name\":\"test-name1\",\"topology\":{}}' )," +
		"('application', 'dummy', 'test-namespace1', 'test-name2', 'dummy-satellite', '{\"cluster\":\"dummy\",\"namespace\":\"test-namespace1\",\"name\":\"test-name2\",\"topology\":{}}' )," +
		"('application', 'dummy', 'test-namespace2', 'test-name3', 'dummy-satellite', '{\"cluster\":\"dummy\",\"namespace\":\"test-namespace2\",\"name\":\"test-name3\",\"topology\":{}}' )" +
		"")

	// Test
	client, err := NewClient("sqlite", "file::memory:?cache=shared")
	require.NoError(t, err)

	applications := []applicationv1.ApplicationSpec{{
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name1",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name2",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace2",
		Name:      "test-name3",
	},
	}

	storedApplications, err := client.GetApplicationsByCluster("test-cluster", 1, 0)
	require.NoError(t, err)
	require.Equal(t, applications[0:1:1], storedApplications)

	storedApplications, err = client.GetApplicationsByCluster("test-cluster", 1, 1)
	require.NoError(t, err)
	require.Equal(t, applications[1:2:2], storedApplications)
}

func TestStore_GetApplicationsByNamespace(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file::memory:?cache=shared")
	if err != nil {
		t.FailNow()
	}
	// Truncate all test data
	_, _ = db.Exec("DROP TABLE specs")
	// Setup schema
	_, _ = db.Exec(schema)
	// Insert test data
	_, err = db.Exec("INSERT INTO specs VALUES " +
		"('application', 'test-cluster', 'test-namespace1', 'test-name1', 'test-satellite', '{\"cluster\":\"test-cluster\",\"namespace\":\"test-namespace1\",\"name\":\"test-name1\",\"topology\":{}}' )," +
		"('application', 'test-cluster', 'test-namespace1', 'test-name2', 'test-satellite', '{\"cluster\":\"test-cluster\",\"namespace\":\"test-namespace1\",\"name\":\"test-name2\",\"topology\":{}}' )," +
		"('application', 'test-cluster', 'test-namespace2', 'test-name3', 'test-satellite', '{\"cluster\":\"test-cluster\",\"namespace\":\"test-namespace2\",\"name\":\"test-name3\",\"topology\":{}}' )," +
		"('application', 'dummy', 'test-namespace1', 'test-name1', 'dummy-satellite', '{\"cluster\":\"dummy\",\"namespace\":\"test-namespace1\",\"name\":\"test-name1\",\"topology\":{}}' )," +
		"('application', 'dummy', 'test-namespace1', 'test-name2', 'dummy-satellite', '{\"cluster\":\"dummy\",\"namespace\":\"test-namespace1\",\"name\":\"test-name2\",\"topology\":{}}' )," +
		"('application', 'dummy', 'test-namespace2', 'test-name3', 'dummy-satellite', '{\"cluster\":\"dummy\",\"namespace\":\"test-namespace2\",\"name\":\"test-name3\",\"topology\":{}}' )" +
		"")

	// Test
	client, err := NewClient("sqlite", "file::memory:?cache=shared")
	require.NoError(t, err)

	storedApplications, err := client.GetApplicationsByNamespace("test-namespace1", 1, 0)
	require.NoError(t, err)
	require.Equal(t, 1, len(storedApplications))

	storedApplications, err = client.GetApplicationsByNamespace("test-namespace1", 2, 1)
	require.NoError(t, err)
	require.Equal(t, 2, len(storedApplications))

	storedApplications, err = client.GetApplicationsByNamespace("test-namespace1", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 4, len(storedApplications))
}

func TestStore_Dashboards(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file::memory:?cache=shared")
	if err != nil {
		t.FailNow()
	}
	// Truncate all test data
	_, _ = db.Exec("DROP TABLE specs")
	// Setup schema
	_, _ = db.Exec(schema)
	// Insert test data

	dashboards := []dashboardv1.DashboardSpec{{
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name1",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name2",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace2",
		Name:      "test-name3",
	},
	}

	// Test
	client, err := NewClient("sqlite", "file::memory:?cache=shared")
	require.NoError(t, err)

	err = client.SaveDashboards("test-satellite", dashboards)
	require.NoError(t, err)

	dashboard, err := client.GetDashboard("test-cluster", "test-namespace1", "test-name2")
	require.NoError(t, err)
	require.Equal(t, dashboards[1], dashboard)

	actualDashboards, err := client.GetDashboardsByCluster("test-cluster", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualDashboards))

	actualDashboards, err = client.GetDashboardsByNamespace("test-namespace1", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 2, len(actualDashboards))

	actualDashboards, err = client.GetDashboardsBySatellite("test-satellite", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualDashboards))
}

func TestStore_Teams(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file::memory:?cache=shared")
	if err != nil {
		t.FailNow()
	}
	// Truncate all test data
	_, _ = db.Exec("DROP TABLE specs")
	// Setup schema
	_, _ = db.Exec(schema)
	// Insert test data

	teams := []teamv1.TeamSpec{{
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name1",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name2",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace2",
		Name:      "test-name3",
	},
	}

	// Test
	client, err := NewClient("sqlite", "file::memory:?cache=shared")
	require.NoError(t, err)

	err = client.SaveTeams("test-satellite", teams)
	require.NoError(t, err)

	team, err := client.GetTeam("test-cluster", "test-namespace1", "test-name2")
	require.NoError(t, err)
	require.Equal(t, teams[1], team)

	actualTeams, err := client.GetTeamByCluster("test-cluster", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualTeams))

	actualTeams, err = client.GetTeamsByNamespace("test-namespace1", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 2, len(actualTeams))

	actualTeams, err = client.GetTeamsBySatellite("test-satellite", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualTeams))
}

func TestStore_Users(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file::memory:?cache=shared")
	if err != nil {
		t.FailNow()
	}
	// Truncate all test data
	_, _ = db.Exec("DROP TABLE specs")
	// Setup schema
	_, _ = db.Exec(schema)
	// Insert test data

	users := []userv1.UserSpec{{
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name1",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace1",
		Name:      "test-name2",
	}, {
		Cluster:   "test-cluster",
		Namespace: "test-namespace2",
		Name:      "test-name3",
	},
	}

	// Test
	client, err := NewClient("sqlite", "file::memory:?cache=shared")
	require.NoError(t, err)

	err = client.SaveUsers("test-satellite", users)
	require.NoError(t, err)

	user, err := client.GetUser("test-cluster", "test-namespace1", "test-name2")
	require.NoError(t, err)
	require.Equal(t, users[1], user)

	actualUsers, err := client.GetUsersByCluster("test-cluster", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualUsers))

	actualUsers, err = client.GetUsersByNamespace("test-namespace1", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 2, len(actualUsers))

	actualUsers, err = client.GetUsersBySatellite("test-satellite", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualUsers))
}
