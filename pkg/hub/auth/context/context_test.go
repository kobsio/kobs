package context

import (
	"context"
	"testing"

	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"

	"github.com/stretchr/testify/require"
)

func TestHasApplicationAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{Teams: []string{"*"}, ID: "user1@kobs.io", Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}, expectedHasAccess: true},
		{user: User{Teams: []string{"team1"}, ID: "user2@kobs.io", Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}, expectedHasAccess: true},
		{user: User{Teams: []string{"team2"}, ID: "user3@kobs.io", Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}, expectedHasAccess: true},
		{user: User{Teams: []string{"*"}, ID: "user4@kobs.io", Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}}, expectedHasAccess: false},
		{user: User{Teams: []string{"team1"}, ID: "user5@kobs.io", Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}}, expectedHasAccess: true},
		{user: User{Teams: []string{"team2"}, ID: "user6@kobs.io", Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}}, expectedHasAccess: false},
		{user: User{Teams: []string{"team1"}, ID: "user7@kobs.io", Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom"}}}}, expectedHasAccess: false},
		{user: User{Teams: []string{"team1"}, ID: "user8@kobs.io", Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Clusters: []string{"stage-de1"}}}}}, expectedHasAccess: false},
		{user: User{Teams: []string{"team1"}, ID: "user9@kobs.io", Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Clusters: []string{"dev-de1"}, Namespaces: []string{"kube-system"}}}}}, expectedHasAccess: false},
		{user: User{Teams: []string{"team1"}, ID: "user10@kobs.io", Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Clusters: []string{"dev-de1"}, Namespaces: []string{"default"}}}}}, expectedHasAccess: true},
	} {
		t.Run(tt.user.ID, func(t *testing.T) {
			actualHasAccess := tt.user.HasApplicationAccess(&applicationv1.ApplicationSpec{Cluster: "dev-de1", Namespace: "default", Teams: []string{"team1"}})
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestHasTeamAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1@kobs.io", Permissions: userv1.Permissions{Teams: []string{"*"}}}, expectedHasAccess: true},
		{user: User{ID: "user1@kobs.io", Permissions: userv1.Permissions{Teams: []string{"team1"}}}, expectedHasAccess: true},
		{user: User{ID: "user1@kobs.io", Permissions: userv1.Permissions{Teams: []string{"team2", "team1"}}}, expectedHasAccess: true},
		{user: User{ID: "user1@kobs.io", Permissions: userv1.Permissions{Teams: []string{"team2", "*"}}}, expectedHasAccess: true},
		{user: User{ID: "user1@kobs.io", Permissions: userv1.Permissions{Teams: []string{"team2"}}}, expectedHasAccess: false},
	} {
		t.Run(tt.user.ID, func(t *testing.T) {
			actualHasAccess := tt.user.HasTeamAccess("team1")
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestHasPluginAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Cluster: "*", Type: "prometheus", Name: "*"}}}}, expectedHasAccess: true},
		{user: User{ID: "user2@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Cluster: "*", Type: "prometheus", Name: "plugin1"}}}}, expectedHasAccess: true},
		{user: User{ID: "user3@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Cluster: "*", Type: "prometheus", Name: "plugin1"}, {Cluster: "*", Type: "prometheus", Name: "plugin2"}}}}, expectedHasAccess: true},
		{user: User{ID: "user4@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Cluster: "*", Type: "prometheus", Name: "plugin2"}}}}, expectedHasAccess: false},
		{user: User{ID: "user5@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Cluster: "*", Type: "prometheus", Name: "plugin2"}, {Cluster: "*", Type: "prometheus", Name: "*"}}}}, expectedHasAccess: true},
		{user: User{ID: "user6@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Cluster: "test-cluster1", Type: "prometheus", Name: "*"}}}}, expectedHasAccess: true},
		{user: User{ID: "user7@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Cluster: "test-cluster2", Type: "prometheus", Name: "*"}}}}, expectedHasAccess: false},
		{user: User{ID: "user1@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Cluster: "*", Type: "klogs", Name: "*"}}}}, expectedHasAccess: false},
		{user: User{ID: "user1@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Cluster: "*", Type: "*", Name: "*"}}}}, expectedHasAccess: true},
	} {
		t.Run(tt.user.ID, func(t *testing.T) {
			actualHasAccess := tt.user.HasPluginAccess("test-cluster1", "prometheus", "plugin1")
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestHasResourceAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user2@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user3@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user2@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource2"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user4@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user5@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user6@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user6@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource2"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user7@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user8@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user9@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user10@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user11@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user12@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user13@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user14@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user15@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"patch"}}}}}, expectedHasAccess: false},
	} {
		t.Run(tt.user.ID, func(t *testing.T) {
			actualHasAccess := tt.user.HasResourceAccess("test-satellite1", "cluster1", "namespace1", "resource1", "get")
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestGetPluginPermissions(t *testing.T) {
	user := User{ID: "user1@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Cluster: "*", Name: "plugin1"}}}}
	res1 := user.GetPluginPermissions("plugin1")
	require.Equal(t, 1, len(res1))

	res2 := user.GetPluginPermissions("plugin2")
	require.Equal(t, 0, len(res2))
}

func TestGetUser(t *testing.T) {
	for _, tt := range []struct {
		test    string
		ctx     context.Context
		isError bool
	}{
		{test: "test1", ctx: nil, isError: true},
		{test: "test2", ctx: context.WithValue(context.Background(), UserKey, User{}), isError: false},
		{test: "test3", ctx: context.WithValue(context.Background(), UserKey, ""), isError: true},
	} {
		t.Run(tt.test, func(t *testing.T) {
			_, err := GetUser(tt.ctx)
			if tt.isError {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}

func TestMustGetUser(t *testing.T) {
	t.Run("should return user", func(t *testing.T) {
		user := MustGetUser(context.WithValue(context.Background(), UserKey, User{}))
		require.NotNil(t, user)
	})

	t.Run("should panic when no user is present in the context", func(t *testing.T) {
		require.Panics(t, func() {
			MustGetUser(nil)
		})
	})
}
