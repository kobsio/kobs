package elasticsearch

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-elasticsearch/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	mockInstance := &instance.MockInstance{}
	mockInstance.On("GetName").Return("elasticsearch")

	router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
	instance1 := router.getInstance("default")
	require.NotNil(t, instance1)

	instance2 := router.getInstance("elasticsearch")
	require.NotNil(t, instance2)

	instance3 := router.getInstance("invalidname")
	require.Nil(t, instance3)
}

func TestGetLogs(t *testing.T) {
	for _, tt := range []struct {
		name               string
		pluginName         string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(*instance.MockInstance)
	}{
		{
			name:               "invalid instance name",
			pluginName:         "invalidname",
			url:                "/logs",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("elasticsearch")
			},
		},
		{
			name:               "parse time start fails",
			pluginName:         "elasticsearch",
			url:                "/logs?timeStart=test",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse start time: strconv.ParseInt: parsing \\\"test\\\": invalid syntax\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("elasticsearch")
			},
		},
		{
			name:               "parse time end fails",
			pluginName:         "elasticsearch",
			url:                "/logs?timeStart=0&timeEnd=test",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse end time: strconv.ParseInt: parsing \\\"test\\\": invalid syntax\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("elasticsearch")
			},
		},
		{
			name:               "get logs error",
			pluginName:         "elasticsearch",
			url:                "/logs?timeStart=0&timeEnd=0",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get logs: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("elasticsearch")
				mockInstance.On("GetLogs", mock.Anything, "", int64(0), int64(0)).Return(nil, fmt.Errorf("bad request"))
			},
		},
		{
			name:               "get logs success",
			pluginName:         "elasticsearch",
			url:                "/logs?timeStart=0&timeEnd=0",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"took\":0,\"hits\":0,\"documents\":null,\"buckets\":null}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("elasticsearch")
				mockInstance.On("GetLogs", mock.Anything, "", int64(0), int64(0)).Return(&instance.Data{}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)
			tt.prepare(mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/{name}", func(r chi.Router) {
				r.Get("/logs", router.getLogs)
			})

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("name", strings.Split(tt.url, "/")[1])
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
			req.Header.Set("x-kobs-plugin", tt.pluginName)

			w := httptest.NewRecorder()
			router.getLogs(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestMount(t *testing.T) {
	router1, err := Mount([]plugin.Instance{{Name: "elasticsearch", Options: map[string]any{}}}, nil)
	require.NoError(t, err)
	require.NotNil(t, router1)

	router2, err := Mount([]plugin.Instance{{Name: "elasticsearch", Options: map[string]any{"token": []string{"token"}}}}, nil)
	require.Error(t, err)
	require.Nil(t, router2)
}
