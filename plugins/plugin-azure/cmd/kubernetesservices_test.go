package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance/kubernetesservices"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/containerservice/armcontainerservice"
	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetManagedClusters(t *testing.T) {
	for _, tt := range []struct {
		name               string
		pluginName         string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			pluginName:         "invalidname",
			url:                "/kubernetesservices/managedclusters",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getManagedClusters(w, req)
			},
		},
		{
			name:               "no user context",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedclusters",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to list managed clusters: Unauthorized\"}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getManagedClusters(w, req)
			},
		},
		{
			name:               "check permissions fails",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedclusters?resourceGroup=resourcegroup1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getManagedClusters(w, req)
			},
		},
		{
			name:               "get managed clusters fails",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedclusters?resourceGroup=resourcegroup1",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not list managed clusters: could not get managed clusters\"}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListManagedClusters", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get managed clusters"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("KubernetesServicesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getManagedClusters(w, req)
			},
		},
		{
			name:               "get managed clusters",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedclusters?resourceGroup=resourcegroup1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"id\":\"managedcluster1\"}]\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListManagedClusters", mock.Anything, mock.Anything).Return([]*armcontainerservice.ManagedCluster{{ID: to.Ptr("managedcluster1")}}, nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("KubernetesServicesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getManagedClusters(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &kubernetesservices.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

			router.Route("/kubernetesservices", func(kubernetesServicesRouter chi.Router) {
				kubernetesServicesRouter.Get("/managedclusters", router.getManagedClusters)
				kubernetesServicesRouter.Get("/managedcluster/details", router.getManagedCluster)
				kubernetesServicesRouter.Get("/managedcluster/nodepools", router.getNodePools)
			})

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			req.Header.Add("x-kobs-plugin", tt.pluginName)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetManagedCluster(t *testing.T) {
	for _, tt := range []struct {
		name               string
		pluginName         string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			pluginName:         "invalidname",
			url:                "/kubernetesservices/managedcluster/details",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getManagedCluster(w, req)
			},
		},
		{
			name:               "no user context",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedcluster/details",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to get managed cluster: Unauthorized\"}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getManagedCluster(w, req)
			},
		},
		{
			name:               "check permissions fails",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedcluster/details",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to get the managed cluster: access forbidden\"}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getManagedCluster(w, req)
			},
		},
		{
			name:               "get managed cluster fails",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedcluster/details",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get managed cluster: could not get managed cluster\"}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetManagedCluster", mock.Anything, mock.Anything, mock.Anything).Return(armcontainerservice.ManagedClustersClientGetResponse{}, fmt.Errorf("could not get managed cluster"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("KubernetesServicesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getManagedCluster(w, req)
			},
		},
		{
			name:               "get managed cluster",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedcluster/details",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetManagedCluster", mock.Anything, mock.Anything, mock.Anything).Return(armcontainerservice.ManagedClustersClientGetResponse{}, nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("KubernetesServicesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getManagedCluster(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &kubernetesservices.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/kubernetesservices", func(kubernetesServicesRouter chi.Router) {
				kubernetesServicesRouter.Get("/managedclusters", router.getManagedClusters)
				kubernetesServicesRouter.Get("/managedcluster/details", router.getManagedCluster)
				kubernetesServicesRouter.Get("/managedcluster/nodepools", router.getNodePools)
			})

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			req.Header.Add("x-kobs-plugin", tt.pluginName)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetNodePools(t *testing.T) {
	for _, tt := range []struct {
		name               string
		pluginName         string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			pluginName:         "invalidname",
			url:                "/kubernetesservices/managedcluster/nodepools",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getNodePools(w, req)
			},
		},
		{
			name:               "no user context",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedcluster/nodepools",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to get node pools: Unauthorized\"}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getNodePools(w, req)
			},
		},
		{
			name:               "check permissions fails",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedcluster/nodepools",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to get the node pools of the managed cluster: access forbidden\"}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getNodePools(w, req)
			},
		},
		{
			name:               "get node pools fails",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedcluster/nodepools",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get node pools: could not node pools\"}\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListNodePools", mock.Anything, mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not node pools"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("KubernetesServicesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getNodePools(w, req)
			},
		},
		{
			name:               "get node pools",
			pluginName:         "azure",
			url:                "/kubernetesservices/managedcluster/nodepools",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockClient *kubernetesservices.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListNodePools", mock.Anything, mock.Anything, mock.Anything).Return(nil, nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("KubernetesServicesClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getNodePools(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &kubernetesservices.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/kubernetesservices", func(kubernetesServicesRouter chi.Router) {
				kubernetesServicesRouter.Get("/managedclusters", router.getManagedClusters)
				kubernetesServicesRouter.Get("/managedcluster/details", router.getManagedCluster)
				kubernetesServicesRouter.Get("/managedcluster/nodepools", router.getNodePools)
			})

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			req.Header.Add("x-kobs-plugin", tt.pluginName)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}
