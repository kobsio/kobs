package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-grafana/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	mockInstance := &instance.MockInstance{}
	mockInstance.On("GetName").Return("grafana")

	router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
	instance1 := router.getInstance("default")
	require.NotNil(t, instance1)

	instance2 := router.getInstance("grafana")
	require.NotNil(t, instance2)

	instance3 := router.getInstance("invalidname")
	require.Nil(t, instance3)
}

func TestGetDashboards(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		pluginName         string
		expectedStatusCode int
		expectedBody       string
		prepare            func(*instance.MockInstance)
	}{
		{
			name:               "invalid instance name",
			url:                "/dashboards",
			pluginName:         "invalidname",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("grafana")
			},
		},
		{
			name:               "get dashboards failed",
			url:                "/dashboards",
			pluginName:         "grafana",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get dashboards: failed\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("grafana")
				mockInstance.On("GetDashboards", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("failed"))
			},
		},
		{
			name:               "get dashboards succeeded",
			url:                "/dashboards",
			pluginName:         "grafana",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("grafana")
				mockInstance.On("GetDashboards", mock.Anything, mock.Anything).Return(nil, nil)
			},
		},

		{
			name:               "get dashboards with uids failed",
			url:                "/dashboards?uid=foobar",
			pluginName:         "grafana",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get dashboard: failed\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("grafana")
				mockInstance.On("GetDashboard", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("failed"))
			},
		},
		{
			name:               "get dashboards with uids succeeded",
			url:                "/dashboards?uid=foobar",
			pluginName:         "grafana",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"id\":0,\"uid\":\"\",\"title\":\"\",\"tags\":null,\"url\":\"\",\"folderId\":0,\"folderUid\":\"\"}]\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("grafana")
				mockInstance.On("GetDashboard", mock.Anything, mock.Anything).Return(&instance.Dashboard{}, nil)
			},
		},
		{
			name:               "get dashboards with uids succeeded, but dashboard is nil",
			url:                "/dashboards?uid=foobar",
			pluginName:         "grafana",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("grafana")
				mockInstance.On("GetDashboard", mock.Anything, mock.Anything).Return(nil, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)
			tt.prepare(mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/{name}", func(r chi.Router) {
				r.Get("/dashboards", router.getDashboards)
			})

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("name", strings.Split(tt.url, "/")[1])
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
			req.Header.Set("x-kobs-plugin", tt.pluginName)

			w := httptest.NewRecorder()
			router.getDashboards(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestMount(t *testing.T) {
	router1, err := Mount([]plugin.Instance{{Name: "grafana", Options: map[string]interface{}{}}}, nil)
	require.NoError(t, err)
	require.NotNil(t, router1)

	router2, err := Mount([]plugin.Instance{{Name: "grafana", Options: map[string]interface{}{"token": []string{"token"}}}}, nil)
	require.Error(t, err)
	require.Nil(t, router2)
}
