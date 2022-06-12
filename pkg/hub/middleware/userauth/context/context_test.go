package context

import (
	"context"
	"testing"

	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"

	"github.com/stretchr/testify/require"
)

func TestToString(t *testing.T) {
	u := User{Email: "test1"}
	require.Equal(t, "{\"email\":\"test1\",\"teams\":null,\"permissions\":{\"applications\":null,\"teams\":null,\"plugins\":null,\"resources\":null}}", u.ToString())
}

func TestHasApplicationAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{Email: "user1@kobs.io", Teams: []string{"*"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}, expectedHasAccess: true},
		{user: User{Email: "user2@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}, expectedHasAccess: true},
		{user: User{Email: "user3@kobs.io", Teams: []string{"team2"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}, expectedHasAccess: true},
		{user: User{Email: "user4@kobs.io", Teams: []string{"*"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}}, expectedHasAccess: false},
		{user: User{Email: "user5@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}}, expectedHasAccess: true},
		{user: User{Email: "user6@kobs.io", Teams: []string{"team2"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}}, expectedHasAccess: false},
		{user: User{Email: "user7@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Satellites: []string{"satellite"}}}}}, expectedHasAccess: false},
		{user: User{Email: "user8@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Satellites: []string{"test-satellite"}, Clusters: []string{"stage-de1"}}}}}, expectedHasAccess: false},
		{user: User{Email: "user9@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Satellites: []string{"test-satellite"}, Clusters: []string{"dev-de1"}, Namespaces: []string{"kube-system"}}}}}, expectedHasAccess: false},
		{user: User{Email: "user10@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Satellites: []string{"test-satellite"}, Clusters: []string{"dev-de1"}, Namespaces: []string{"default"}}}}}, expectedHasAccess: true},
	} {
		t.Run(tt.user.Email, func(t *testing.T) {
			actualHasAccess := tt.user.HasApplicationAccess("test-satellite", "dev-de1", "default", []string{"team1"})
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestHasTeamAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{Email: "user1@kobs.io", Permissions: userv1.Permissions{Teams: []string{"*"}}}, expectedHasAccess: true},
		{user: User{Email: "user1@kobs.io", Permissions: userv1.Permissions{Teams: []string{"team1"}}}, expectedHasAccess: true},
		{user: User{Email: "user1@kobs.io", Permissions: userv1.Permissions{Teams: []string{"team2", "team1"}}}, expectedHasAccess: true},
		{user: User{Email: "user1@kobs.io", Permissions: userv1.Permissions{Teams: []string{"team2", "*"}}}, expectedHasAccess: true},
		{user: User{Email: "user1@kobs.io", Permissions: userv1.Permissions{Teams: []string{"team2"}}}, expectedHasAccess: false},
	} {
		t.Run(tt.user.Email, func(t *testing.T) {
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
		{user: User{Email: "user1@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Satellite: "*", Name: "*"}}}}, expectedHasAccess: true},
		{user: User{Email: "user2@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Satellite: "*", Name: "plugin1"}}}}, expectedHasAccess: true},
		{user: User{Email: "user3@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Satellite: "*", Name: "plugin1"}, {Satellite: "*", Name: "plugin2"}}}}, expectedHasAccess: true},
		{user: User{Email: "user4@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Satellite: "*", Name: "plugin2"}}}}, expectedHasAccess: false},
		{user: User{Email: "user5@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Satellite: "*", Name: "plugin2"}, {Satellite: "*", Name: "*"}}}}, expectedHasAccess: true},
		{user: User{Email: "user6@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Satellite: "test-satellite1", Name: "*"}}}}, expectedHasAccess: true},
		{user: User{Email: "user7@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Satellite: "test-satellite2", Name: "*"}}}}, expectedHasAccess: false},
	} {
		t.Run(tt.user.Email, func(t *testing.T) {
			actualHasAccess := tt.user.HasPluginAccess("test-satellite1", "plugin1")
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestHasResourceAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{Email: "user1@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"*"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{Email: "user2@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"*"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{Email: "user3@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"*"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{Email: "user2@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"*"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource2"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{Email: "user4@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{Email: "user5@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{Email: "user6@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{Email: "user6@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource2"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{Email: "user7@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{Email: "user8@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster2"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
		{user: User{Email: "user9@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster2"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{Email: "user10@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Satellites: []string{"*"}, Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{Email: "user11@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Satellites: []string{"*"}, Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{Email: "user12@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Satellites: []string{"*"}, Clusters: []string{"cluster1"}, Namespaces: []string{"namespace2"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},

		{user: User{Email: "user13@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Satellites: []string{"*"}, Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"*"}}}}}, expectedHasAccess: true},
		{user: User{Email: "user14@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Satellites: []string{"*"}, Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{Email: "user15@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"*"}, Clusters: []string{"cluster2"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}}, {Satellites: []string{"*"}, Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"patch"}}}}}, expectedHasAccess: false},

		{user: User{Email: "user16@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"test-satellite1"}, Clusters: []string{"*"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: true},
		{user: User{Email: "user16@kobs.io", Permissions: userv1.Permissions{Resources: []userv1.Resources{{Satellites: []string{"test-satellite2"}, Clusters: []string{"*"}, Namespaces: []string{"*"}, Resources: []string{"resource1"}, Verbs: []string{"get"}}}}}, expectedHasAccess: false},
	} {
		t.Run(tt.user.Email, func(t *testing.T) {
			actualHasAccess := tt.user.HasResourceAccess("test-satellite1", "cluster1", "namespace1", "resource1", "get")
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}

func TestGetPluginPermissions(t *testing.T) {
	user := User{Email: "user1@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Satellite: "*", Name: "plugin1"}}}}
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
