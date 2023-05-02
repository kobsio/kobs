package users

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kobsio/kobs/pkg/hub/app/settings"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

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
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "user@kobs.io"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team", nil)
		w := httptest.NewRecorder()
		router.saveUser(w, req)

		utils.AssertStatusEq(t, w, http.StatusMethodNotAllowed)
		utils.AssertJSONEq(t, w, `{"errors": ["Save is disabled"]}`)
	})

	t.Run("should return error for invalid request body", func(t *testing.T) {
		_, router := newRouter(t, true)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "user@kobs.io"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/user", strings.NewReader(`[]`))
		w := httptest.NewRecorder()
		router.saveUser(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to decode request body"]}`)
	})

	t.Run("should return error for invalid user", func(t *testing.T) {
		_, router := newRouter(t, true)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "user@kobs.io"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/user", strings.NewReader(`{"id": "", "cluster": "test", "namespace": "default", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveUser(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid user data"]}`)
	})

	t.Run("should return error when user is not authorized to edit the user", func(t *testing.T) {
		_, router := newRouter(t, true)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/user", strings.NewReader(`{"id": "user@kobs.io", "cluster": "test", "namespace": "test", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveUser(w, req)

		utils.AssertStatusEq(t, w, http.StatusForbidden)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to edit the user"]}`)
	})

	t.Run("should return error on db error", func(t *testing.T) {
		dbClient, router := newRouter(t, true)
		dbClient.EXPECT().SaveUser(gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "user@kobs.io"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/user", strings.NewReader(`{"id": "user@kobs.io", "cluster": "test", "namespace": "test", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveUser(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to save user"]}`)
	})

	t.Run("should save user", func(t *testing.T) {
		dbClient, router := newRouter(t, true)
		dbClient.EXPECT().SaveUser(gomock.Any(), gomock.Any()).Return(nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "user@kobs.io"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/user", strings.NewReader(`{"id": "user@kobs.io", "cluster": "test", "namespace": "test", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveUser(w, req)

		utils.AssertStatusEq(t, w, http.StatusNoContent)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestMount(t *testing.T) {
	router := Mount(settings.Settings{}, nil)
	require.NotNil(t, router)
}
