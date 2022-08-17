package azure

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance/monitor"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetMetrics(t *testing.T) {
	for _, tt := range []struct {
		name               string
		pluginName         string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *monitor.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			pluginName:         "invalidname",
			url:                "/monitor/metrics",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *monitor.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getMetrics(w, req)
			},
		},
		{
			name:               "no user context",
			pluginName:         "azure",
			url:                "/monitor/metrics",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to get metrics: Unauthorized\"}\n",
			prepare: func(mockClient *monitor.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getMetrics(w, req)
			},
		},
		{
			name:               "check permissions fails",
			pluginName:         "azure",
			url:                "/monitor/metrics",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to view metrics: access forbidden\"}\n",
			prepare: func(mockClient *monitor.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getMetrics(w, req)
			},
		},
		{
			name:               "parse start time fails",
			pluginName:         "azure",
			url:                "/monitor/metrics",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse start time: strconv.ParseInt: parsing \\\"\\\": invalid syntax\"}\n",
			prepare: func(mockClient *monitor.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getMetrics(w, req)
			},
		},
		{
			name:               "parse end time fails",
			pluginName:         "azure",
			url:                "/monitor/metrics?timeStart=1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse end time: strconv.ParseInt: parsing \\\"\\\": invalid syntax\"}\n",
			prepare: func(mockClient *monitor.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getMetrics(w, req)
			},
		},
		{
			name:               "get metrics fails",
			pluginName:         "azure",
			url:                "/monitor/metrics?timeStart=1&timeEnd=1",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get metrics: could not get metrics\"}\n",
			prepare: func(mockClient *monitor.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetMetrics", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get metrics"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("MonitorClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getMetrics(w, req)
			},
		},
		{
			name:               "get metrics",
			pluginName:         "azure",
			url:                "/monitor/metrics?timeStart=1&timeEnd=1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockClient *monitor.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetMetrics", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("MonitorClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getMetrics(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &monitor.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/monitor", func(monitorRouter chi.Router) {
				monitorRouter.Get("/metrics", router.getMetrics)
			})

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			req.Header.Set("x-kobs-plugin", tt.pluginName)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}
