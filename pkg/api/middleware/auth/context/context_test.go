package context

import (
	"context"
	"testing"

	user "github.com/kobsio/kobs/pkg/api/apis/user/v1beta1"

	"github.com/stretchr/testify/require"
)

func TestHasPluginAccess(t *testing.T) {
	for _, tc := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1", Permissions: user.Permissions{Plugins: []user.Plugin{{Name: "*"}}}}, expectedHasAccess: true},
		{user: User{ID: "user2", Permissions: user.Permissions{Plugins: []user.Plugin{{Name: "plugin1"}}}}, expectedHasAccess: true},
		{user: User{ID: "user3", Permissions: user.Permissions{Plugins: []user.Plugin{{Name: "plugin1"}, {Name: "plugin2"}}}}, expectedHasAccess: true},
		{user: User{ID: "user4", Permissions: user.Permissions{Plugins: []user.Plugin{{Name: "plugin2"}}}}, expectedHasAccess: false},
		{user: User{ID: "user5", Permissions: user.Permissions{Plugins: []user.Plugin{{Name: "plugin2"}, {Name: "*"}}}}, expectedHasAccess: true},
	} {
		t.Run(tc.user.ID, func(t *testing.T) {
			actualHasAccess := tc.user.HasPluginAccess("plugin1")
			require.Equal(t, tc.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestHasClusterAccess(t *testing.T) {
	for _, tc := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user2", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user3", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster1", "cluster2"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user4", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user5", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2", "*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user6", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}}, {Clusters: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user7", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}}, {Clusters: []string{"cluster1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user8", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}}, {Clusters: []string{"cluster3"}}}}}, expectedHasAccess: false},
	} {
		t.Run(tc.user.ID, func(t *testing.T) {
			actualHasAccess := tc.user.HasClusterAccess("cluster1")
			require.Equal(t, tc.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestHasNamespaceAccess(t *testing.T) {
	for _, tc := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"*"}, Namespaces: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user2", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user3", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace2"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user4", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user5", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user6", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user7", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user8", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"namespace1"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user9", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"namespace2"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user10", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user11", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user12", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}}}}}, expectedHasAccess: false},
	} {
		t.Run(tc.user.ID, func(t *testing.T) {
			actualHasAccess := tc.user.HasNamespaceAccess("cluster1", "namespace1")
			require.Equal(t, tc.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestHasResourceAccess(t *testing.T) {
	for _, tc := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"*"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user2", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user3", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user2", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"*"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource2"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user4", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user5", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user6", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user6", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource2"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user7", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user8", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user9", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: false},

		{user: User{ID: "user10", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user11", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user12", Permissions: user.Permissions{Resources: []user.Resources{{Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}}}}}, expectedHasAccess: false},
	} {
		t.Run(tc.user.ID, func(t *testing.T) {
			actualHasAccess := tc.user.HasResourceAccess("cluster1", "namespace1", "resource1")
			require.Equal(t, tc.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestGetPluginPermissions(t *testing.T) {
	user := User{ID: "user1", Permissions: user.Permissions{Plugins: []user.Plugin{{Name: "plugin1"}}}}
	res1 := user.GetPluginPermissions("plugin1")
	require.Equal(t, 1, len(res1))

	res2 := user.GetPluginPermissions("plugin2")
	require.Equal(t, 0, len(res2))
}

func TestGetUser(t *testing.T) {
	for _, tc := range []struct {
		test    string
		ctx     context.Context
		isError bool
	}{
		{test: "test1", ctx: nil, isError: true},
		{test: "test2", ctx: context.WithValue(context.Background(), UserKey, User{}), isError: false},
		{test: "test3", ctx: context.WithValue(context.Background(), UserKey, ""), isError: true},
	} {
		t.Run(tc.test, func(t *testing.T) {
			_, err := GetUser(tc.ctx)
			if tc.isError {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
