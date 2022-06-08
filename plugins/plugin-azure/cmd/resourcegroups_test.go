package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance/resourcegroups"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetResourceGroups(t *testing.T) {
	for _, tt := range []struct {
		name               string
		pluginName         string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *resourcegroups.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			pluginName:         "invalidname",
			url:                "/resourcegroups",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *resourcegroups.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getResourceGroups(w, req)
			},
		},
		{
			name:               "get resource groups fails",
			pluginName:         "azure",
			url:                "/resourcegroups",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not list resource groups: could not get resource groups\"}\n",
			prepare: func(mockClient *resourcegroups.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListResourceGroups", mock.Anything).Return(nil, fmt.Errorf("could not get resource groups"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("ResourceGroupsClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getResourceGroups(w, req)
			},
		},
		{
			name:               "get resource groups",
			pluginName:         "azure",
			url:                "/resourcegroups",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockClient *resourcegroups.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListResourceGroups", mock.Anything).Return(nil, nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("ResourceGroupsClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getResourceGroups(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &resourcegroups.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Get("/resourcegroups", router.getResourceGroups)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			req.Header.Add("x-kobs-plugin", tt.pluginName)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}
