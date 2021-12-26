package grafana

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/grafana/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

var testConfig = Config{
	{
		Name:            "grafana",
		DisplayName:     "Grafana",
		Description:     "Query, visualize, alert on, and understand your data no matter where it's stored. With Grafana you can create, explore and share all of your data through beautiful, flexible dashboards.",
		InternalAddress: "http://grafana.monitoring.svc.cluster.local",
		PublicAddress:   "https://grafana.kobs.io",
	},
}

func TestGetDashboards(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(*instance.MockInstance)
	}{
		{
			name:               "invalid instance name",
			url:                "/invalidname/dashboards",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("grafana")
			},
		},
		{
			name:               "get dashboards failed",
			url:                "/grafana/dashboards",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get dashboards: failed\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("grafana")
				mockInstance.On("GetDashboards", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("failed"))
			},
		},
		{
			name:               "get dashboards succeeded",
			url:                "/grafana/dashboards",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("grafana")
				mockInstance.On("GetDashboards", mock.Anything, mock.Anything).Return(nil, nil)
			},
		},

		{
			name:               "get dashboards with uids failed",
			url:                "/grafana/dashboards?uid=foobar",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get dashboard: failed\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("grafana")
				mockInstance.On("GetDashboard", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("failed"))
			},
		},
		{
			name:               "get dashboards with uids succeeded",
			url:                "/grafana/dashboards?uid=foobar",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"id\":0,\"uid\":\"\",\"title\":\"\",\"tags\":null,\"url\":\"\",\"folderId\":0,\"folderUid\":\"\"}]\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("grafana")
				mockInstance.On("GetDashboard", mock.Anything, mock.Anything).Return(&instance.Dashboard{}, nil)
			},
		},
		{
			name:               "get dashboards with uids succeeded, but dashboard is nil",
			url:                "/grafana/dashboards?uid=foobar",
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

			w := httptest.NewRecorder()
			router.getDashboards(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestRegister(t *testing.T) {
	plugins := &plugin.Plugins{}
	router := Register(plugins, testConfig)

	require.NotEmpty(t, router)
	require.Equal(t, &plugin.Plugins{
		plugin.Plugin{
			Name:        testConfig[0].Name,
			DisplayName: testConfig[0].DisplayName,
			Description: testConfig[0].Description,
			Type:        "grafana",
			Options: map[string]interface{}{
				"internalAddress": testConfig[0].InternalAddress,
				"publicAddress":   testConfig[0].PublicAddress,
			},
		},
	}, plugins)
}
