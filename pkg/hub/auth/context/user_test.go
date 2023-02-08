package context

import (
	"testing"

	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	"github.com/stretchr/testify/require"
)

func TestUser_HasApplicationAccess(t *testing.T) {
	for _, tt := range []struct {
		user              User
		expectedHasAccess bool
	}{
		{user: User{ID: "user1@kobs.io", Teams: []string{"*"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}, expectedHasAccess: true},
		{user: User{ID: "user2@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}, expectedHasAccess: true},
		{user: User{ID: "user3@kobs.io", Teams: []string{"team2"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}, expectedHasAccess: true},
		{user: User{ID: "user4@kobs.io", Teams: []string{"*"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}}, expectedHasAccess: false},
		{user: User{ID: "user5@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}}, expectedHasAccess: true},
		{user: User{ID: "user6@kobs.io", Teams: []string{"team2"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}}, expectedHasAccess: false},
		{user: User{ID: "user7@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom"}}}}, expectedHasAccess: false},
		{user: User{ID: "user8@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Clusters: []string{"stage-de1"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user9@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Clusters: []string{"dev-de1"}, Namespaces: []string{"kube-system"}}}}}, expectedHasAccess: false},
		{user: User{ID: "user10@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Clusters: []string{"dev-de1"}, Namespaces: []string{"default"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user10@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Clusters: []string{"*"}, Namespaces: []string{"default"}}}}}, expectedHasAccess: true},
		{user: User{ID: "user10@kobs.io", Teams: []string{"team1"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "custom", Clusters: []string{"dev-de1"}, Namespaces: []string{"*"}}}}}, expectedHasAccess: true},
	} {
		t.Run(tt.user.ID, func(t *testing.T) {
			application := &applicationv1.ApplicationSpec{
				Cluster:   "dev-de1",
				Namespace: "default",
				Teams:     []string{"team1"},
			}
			require.Equal(t, tt.expectedHasAccess, tt.user.HasApplicationAccess(application))
		})
	}
}

func TestUser_HasTeamAccess(t *testing.T) {
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
