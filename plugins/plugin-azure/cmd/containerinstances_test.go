package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance/containerinstances"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/containerinstance/armcontainerinstance"
	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetContainerGroups(t *testing.T) {
	for _, tt := range []struct {
		name               string
		pluginName         string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			pluginName:         "invalidname",
			url:                "/containerinstances/containergroups",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getContainerGroups(w, req)
			},
		},
		{
			name:               "no user context",
			pluginName:         "azure",
			url:                "/containerinstances/containergroups",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to get container groups: Unauthorized\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getContainerGroups(w, req)
			},
		},
		{
			name:               "check permissions fails",
			pluginName:         "azure",
			url:                "/containerinstances/containergroups?resourceGroup=resourcegroup1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getContainerGroups(w, req)
			},
		},
		{
			name:               "get container groups fails",
			pluginName:         "azure",
			url:                "/containerinstances/containergroups?resourceGroup=resourcegroup1",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not list container groups: could not get container groups\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListContainerGroups", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get container groups"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("ContainerInstancesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getContainerGroups(w, req)
			},
		},
		{
			name:               "get container groups",
			pluginName:         "azure",
			url:                "/containerinstances/containergroups?resourceGroup=resourcegroup1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"id\":\"containergroup1\"}]\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListContainerGroups", mock.Anything, mock.Anything).Return([]*armcontainerinstance.ContainerGroup{{ID: to.Ptr("containergroup1")}}, nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("ContainerInstancesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getContainerGroups(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &containerinstances.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/containerinstances", func(containerInstancesRouter chi.Router) {
				containerInstancesRouter.Get("/containergroups", router.getContainerGroups)
				containerInstancesRouter.Get("/containergroup/details", router.getContainerGroup)
				containerInstancesRouter.Get("/containergroup/logs", router.getContainerLogs)
				containerInstancesRouter.Put("/containergroup/restart", router.restartContainerGroup)
			})

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			req.Header.Set("x-kobs-plugin", tt.pluginName)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetContainerGroup(t *testing.T) {
	for _, tt := range []struct {
		name               string
		pluginName         string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			pluginName:         "invalidname",
			url:                "/containerinstances/containergroup/details",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getContainerGroup(w, req)
			},
		},
		{
			name:               "no user context",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/details",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to get container group: Unauthorized\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getContainerGroup(w, req)
			},
		},
		{
			name:               "check permissions fails",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/details",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to get the container instance: access forbidden\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getContainerGroup(w, req)
			},
		},
		{
			name:               "get container group fails",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/details",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get container instances: could not get container group\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetContainerGroup", mock.Anything, mock.Anything, mock.Anything).Return(armcontainerinstance.ContainerGroupsClientGetResponse{}, fmt.Errorf("could not get container group"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("ContainerInstancesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getContainerGroup(w, req)
			},
		},
		{
			name:               "get container group",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/details",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetContainerGroup", mock.Anything, mock.Anything, mock.Anything).Return(armcontainerinstance.ContainerGroupsClientGetResponse{}, nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("ContainerInstancesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getContainerGroup(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &containerinstances.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/containerinstances", func(containerInstancesRouter chi.Router) {
				containerInstancesRouter.Get("/containergroups", router.getContainerGroups)
				containerInstancesRouter.Get("/containergroup/details", router.getContainerGroup)
				containerInstancesRouter.Get("/containergroup/logs", router.getContainerLogs)
				containerInstancesRouter.Put("/containergroup/restart", router.restartContainerGroup)
			})

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			req.Header.Set("x-kobs-plugin", tt.pluginName)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestRestartContainerGroup(t *testing.T) {
	for _, tt := range []struct {
		name               string
		pluginName         string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			pluginName:         "invalidname",
			url:                "/containerinstances/containergroup/restart",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.restartContainerGroup(w, req)
			},
		},
		{
			name:               "no user context",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/restart",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to restart container group: Unauthorized\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.restartContainerGroup(w, req)
			},
		},
		{
			name:               "check permissions fails",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/restart",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to restart the container instance: access forbidden\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.restartContainerGroup(w, req)
			},
		},
		{
			name:               "restart container group fails",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/restart",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get restart container group: could not restart container group\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("RestartContainerGroup", mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("could not restart container group"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("ContainerInstancesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.restartContainerGroup(w, req)
			},
		},
		{
			name:               "restart container group",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/restart",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("RestartContainerGroup", mock.Anything, mock.Anything, mock.Anything).Return(nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("ContainerInstancesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.restartContainerGroup(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &containerinstances.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/containerinstances", func(containerInstancesRouter chi.Router) {
				containerInstancesRouter.Get("/containergroups", router.getContainerGroups)
				containerInstancesRouter.Get("/containergroup/details", router.getContainerGroup)
				containerInstancesRouter.Get("/containergroup/logs", router.getContainerLogs)
				containerInstancesRouter.Put("/containergroup/restart", router.restartContainerGroup)
			})

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			req.Header.Set("x-kobs-plugin", tt.pluginName)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetContainerLogs(t *testing.T) {
	for _, tt := range []struct {
		name               string
		pluginName         string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			pluginName:         "invalidname",
			url:                "/containerinstances/containergroup/logs",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getContainerLogs(w, req)
			},
		},

		{
			name:               "invalid tail parameter",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/logs",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse tail: strconv.ParseInt: parsing \\\"\\\": invalid syntax\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getContainerLogs(w, req)
			},
		},
		{
			name:               "invalid timestamps paramter",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/logs?tail=10000",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse timestamps: strconv.ParseBool: parsing \\\"\\\": invalid syntax\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getContainerLogs(w, req)
			},
		},
		{
			name:               "no user context",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/logs?tail=10000&timestamps=false",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to get container logs: Unauthorized\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getContainerLogs(w, req)
			},
		},
		{
			name:               "check permissions fails",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/logs?tail=10000&timestamps=false",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to get the logs of the container instance: access forbidden\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getContainerLogs(w, req)
			},
		},
		{
			name:               "get container logs fails",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/logs?tail=10000&timestamps=false",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get container logs: could not get container logs\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetContainerLogs", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get container logs"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("ContainerInstancesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getContainerLogs(w, req)
			},
		},
		{
			name:               "get container logs",
			pluginName:         "azure",
			url:                "/containerinstances/containergroup/logs?tail=10000&timestamps=false",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"logs\":\"log line\"}\n",
			prepare: func(mockClient *containerinstances.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetContainerLogs", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(to.Ptr("log line"), nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("ContainerInstancesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getContainerLogs(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &containerinstances.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/containerinstances", func(containerInstancesRouter chi.Router) {
				containerInstancesRouter.Get("/containergroups", router.getContainerGroups)
				containerInstancesRouter.Get("/containergroup/details", router.getContainerGroup)
				containerInstancesRouter.Get("/containergroup/logs", router.getContainerLogs)
				containerInstancesRouter.Put("/containergroup/restart", router.restartContainerGroup)
			})

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			req.Header.Set("x-kobs-plugin", tt.pluginName)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}
