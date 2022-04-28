package store

import (
	"database/sql"
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestStore(t *testing.T) {

	// Connect to DB and wipe all data
	db, err := sql.Open("sqlite", "file:./test.db?cache=shared")
	if err != nil {
		t.FailNow()
	}
	// Truncate all test data
	_, _ = db.Exec("DROP TABLE specs")

	// Test
	cfg := Config{DSNUri: "file:./test.db?cache=shared"}
	store, err := NewStore(&cfg)
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
	err = store.SaveApplications("test-satellite", applications)
	require.NoError(t, err)

	storedApplication, err := store.GetApplication("test-cluster", "test-namespace1", "test-name1")
	require.NoError(t, err)
	require.Equal(t, applications[0], storedApplication)
}

func TestStore_GetApplicationsBySatellite(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file:./test.db?cache=shared")
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
	cfg := Config{DSNUri: "file:./test.db?cache=shared"}
	store, err := NewStore(&cfg)
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

	storedApplications, err := store.GetApplicationsBySatellite("test-satellite", 1, 0)
	require.NoError(t, err)
	require.Equal(t, applications[0:1:1], storedApplications)

	storedApplications, err = store.GetApplicationsBySatellite("test-satellite", 1, 1)
	require.NoError(t, err)
	require.Equal(t, applications[1:2:2], storedApplications)
}

func TestStore_GetApplicationsByCluster(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file:./test.db?cache=shared")
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
	cfg := Config{DSNUri: "file:./test.db?cache=shared"}
	store, err := NewStore(&cfg)
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

	storedApplications, err := store.GetApplicationsByCluster("test-cluster", 1, 0)
	require.NoError(t, err)
	require.Equal(t, applications[0:1:1], storedApplications)

	storedApplications, err = store.GetApplicationsByCluster("test-cluster", 1, 1)
	require.NoError(t, err)
	require.Equal(t, applications[1:2:2], storedApplications)
}

func TestStore_GetApplicationsByNamespace(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file:./test.db?cache=shared")
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
	cfg := Config{DSNUri: "file:./test.db?cache=shared"}
	store, err := NewStore(&cfg)
	require.NoError(t, err)

	storedApplications, err := store.GetApplicationsByNamespace("test-namespace1", 1, 0)
	require.NoError(t, err)
	require.Equal(t, 1, len(storedApplications))

	storedApplications, err = store.GetApplicationsByNamespace("test-namespace1", 2, 1)
	require.NoError(t, err)
	require.Equal(t, 2, len(storedApplications))

	storedApplications, err = store.GetApplicationsByNamespace("test-namespace1", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 4, len(storedApplications))
}

func TestStore_Dashboards(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file:./test.db?cache=shared")
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
	cfg := Config{DSNUri: "file:./test.db?cache=shared"}
	store, err := NewStore(&cfg)
	require.NoError(t, err)

	err = store.SaveDashboards("test-satellite", dashboards)
	require.NoError(t, err)

	dashboard, err := store.GetDashboard("test-cluster", "test-namespace1", "test-name2")
	require.NoError(t, err)
	require.Equal(t, dashboards[1], dashboard)

	actualDashboards, err := store.GetDashboardsByCluster("test-cluster", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualDashboards))

	actualDashboards, err = store.GetDashboardsByNamespace("test-namespace1", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 2, len(actualDashboards))

	actualDashboards, err = store.GetDashboardsBySatellite("test-satellite", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualDashboards))
}

func TestStore_Teams(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file:./test.db?cache=shared")
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
	cfg := Config{DSNUri: "file:./test.db?cache=shared"}
	store, err := NewStore(&cfg)
	require.NoError(t, err)

	err = store.SaveTeams("test-satellite", teams)
	require.NoError(t, err)

	team, err := store.GetTeam("test-cluster", "test-namespace1", "test-name2")
	require.NoError(t, err)
	require.Equal(t, teams[1], team)

	actualTeams, err := store.GetTeamByCluster("test-cluster", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualTeams))

	actualTeams, err = store.GetTeamsByNamespace("test-namespace1", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 2, len(actualTeams))

	actualTeams, err = store.GetTeamsBySatellite("test-satellite", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualTeams))
}

func TestStore_Users(t *testing.T) {
	// Prepare
	db, err := sql.Open("sqlite", "file:./test.db?cache=shared")
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
	cfg := Config{DSNUri: "file:./test.db?cache=shared"}
	store, err := NewStore(&cfg)
	require.NoError(t, err)

	err = store.SaveUsers("test-satellite", users)
	require.NoError(t, err)

	user, err := store.GetUser("test-cluster", "test-namespace1", "test-name2")
	require.NoError(t, err)
	require.Equal(t, users[1], user)

	actualUsers, err := store.GetUsersByCluster("test-cluster", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualUsers))

	actualUsers, err = store.GetUsersByNamespace("test-namespace1", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 2, len(actualUsers))

	actualUsers, err = store.GetUsersBySatellite("test-satellite", 10, 0)
	require.NoError(t, err)
	require.Equal(t, 3, len(actualUsers))
}
