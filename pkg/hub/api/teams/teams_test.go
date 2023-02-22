package teams

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang/mock/gomock"
	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetTeams(t *testing.T) {
	t.Run("should return error when user is not authorized to view all teams", func(t *testing.T) {
		user := authContext.User{ID: "foo"}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)

		router := Router{chi.NewRouter(), dbClient}
		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/teams?all=true", nil)
		w := httptest.NewRecorder()

		router.getTeams(w, req)

		utils.AssertStatusEq(t, w, http.StatusForbidden)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to view all teams"]}`)
	})

	t.Run("should handle error from db client", func(t *testing.T) {
		user := authContext.User{ID: "foo", Permissions: userv1.Permissions{Teams: []string{"*"}}}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetTeams(gomock.Any()).Return(nil, fmt.Errorf("could not get teams"))

		router := Router{chi.NewRouter(), dbClient}
		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/teams?all=true", nil)
		w := httptest.NewRecorder()

		router.getTeams(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get teams"]}`)
	})

	t.Run("should return all teams", func(t *testing.T) {
		user := authContext.User{ID: "foo", Permissions: userv1.Permissions{Teams: []string{"*"}}}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetTeams(gomock.Any()).Return([]teamv1.TeamSpec{{ID: "team1"}, {ID: "team2"}, {ID: "team3"}, {ID: "team1"}, {ID: "team2"}}, nil)

		router := Router{chi.NewRouter(), dbClient}
		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/teams?all=true", nil)
		w := httptest.NewRecorder()

		router.getTeams(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[{"id":"team1","permissions":{}},{"id":"team2","permissions":{}},{"id":"team3","permissions":{}}]`)
	})

	t.Run("should handle error from ", func(t *testing.T) {
		teamIDs := []string{"team1"}
		user := authContext.User{Teams: teamIDs, ID: "foo", Permissions: userv1.Permissions{Teams: teamIDs}}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetTeamsByIDs(gomock.Any(), teamIDs).Return(nil, fmt.Errorf("could not get teams"))

		router := Router{chi.NewRouter(), dbClient}
		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/teams", nil)
		w := httptest.NewRecorder()

		router.getTeams(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get teams"]}`)
	})

	t.Run("should return own teams", func(t *testing.T) {
		teamIDs := []string{"team1"}
		user := authContext.User{Teams: teamIDs, ID: "foo", Permissions: userv1.Permissions{Teams: teamIDs}}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetTeamsByIDs(gomock.Any(), teamIDs).Return([]teamv1.TeamSpec{{ID: "team1"}, {ID: "team1"}}, nil)

		router := Router{chi.NewRouter(), dbClient}
		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/teams", nil)
		w := httptest.NewRecorder()

		router.getTeams(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[{"id":"team1","permissions":{}}]`)
	})
}

func TestGetTeam(t *testing.T) {
	t.Run("should return error if user is not authorized", func(t *testing.T) {
		user := authContext.User{ID: "foo"}

		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient}
		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/teams/team", nil)
		w := httptest.NewRecorder()

		router.getTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusForbidden)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to view the team"]}`)
	})

	t.Run("should handle error from db client", func(t *testing.T) {
		teamID := "team1"
		user := authContext.User{ID: "foo", Permissions: userv1.Permissions{Teams: []string{"*"}}}

		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetTeamByID(gomock.Any(), teamID).Return(nil, fmt.Errorf("could not get team"))

		router := Router{chi.NewRouter(), dbClient}
		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/teams/team?id=%s", teamID), nil)
		w := httptest.NewRecorder()

		router.getTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get team"]}`)
	})

	t.Run("should return team", func(t *testing.T) {
		teamID := "team1"
		user := authContext.User{ID: "foo", Permissions: userv1.Permissions{Teams: []string{"*"}}}

		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetTeamByID(gomock.Any(), teamID).Return(&teamv1.TeamSpec{ID: teamID}, nil)

		router := Router{chi.NewRouter(), dbClient}
		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/teams/team?id=%s", teamID), nil)
		w := httptest.NewRecorder()

		router.getTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"id":"team1","permissions":{}}`)
	})
}

func TestMount(t *testing.T) {
	router := Mount(nil)
	require.NotNil(t, router)
}
