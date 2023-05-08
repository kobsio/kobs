package dashboards

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetDashboards(t *testing.T) {
	t.Run("should return error from db client", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetDashboards(gomock.Any(), []string{"test"}, []string{"default"}).Return(nil, fmt.Errorf("unexpected error"))

		router := Router{chi.NewRouter(), dbClient}
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboards?cluster=test&namespace=default", nil)
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get dashboards"]}`)
	})

	t.Run("should return dashboards", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetDashboards(gomock.Any(), []string{"test"}, []string{"default"}).Return([]dashboardv1.DashboardSpec{{Title: "test", Cluster: "test", Namespace: "default", Name: "test"}}, nil)

		router := Router{chi.NewRouter(), dbClient}
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboards?cluster=test&namespace=default", nil)
		w := httptest.NewRecorder()

		router.getDashboards(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[{"cluster":"test", "name":"test", "namespace":"default", "rows": null, "title":"test"}]`)
	})
}

func TestGetDashboardsFromReferences(t *testing.T) {
	t.Run("should return error for invalid request body", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)

		router := Router{chi.NewRouter(), dbClient}
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/dashboards", strings.NewReader("bad json"))
		w := httptest.NewRecorder()

		router.getDashboardsFromReferences(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to decode request body"]}`)
	})

	t.Run("should handle error from db client", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetDashboardByID(gomock.Any(), "/cluster/cluster1/namespace/namespace1/name/name1").Return(nil, fmt.Errorf("could not get dashboard"))

		router := Router{chi.NewRouter(), dbClient}
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/dashboards", strings.NewReader(`[{"cluster":"cluster1","namespace":"namespace1","name":"name1","title":"Title 1"}]`))
		w := httptest.NewRecorder()

		router.getDashboardsFromReferences(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get dashboard"]}`)
	})

	t.Run("should return dashboards", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetDashboardByID(gomock.Any(), "/cluster/cluster1/namespace/namespace1/name/name1").Return(&dashboardv1.DashboardSpec{}, nil)

		router := Router{chi.NewRouter(), dbClient}
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/dashboards", strings.NewReader(`[{"title":"Kubernetes Workloads","inline":{"rows":[{"panels":[{"title":"Workloads","plugin":{"name":"resources","options":[{"namespaces":["test-service"],"resources":["pods","deployments"],"selector":"app=test-service"}]}}]}]}},{"cluster":"cluster1","namespace":"namespace1","name":"name1","title":"Title 1"}]`))
		w := httptest.NewRecorder()

		router.getDashboardsFromReferences(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[{"title":"Kubernetes Workloads","rows":[{"panels":[{"title":"Workloads","plugin":{"type":"","name":"resources","options":[{"namespaces":["test-service"],"resources":["pods","deployments"],"selector":"app=test-service"}]}}]}]},{"title":"Title 1","rows":null}]`)
	})
}

func TestGetDashboard(t *testing.T) {
	t.Run("should handle error from db client", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetDashboardByID(gomock.Any(), "/cluster/cluster1/namespace/namespace1/name/name1").Return(nil, fmt.Errorf("could not get dashboard"))
		router := Router{chi.NewRouter(), dbClient}
		router.Get("/dashboard", router.getDashboard)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboard?id=/cluster/cluster1/namespace/namespace1/name/name1", nil)
		w := httptest.NewRecorder()

		router.getDashboard(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get dashboard"]}`)
	})

	t.Run("should return dashboards", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetDashboardByID(gomock.Any(), "/cluster/cluster1/namespace/namespace1/name/name1").Return(&dashboardv1.DashboardSpec{Placeholders: []dashboardv1.Placeholder{{Name: "key1"}}}, nil)
		router := Router{chi.NewRouter(), dbClient}
		router.Get("/dashboard", router.getDashboard)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboard?id=/cluster/cluster1/namespace/namespace1/name/name1&key1=value1", nil)
		w := httptest.NewRecorder()

		router.getDashboard(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"placeholders":[{"name":"key1"}],"variables":[{"name":"key1","label":"key1","hide":true,"plugin":{"type":"core","name":"placeholder","options":{"type":"string","value":"value1"}}}],"rows":null}`)
	})
}

func TestMount(t *testing.T) {
	router := Mount(nil)
	require.NotNil(t, router)
}
