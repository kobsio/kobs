package users

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	dashboardv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/dashboard/v1"
	userv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/user/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/stretchr/testify/require"
)

func TestGetUser(t *testing.T) {
	var defaultConfig = Config{DefaultDashboards: []dashboardv1.Reference{{Title: "default dashboard"}}}

	t.Run("when user has no access", func(t *testing.T) {
		id := "bar"
		user := authContext.User{ID: "foo"}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), defaultConfig, dbClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/user?id=%s", id), nil)
		w := httptest.NewRecorder()

		router.getUser(w, req)

		utils.AssertStatusEq(t, http.StatusForbidden, w)
		utils.AssertJSONEq(t, `{"error": "you can only access you own profile"}`, w)
	})

	t.Run("when get user by id fails", func(t *testing.T) {
		id := "bar"
		user := authContext.User{ID: id}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), id).Return(nil, fmt.Errorf("couldn't get the user"))

		router := Router{chi.NewRouter(), defaultConfig, dbClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/user?id=%s", id), nil)
		w := httptest.NewRecorder()

		router.getUser(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error": "could not get user"}`, w)
	})

	t.Run("can get profile", func(t *testing.T) {
		id := "bar"
		user := authContext.User{ID: id}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), id).Return(&userv1.UserSpec{
			Dashboards: []dashboardv1.Reference{{Title: "foobar"}},
		}, nil)

		router := Router{chi.NewRouter(), defaultConfig, dbClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/user?id=%s", id), nil)
		w := httptest.NewRecorder()

		router.getUser(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `{"id":"bar","permissions":{},"dashboards":[{"title":"foobar"}],"notifications":{"groups":null}}`, w)
	})

	t.Run("can get profile with default dashboards", func(t *testing.T) {
		id := "bar"
		user := authContext.User{ID: id}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), id).Return(&userv1.UserSpec{
			Dashboards: nil,
		}, nil)

		router := Router{chi.NewRouter(), defaultConfig, dbClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/user?id=%s", id), nil)
		w := httptest.NewRecorder()

		router.getUser(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `{"id":"bar","permissions":{},"dashboards":[{"title":"default dashboard"}],"notifications":{"groups":null}}`, w)
	})
}

func TestMount(t *testing.T) {
	router := Mount(Config{DefaultDashboards: []dashboardv1.Reference{}}, nil)
	require.NotNil(t, router)
}
