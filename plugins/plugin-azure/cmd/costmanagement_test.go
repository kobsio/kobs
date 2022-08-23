package azure

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance/costmanagement"

	azureCostmanagement "github.com/Azure/azure-sdk-for-go/services/costmanagement/mgmt/2019-11-01/costmanagement"
	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetActualCosts(t *testing.T) {
	for _, tt := range []struct {
		name               string
		pluginName         string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *costmanagement.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			pluginName:         "invalidname",
			url:                "/costmanagement/actualcosts",
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
			pluginName:         "azure",
			url:                "/costmanagement/actualcosts",
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
			pluginName:         "azure",
			url:                "/costmanagement/actualcosts?timeStart=1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse end time: strconv.ParseInt: parsing \\\"\\\": invalid syntax\"}\n",
			prepare: func(mockClient *costmanagement.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getActualCosts(w, req)
			},
		},
		{
			name:               "could not get actual costs",
			pluginName:         "azure",
			url:                "/costmanagement/actualcosts?timeStart=1&timeEnd=1",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not query cost usage: could not get costs\"}\n",
			prepare: func(mockClient *costmanagement.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetActualCost", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(azureCostmanagement.QueryResult{}, fmt.Errorf("could not get costs"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CostManagementClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getActualCosts(w, req)
			},
		},
		{
			name:               "get actual costs",
			pluginName:         "azure",
			url:                "/costmanagement/actualcosts?timeStart=1&timeEnd=1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{}\n",
			prepare: func(mockClient *costmanagement.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetActualCost", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(azureCostmanagement.QueryResult{}, nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CostManagementClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getActualCosts(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &costmanagement.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/costmanagement", func(costManagementRouter chi.Router) {
				costManagementRouter.Get("/actualcosts", router.getActualCosts)
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