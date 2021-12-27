package elasticsearch

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/elasticsearch/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

var testConfig = Config{
	{
		Name:        "elasticsearch",
		DisplayName: "Elasticsearch",
		Description: "Elasticsearch can be used for the logs of your application.",
	},
}

func TestGetLogs(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(*instance.MockInstance)
	}{
		{
			name:               "invalid instance name",
			url:                "/invalidname/logs",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("elasticsearch")
			},
		},
		{
			name:               "parse time start fails",
			url:                "/elasticsearch/logs?timeStart=test",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse start time: strconv.ParseInt: parsing \\\"test\\\": invalid syntax\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("elasticsearch")
			},
		},
		{
			name:               "parse time end fails",
			url:                "/elasticsearch/logs?timeStart=0&timeEnd=test",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse end time: strconv.ParseInt: parsing \\\"test\\\": invalid syntax\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("elasticsearch")
			},
		},
		{
			name:               "get logs error",
			url:                "/elasticsearch/logs?timeStart=0&timeEnd=0",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get logs: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("elasticsearch")
				mockInstance.On("GetLogs", mock.Anything, "", int64(0), int64(0)).Return(nil, fmt.Errorf("bad request"))
			},
		},
		{
			name:               "get logs success",
			url:                "/elasticsearch/logs?timeStart=0&timeEnd=0",
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

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("name", strings.Split(tt.url, "/")[1])
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			router.getLogs(w, req)

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
			Type:        "elasticsearch",
		},
	}, plugins)
}
