package teams

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	"github.com/kobsio/kobs/pkg/hub/app/settings"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetTeams(t *testing.T) {
	t.Run("should return error when user is not authorized to view all teams", func(t *testing.T) {
		user := authContext.User{ID: "foo"}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)

		router := Router{chi.NewRouter(), settings.Settings{}, dbClient}
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
		dbClient.EXPECT().GetTeams(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("could not get teams"))

		router := Router{chi.NewRouter(), settings.Settings{}, dbClient}
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
		dbClient.EXPECT().GetTeams(gomock.Any(), gomock.Any()).Return([]teamv1.TeamSpec{{ID: "team1"}, {ID: "team2"}, {ID: "team3"}, {ID: "team1"}, {ID: "team2"}}, nil)

		router := Router{chi.NewRouter(), settings.Settings{}, dbClient}
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
		dbClient.EXPECT().GetTeamsByIDs(gomock.Any(), teamIDs, gomock.Any()).Return(nil, fmt.Errorf("could not get teams"))

		router := Router{chi.NewRouter(), settings.Settings{}, dbClient}
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
		dbClient.EXPECT().GetTeamsByIDs(gomock.Any(), teamIDs, gomock.Any()).Return([]teamv1.TeamSpec{{ID: "team1"}, {ID: "team1"}}, nil)

		router := Router{chi.NewRouter(), settings.Settings{}, dbClient}
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
		router := Router{chi.NewRouter(), settings.Settings{}, dbClient}
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

		router := Router{chi.NewRouter(), settings.Settings{}, dbClient}
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

		router := Router{chi.NewRouter(), settings.Settings{}, dbClient}
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

func TestSaveTeam(t *testing.T) {
	var newRouter = func(t *testing.T, saveEnabled bool) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), settings.Settings{Save: struct {
			Enabled bool `json:"enabled"`
		}{Enabled: saveEnabled}}, dbClient}

		return dbClient, router
	}

	t.Run("should return error when save is disabled", func(t *testing.T) {
		_, router := newRouter(t, false)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Teams: []string{"team@kobs.io"}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team", nil)
		w := httptest.NewRecorder()
		router.saveTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusMethodNotAllowed)
		utils.AssertJSONEq(t, w, `{"errors": ["Save is disabled"]}`)
	})

	t.Run("should return error for invalid request body", func(t *testing.T) {
		_, router := newRouter(t, true)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Teams: []string{"team@kobs.io"}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/team", strings.NewReader(`[]`))
		w := httptest.NewRecorder()
		router.saveTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to decode request body"]}`)
	})

	t.Run("should return error for invalid team", func(t *testing.T) {
		_, router := newRouter(t, true)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Teams: []string{"team@kobs.io"}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/team", strings.NewReader(`{"id": "", "cluster": "test", "namespace": "default", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid team data"]}`)
	})

	t.Run("should return error when user is not authorized to edit the team", func(t *testing.T) {
		_, router := newRouter(t, true)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/team", strings.NewReader(`{"id": "team@kobs.io", "cluster": "test", "namespace": "test", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusForbidden)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to edit the team"]}`)
	})

	t.Run("should return error on db error", func(t *testing.T) {
		dbClient, router := newRouter(t, true)
		dbClient.EXPECT().SaveTeam(gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Teams: []string{"team@kobs.io"}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/team", strings.NewReader(`{"id": "team@kobs.io", "cluster": "test", "namespace": "test", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to save team"]}`)
	})

	t.Run("should save team", func(t *testing.T) {
		dbClient, router := newRouter(t, true)
		dbClient.EXPECT().SaveTeam(gomock.Any(), gomock.Any()).Return(nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Teams: []string{"team@kobs.io"}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/team", strings.NewReader(`{"id": "team@kobs.io", "cluster": "test", "namespace": "test", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusNoContent)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestMount(t *testing.T) {
	router := Mount(settings.Settings{}, nil)
	require.NotNil(t, router)
}
