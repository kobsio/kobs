package context

import (
	"context"
	"testing"

	userv1 "github.com/kobsio/kobs/pkg/api/apis/user/v1"

	"github.com/stretchr/testify/require"
)

func TestHasPluginAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "*"}}}}, expectedHasAccess: true},
		{user: User{ID: "user2", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "plugin1"}}}}, expectedHasAccess: true},
		{user: User{ID: "user3", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "plugin1"}, {Name: "plugin2"}}}}, expectedHasAccess: true},
		{user: User{ID: "user4", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "plugin2"}}}}, expectedHasAccess: false},
		{user: User{ID: "user5", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "plugin2"}, {Name: "*"}}}}, expectedHasAccess: true},
	} {
		t.Run(tt.user.ID, func(t *testing.T) {
			actualHasAccess := tt.user.HasPluginAccess("plugin1")
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestHasClusterAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user2", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user3", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1", "cluster2"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user4", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user5", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2", "*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user6", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}}, {Clusters: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user7", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}}, {Clusters: []string{"cluster1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user8", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}}, {Clusters: []string{"cluster3"}}}}}, expectedHasAccess: false},
	} {
		t.Run(tt.user.ID, func(t *testing.T) {
			actualHasAccess := tt.user.HasClusterAccess("cluster1")
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestHasNamespaceAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user2", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user3", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace2"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user4", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user5", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user6", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user7", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user8", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"namespace1"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user9", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"namespace2"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user10", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user11", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user12", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}}}}}, expectedHasAccess: false},
	} {
		t.Run(tt.user.ID, func(t *testing.T) {
			actualHasAccess := tt.user.HasNamespaceAccess("cluster1", "namespace1")
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestHasResourceAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user2", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user3", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user2", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource2"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user4", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user5", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user6", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user6", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource2"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user7", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user8", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user9", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user10", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user11", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user12", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user13", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user14", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user15", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"patch"}}}}}, expectedHasAccess: false},
	} {
		t.Run(tt.user.ID, func(t *testing.T) {
			actualHasAccess := tt.user.HasResourceAccess("cluster1", "namespace1", "resource1", "get")
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestGetPluginPermissions(t *testing.T) {
	user := User{ID: "user1", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "plugin1"}}}}
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
