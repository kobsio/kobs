package azure

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kobsio/kobs/plugins/azure/pkg/instance"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/costmanagement"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetActualCosts(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *costmanagement.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			url:                "/invalidname/costmanagement/actualcosts",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *costmanagement.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getActualCosts(w, req)
			},
		},
		{
			name:               "invalid start time",
			url:                "/azure/costmanagement/actualcosts",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse start time: strconv.ParseInt: parsing \\\"\\\": invalid syntax\"}\n",
			prepare: func(mockClient *costmanagement.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getActualCosts(w, req)
			},
		},
		{
			name:               "invalid end time",
			url:                "/azure/costmanagement/actualcosts?timeStart=1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse end time: strconv.ParseInt: parsing \\\"\\\": invalid syntax\"}\n",
			prepare: func(mockClient *costmanagement.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getActualCosts(w, req)
			},
		},
		// TODO: Fix the test, currently this panics with the following error:
		//   panic: interface conversion: *costmanagement.MockClient is not costmanagement.Client: missing method GetActualCost
		// {
		// 	name:               "could not get actual costs",
		// 	url:                "/azure/costmanagement/actualcosts?timeStart=1&timeEnd=1",
		// 	expectedStatusCode: http.StatusBadRequest,
		// 	expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
		// 	prepare: func(mockClient *costmanagement.MockClient, mockInstance *instance.MockInstance) {
		// 		mockClient.On("GetActualCost", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get costs"))

		// 		mockInstance.On("GetName").Return("azure")
		// 		mockInstance.On("CostManagementClient").Return(mockClient)
		// 	},
		// 	do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
		// 		router.getActualCosts(w, req)
		// 	},
		// },
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &costmanagement.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/{name}", func(r chi.Router) {
				r.Route("/costmanagement", func(costManagementRouter chi.Router) {
					costManagementRouter.Get("/actualcosts", router.getActualCosts)
				})
			})

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("name", strings.Split(tt.url, "/")[1])
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}
