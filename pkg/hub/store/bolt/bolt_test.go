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
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/stretchr/testify/require"
)

func TestNewClient(t *testing.T) {
	c1, err1 := NewClient("")
	require.Error(t, err1)
	require.Empty(t, c1)

	c2, err2 := NewClient("/tmp/kobs.db")
	defer os.Remove("/tmp/kobs.db")

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

	c, _ := NewClient("/tmp/kobs.db")
	defer os.Remove("/tmp/kobs.db")

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

	c, _ := NewClient("/tmp/kobs.db")
	defer os.Remove("/tmp/kobs.db")

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

	c, _ := NewClient("/tmp/kobs.db")
	defer os.Remove("/tmp/kobs.db")

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

	c, _ := NewClient("/tmp/kobs.db")
	defer os.Remove("/tmp/kobs.db")

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

	c, _ := NewClient("/tmp/kobs.db")
	defer os.Remove("/tmp/kobs.db")

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

	c, _ := NewClient("/tmp/kobs.db")
	defer os.Remove("/tmp/kobs.db")

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

	c, _ := NewClient("/tmp/kobs.db")
	defer os.Remove("/tmp/kobs.db")

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

	c, _ := NewClient("/tmp/kobs.db")
	defer os.Remove("/tmp/kobs.db")

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
