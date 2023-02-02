package notifications

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang/mock/gomock"
	dashboardv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/user/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
)

func TestGetNotificationGroups(t *testing.T) {
	t.Run("can respond with default notifcations", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)

		router := Router{chi.NewRouter(), Config{}, dbClient, otel.Tracer("notifications")}

		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/groups", nil)

		w := httptest.NewRecorder()
		router.getNotificationGroups(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `null`, w)
	})

	t.Run("responds with default when get user by id fails ", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		authUser := authContext.User{ID: "test@kobs.io"}
		dbClient.EXPECT().GetUserByID(gomock.Any(), authUser.ID).Return(nil, fmt.Errorf("could not get users"))

		config := Config{Groups: []userv1.NotificationsGroup{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie", Cluster: "cluster"}}}}
		router := Router{chi.NewRouter(), config, dbClient, otel.Tracer("notifications")}

		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authUser)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/groups", nil)

		w := httptest.NewRecorder()
		router.getNotificationGroups(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `[{"title":"Alerts","plugin":{"type":"opsgenie","name":"opsgenie", "cluster": "cluster"}}]`, w)
	})

	t.Run("when it gets user with notification groups", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		authUser := authContext.User{ID: "test@kobs.io"}
		dbClient.EXPECT().GetUserByID(gomock.Any(), authUser.ID).Return(&userv1.UserSpec{Notifications: userv1.Notifications{Groups: []userv1.NotificationsGroup{{Title: "Incidents", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie", Cluster: "cluster"}}}}}, nil)
		config := Config{Groups: []userv1.NotificationsGroup{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie"}}}}
		router := Router{chi.NewRouter(), config, dbClient, otel.Tracer("notifications")}

		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authUser)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/groups", nil)

		w := httptest.NewRecorder()
		router.getNotificationGroups(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `[{"title":"Incidents","plugin":{"type":"opsgenie","name":"opsgenie", "cluster": "cluster"}}]`, w)
	})

	t.Run("when user has no notification groups and get teams fails", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		authUser := authContext.User{ID: "test@kobs.io"}
		dbClient.EXPECT().GetUserByID(gomock.Any(), authUser.ID).Return(&userv1.UserSpec{ID: "test@kobs.io"}, nil)
		dbClient.EXPECT().GetTeamsByIDs(gomock.Any(), nil).Return(nil, fmt.Errorf("could not get teams"))

		config := Config{Groups: []userv1.NotificationsGroup{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie", Cluster: "cluster"}}}}
		router := Router{chi.NewRouter(), config, dbClient, otel.Tracer("notifications")}

		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authUser)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/groups", nil)

		w := httptest.NewRecorder()
		router.getNotificationGroups(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `[{"title":"Alerts","plugin":{"type":"opsgenie","name":"opsgenie", "cluster": "cluster"}}]`, w)
	})

	t.Run("when user has no notification groups, but team has notification groups", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		authUser := authContext.User{ID: "test@kobs.io"}
		dbClient.EXPECT().GetUserByID(gomock.Any(), authUser.ID).Return(&userv1.UserSpec{ID: "test@kobs.io"}, nil)
		dbClient.EXPECT().GetTeamsByIDs(gomock.Any(), nil).Return([]teamv1.TeamSpec{{Notifications: userv1.Notifications{Groups: []userv1.NotificationsGroup{{Title: "Incidents and Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie", Cluster: "cluster"}}}}}}, nil)

		config := Config{Groups: []userv1.NotificationsGroup{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie", Cluster: "cluster"}}}}
		router := Router{chi.NewRouter(), config, dbClient, otel.Tracer("notifications")}

		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authUser)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/groups", nil)

		w := httptest.NewRecorder()
		router.getNotificationGroups(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `[{"title":"Incidents and Alerts","plugin":{"type":"opsgenie","name":"opsgenie", "cluster": "cluster"}}]`, w)
	})

	t.Run("should return default notificaiton when both user and team have no notification groups", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		authUser := authContext.User{ID: "test@kobs.io"}
		dbClient.EXPECT().GetUserByID(gomock.Any(), authUser.ID).Return(&userv1.UserSpec{ID: "test@kobs.io"}, nil)
		dbClient.EXPECT().GetTeamsByIDs(gomock.Any(), nil).Return([]teamv1.TeamSpec{{ID: "team@kobs.io"}}, nil)

		config := Config{Groups: []userv1.NotificationsGroup{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie", Cluster: "cluster"}}}}
		router := Router{chi.NewRouter(), config, dbClient, otel.Tracer("notifications")}

		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authUser)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/groups", nil)

		w := httptest.NewRecorder()
		router.getNotificationGroups(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `[{"title":"Alerts","plugin":{"type":"opsgenie","name":"opsgenie", "cluster": "cluster"}}]`, w)
	})
}

func TestMount(t *testing.T) {
	router := Mount(Config{Groups: []userv1.NotificationsGroup{}}, nil)
	require.NotNil(t, router)
}
