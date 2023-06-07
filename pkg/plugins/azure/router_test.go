package azure

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/azure/instance"
	"github.com/kobsio/kobs/pkg/plugins/azure/instance/costmanagement"
	"github.com/kobsio/kobs/pkg/plugins/azure/instance/kubernetesservices"
	"github.com/kobsio/kobs/pkg/plugins/azure/instance/resourcegroups"
	"github.com/kobsio/kobs/pkg/plugins/azure/instance/virtualmachinescalesets"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("azure")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("azure")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("azure")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("azure")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestGetVariable(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, *costmanagement.MockClient, *resourcegroups.MockClient, *kubernetesservices.MockClient, *virtualmachinescalesets.MockClient, Router) {
		ctrl := gomock.NewController(t)
		mockCostmanagementClient := costmanagement.NewMockClient(ctrl)
		mockResourceGroupsClient := resourcegroups.NewMockClient(ctrl)
		mockRubernetesServicesClient := kubernetesservices.NewMockClient(ctrl)
		mockVirtualMachineScaleSetsClient := virtualmachinescalesets.NewMockClient(ctrl)
		mockInstance := instance.NewMockInstance(ctrl)

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, mockCostmanagementClient, mockResourceGroupsClient, mockRubernetesServicesClient, mockVirtualMachineScaleSetsClient, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, _, _, _, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/variable", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getVariable(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid instance name"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, _, _, _, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/variable", strings.NewReader(`{"type": ["test"]}`))
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getVariable(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to decode request body"]}`)
	})

	t.Run("should fail for invalid type", func(t *testing.T) {
		i, _, _, _, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/variable", strings.NewReader(`{"type": "test"}`))
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getVariable(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid request type"]}`)
	})

	t.Run("should return empty list for resource groups error", func(t *testing.T) {
		i, _, rgc, _, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().ResourceGroupsClient().Return(rgc)
		rgc.EXPECT().ListResourceGroups(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/variable", strings.NewReader(`{"type": "Resource Groups"}`))
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getVariable(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[]`)
	})

	t.Run("should return resource groups", func(t *testing.T) {
		i, _, rgc, _, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().ResourceGroupsClient().Return(rgc)
		rgc.EXPECT().ListResourceGroups(gomock.Any()).Return([]string{"test"}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/variable", strings.NewReader(`{"type": "Resource Groups"}`))
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getVariable(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `["test"]`)
	})

	t.Run("should return empty list for kubernetes services error", func(t *testing.T) {
		i, _, _, ksc, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().KubernetesServicesClient().Return(ksc)
		ksc.EXPECT().ListManagedClusters(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/variable", strings.NewReader(`{"type": "Kubernetes Services"}`))
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getVariable(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[]`)
	})

	t.Run("should return kubernetes services", func(t *testing.T) {
		i, _, _, ksc, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().KubernetesServicesClient().Return(ksc)
		ksc.EXPECT().ListManagedClusters(gomock.Any(), gomock.Any()).Return([]string{"test"}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/variable", strings.NewReader(`{"type": "Kubernetes Services"}`))
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getVariable(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `["test"]`)
	})

	t.Run("should return empty list for vmss error", func(t *testing.T) {
		i, _, _, _, vmssc, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().VirtualMachineScaleSetsClient().Return(vmssc)
		vmssc.EXPECT().ListVirtualMachineScaleSets(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/variable", strings.NewReader(`{"type": "Virtual Machine Scale Sets"}`))
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getVariable(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[]`)
	})

	t.Run("should return vmss", func(t *testing.T) {
		i, _, _, _, vmssc, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().VirtualMachineScaleSetsClient().Return(vmssc)
		vmssc.EXPECT().ListVirtualMachineScaleSets(gomock.Any(), gomock.Any()).Return([]string{"test"}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/variable", strings.NewReader(`{"type": "Virtual Machine Scale Sets"}`))
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getVariable(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `["test"]`)
	})

	t.Run("should return empty list for vmss virtual machines error", func(t *testing.T) {
		i, _, _, _, vmssc, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().VirtualMachineScaleSetsClient().Return(vmssc)
		vmssc.EXPECT().ListVirtualMachines(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/variable", strings.NewReader(`{"type": "Virtual Machine Scale Sets - Virtual Machines"}`))
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getVariable(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[]`)
	})

	t.Run("should return vmss virtual machines", func(t *testing.T) {
		i, _, _, _, vmssc, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().VirtualMachineScaleSetsClient().Return(vmssc)
		vmssc.EXPECT().ListVirtualMachines(gomock.Any(), gomock.Any(), gomock.Any()).Return([]string{"test"}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/variable", strings.NewReader(`{"type": "Virtual Machine Scale Sets - Virtual Machines"}`))
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getVariable(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `["test"]`)
	})
}
