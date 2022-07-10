package notifications

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetNotificationGroups(t *testing.T) {
	for _, tt := range []struct {
		name               string
		config             Config
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "not configured",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
		},
		{
			name:               "configured",
			config:             Config{Groups: []group{{Title: "Alerts", Plugin: dashboardv1.Plugin{Name: "opsgenie", Type: "opsgenie"}}}},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"title\":\"Alerts\",\"plugin\":{\"type\":\"opsgenie\",\"name\":\"opsgenie\"}}]\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			router := Router{chi.NewRouter(), tt.config}

			req, _ := http.NewRequest(http.MethodGet, "/groups", nil)
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			router.getNotificationGroups(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestMount(t *testing.T) {
	router := Mount(Config{Groups: []group{}})
	require.NotNil(t, router)
}
