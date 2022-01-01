package azure

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/virtualmachinescalesets"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/compute/armcompute"
	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetVirtualMachineScaleSets(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			url:                "/invalidname/virtualmachinescalesets/virtualmachinescalesets",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getVirtualMachineScaleSets(w, req)
			},
		},
		{
			name:               "no user context",
			url:                "/azure/virtualmachinescalesets/virtualmachinescalesets",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to list virtual machine scale sets: Unauthorized\"}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getVirtualMachineScaleSets(w, req)
			},
		},
		{
			name:               "check permissions fails",
			url:                "/azure/virtualmachinescalesets/virtualmachinescalesets?resourceGroup=resourcegroup1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getVirtualMachineScaleSets(w, req)
			},
		},
		{
			name:               "get virtual machine scale sets fails",
			url:                "/azure/virtualmachinescalesets/virtualmachinescalesets?resourceGroup=resourcegroup1",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not list virtual machine scale sets: could not get virtual machine scale sets\"}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListVirtualMachineScaleSets", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get virtual machine scale sets"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("VirtualMachineScaleSetsClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getVirtualMachineScaleSets(w, req)
			},
		},
		{
			name:               "get virtual machine scale sets",
			url:                "/azure/virtualmachinescalesets/virtualmachinescalesets?resourceGroup=resourcegroup1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"id\":\"containergroup1\"}]\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListVirtualMachineScaleSets", mock.Anything, mock.Anything).Return([]*armcompute.VirtualMachineScaleSet{{Resource: armcompute.Resource{ID: to.StringPtr("containergroup1")}}}, nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("VirtualMachineScaleSetsClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getVirtualMachineScaleSets(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &virtualmachinescalesets.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/{name}", func(r chi.Router) {
				r.Route("/virtualmachinescalesets", func(virtualMachineScaleSetsRouter chi.Router) {
					virtualMachineScaleSetsRouter.Get("/virtualmachinescalesets", router.getVirtualMachineScaleSets)
					virtualMachineScaleSetsRouter.Get("/virtualmachinescaleset/details", router.getVirtualMachineScaleSetDetails)
					virtualMachineScaleSetsRouter.Get("/virtualmachines", router.getVirtualMachines)
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

func TestGetVirtualMachineScaleSetDetails(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			url:                "/invalidname/virtualmachinescalesets/virtualmachinescaleset/details",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getVirtualMachineScaleSetDetails(w, req)
			},
		},
		{
			name:               "no user context",
			url:                "/azure/virtualmachinescalesets/virtualmachinescaleset/details",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to get virtual machine scale set: Unauthorized\"}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getVirtualMachineScaleSetDetails(w, req)
			},
		},
		{
			name:               "check permissions fails",
			url:                "/azure/virtualmachinescalesets/virtualmachinescaleset/details",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to get the virtual machine scale set: access forbidden\"}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getVirtualMachineScaleSetDetails(w, req)
			},
		},
		{
			name:               "get virtual machine scale set fails",
			url:                "/azure/virtualmachinescalesets/virtualmachinescaleset/details",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get virtual machine scale set: could not get virtual machine scale set\"}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetVirtualMachineScaleSet", mock.Anything, mock.Anything, mock.Anything).Return(armcompute.VirtualMachineScaleSetsGetResponse{}, fmt.Errorf("could not get virtual machine scale set"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("VirtualMachineScaleSetsClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getVirtualMachineScaleSetDetails(w, req)
			},
		},
		{
			name:               "get virtual machine scale set",
			url:                "/azure/virtualmachinescalesets/virtualmachinescaleset/details",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("GetVirtualMachineScaleSet", mock.Anything, mock.Anything, mock.Anything).Return(armcompute.VirtualMachineScaleSetsGetResponse{}, nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("VirtualMachineScaleSetsClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getVirtualMachineScaleSetDetails(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &virtualmachinescalesets.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/{name}", func(r chi.Router) {
				r.Route("/virtualmachinescalesets", func(virtualMachineScaleSetsRouter chi.Router) {
					virtualMachineScaleSetsRouter.Get("/virtualmachinescalesets", router.getVirtualMachineScaleSets)
					virtualMachineScaleSetsRouter.Get("/virtualmachinescaleset/details", router.getVirtualMachineScaleSetDetails)
					virtualMachineScaleSetsRouter.Get("/virtualmachines", router.getVirtualMachines)
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

func TestGetVirtualMachines(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "invalid instance name",
			url:                "/invalidname/virtualmachines",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getVirtualMachines(w, req)
			},
		},
		{
			name:               "no user context",
			url:                "/azure/virtualmachines",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to list virtual machines: Unauthorized\"}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getVirtualMachines(w, req)
			},
		},
		{
			name:               "check permissions fails",
			url:                "/azure/virtualmachines",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to list the virtual machines: access forbidden\"}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getVirtualMachines(w, req)
			},
		},
		{
			name:               "get virtual machines fails",
			url:                "/azure/virtualmachines",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get virtual machines: could not get virtual machines\"}\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListVirtualMachines", mock.Anything, mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get virtual machines"))

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("VirtualMachineScaleSetsClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getVirtualMachines(w, req)
			},
		},
		{
			name:               "get virtual machines",
			url:                "/azure/virtualmachines",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockClient *virtualmachinescalesets.MockClient, mockInstance *instance.MockInstance) {
				mockClient.On("ListVirtualMachines", mock.Anything, mock.Anything, mock.Anything).Return(nil, nil)

				mockInstance.On("GetName").Return("azure")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
				mockInstance.On("VirtualMachineScaleSetsClient").Return(mockClient)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getVirtualMachines(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &virtualmachinescalesets.MockClient{}
			mockClient.AssertExpectations(t)

			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)

			tt.prepare(mockClient, mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/{name}", func(r chi.Router) {
				r.Route("/virtualmachinescalesets", func(virtualMachineScaleSetsRouter chi.Router) {
					virtualMachineScaleSetsRouter.Get("/virtualmachinescalesets", router.getVirtualMachineScaleSets)
					virtualMachineScaleSetsRouter.Get("/virtualmachinescaleset/details", router.getVirtualMachineScaleSetDetails)
					virtualMachineScaleSetsRouter.Get("/virtualmachines", router.getVirtualMachines)
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
