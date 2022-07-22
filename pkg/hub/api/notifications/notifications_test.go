package notifications

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/store"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
)

func TestGetNotificationGroups(t *testing.T) {
	for _, tt := range []struct {
		name               string
		config             Config
		expectedStatusCode int
		expectedBody       string
		prepare            func(t *testing.T, mockStoreClient *store.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "no user context and no default notifications",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetUsersByEmail", mock.Anything, mock.Anything)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getNotificationGroups(w, req)
			},
		},
		{
			name:               "no user context and default notifications",
			config:             Config{Groups: []userv1.NotificationsGroup{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie"}}}},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"title\":\"Alerts\",\"plugin\":{\"type\":\"opsgenie\",\"name\":\"opsgenie\"}}]\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetUsersByEmail", mock.Anything, mock.Anything)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getNotificationGroups(w, req)
			},
		},
		{
			name:               "user context and users error and default notifications",
			config:             Config{Groups: []userv1.NotificationsGroup{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie"}}}},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"title\":\"Alerts\",\"plugin\":{\"type\":\"opsgenie\",\"name\":\"opsgenie\"}}]\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get users"))
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Email: "test@kobs.io"}))
				router.getNotificationGroups(w, req)
			},
		},
		{
			name:               "user context and users with notifications",
			config:             Config{Groups: []userv1.NotificationsGroup{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie"}}}},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"title\":\"Incidents\",\"plugin\":{\"type\":\"opsgenie\",\"name\":\"opsgenie\"}}]\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, mock.Anything).Return([]userv1.UserSpec{{Notifications: userv1.Notifications{Groups: []userv1.NotificationsGroup{{Title: "Incidents", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie"}}}}}}, nil)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Email: "test@kobs.io"}))
				router.getNotificationGroups(w, req)
			},
		},
		{
			name:               "user context and users without notifications and teams error and default dashboards",
			config:             Config{Groups: []userv1.NotificationsGroup{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie"}}}},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"title\":\"Alerts\",\"plugin\":{\"type\":\"opsgenie\",\"name\":\"opsgenie\"}}]\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, mock.Anything).Return([]userv1.UserSpec{{Email: "test@kobs.io"}}, nil)
				mockStoreClient.On("GetTeamsByGroups", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get teams"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Email: "test@kobs.io"}))
				router.getNotificationGroups(w, req)
			},
		},
		{
			name:               "user context and users without notifications and teams with notifications",
			config:             Config{Groups: []userv1.NotificationsGroup{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie"}}}},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"title\":\"Incidents and Alerts\",\"plugin\":{\"type\":\"opsgenie\",\"name\":\"opsgenie\"}}]\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, mock.Anything).Return([]userv1.UserSpec{{Email: "test@kobs.io"}}, nil)
				mockStoreClient.On("GetTeamsByGroups", mock.Anything, mock.Anything).Return([]teamv1.TeamSpec{{Notifications: userv1.Notifications{Groups: []userv1.NotificationsGroup{{Title: "Incidents and Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie"}}}}}}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Email: "test@kobs.io"}))
				router.getNotificationGroups(w, req)
			},
		},
		{
			name:               "user context and users without notifications and teams without notifications and default notifications",
			config:             Config{Groups: []userv1.NotificationsGroup{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie"}}}},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"title\":\"Alerts\",\"plugin\":{\"type\":\"opsgenie\",\"name\":\"opsgenie\"}}]\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, mock.Anything).Return([]userv1.UserSpec{{Email: "test@kobs.io"}}, nil)
				mockStoreClient.On("GetTeamsByGroups", mock.Anything, mock.Anything).Return([]teamv1.TeamSpec{{Group: "team@kobs.io"}}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Email: "test@kobs.io"}))
				router.getNotificationGroups(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), tt.config, mockStoreClient, otel.Tracer("notifications")}

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/groups", nil)
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestMount(t *testing.T) {
	router := Mount(Config{Groups: []userv1.NotificationsGroup{}}, nil)
	require.NotNil(t, router)
}
