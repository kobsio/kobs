package azure

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/azure/instance"
	"github.com/kobsio/kobs/pkg/plugins/azure/instance/costmanagement"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
)

func TestGetActualCosts(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, *costmanagement.MockClient, Router) {
		ctrl := gomock.NewController(t)
		mockCostmanagementClient := costmanagement.NewMockClient(ctrl)
		mockInstance := instance.NewMockInstance(ctrl)

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, mockCostmanagementClient, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/costmanagement/actualcosts", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getActualCosts(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid instance name"]}`)
	})

	t.Run("should fail for invalid start time", func(t *testing.T) {
		i, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/costmanagement/actualcosts", nil)
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getActualCosts(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse start time"]}`)
	})

	t.Run("should fail for invalid end time", func(t *testing.T) {
		i, _, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/costmanagement/actualcosts?timeStart=0", nil)
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getActualCosts(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse end time"]}`)
	})

	t.Run("should fail if cost management client returns error", func(t *testing.T) {
		i, cmc, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().CostManagementClient().Return(cmc)
		cmc.EXPECT().GetActualCosts(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/costmanagement/actualcosts?timeStart=0&timeEnd=0", nil)
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getActualCosts(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get actual costs"]}`)
	})

	t.Run("should return actual costs", func(t *testing.T) {
		i, cmc, router := newRouter(t)
		i.EXPECT().GetName().Return("azure")
		i.EXPECT().CostManagementClient().Return(cmc)
		cmc.EXPECT().GetActualCosts(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/costmanagement/actualcosts?timeStart=0&timeEnd=0", nil)
		req.Header.Set("x-kobs-plugin", "azure")
		w := httptest.NewRecorder()

		router.getActualCosts(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}
