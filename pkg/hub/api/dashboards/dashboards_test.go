package dashboards

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/golang/mock/gomock"
	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"

	"github.com/go-chi/chi/v5"
)

func TestGetDashboardsFromReferences(t *testing.T) {
	t.Run("decode json error", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)

		router := Router{chi.NewRouter(), dbClient}
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/dashboards", strings.NewReader("bad json"))
		w := httptest.NewRecorder()

		router.getDashboardsFromReferences(w, req)

		utils.AssertStatusEq(t, http.StatusBadRequest, w)
		utils.AssertJSONEq(t, `{"error": "could not decode request body"}`, w)
	})

	t.Run("get dashboard by id error", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetDashboardByID(gomock.Any(), "/cluster/cluster1/namespace/namespace1/name/name1").Return(nil, fmt.Errorf("could not get dashboard"))

		router := Router{chi.NewRouter(), dbClient}
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/dashboards", strings.NewReader(`[{"cluster":"cluster1","namespace":"namespace1","name":"name1","title":"Title 1"}]`))
		w := httptest.NewRecorder()

		router.getDashboardsFromReferences(w, req)

		utils.AssertStatusEq(t, http.StatusBadRequest, w)
		utils.AssertJSONEq(t, `{"error": "could not get dashboard"}`, w)
	})

	t.Run("can get dashboards", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetDashboardByID(gomock.Any(), "/cluster/cluster1/namespace/namespace1/name/name1").Return(&dashboardv1.DashboardSpec{}, nil)

		router := Router{chi.NewRouter(), dbClient}
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/dashboards", strings.NewReader(`[{"title":"Kubernetes Workloads","inline":{"rows":[{"panels":[{"title":"Workloads","plugin":{"name":"resources","options":[{"namespaces":["test-service"],"resources":["pods","deployments"],"selector":"app=test-service"}]}}]}]}},{"cluster":"cluster1","namespace":"namespace1","name":"name1","title":"Title 1"}]`))
		w := httptest.NewRecorder()

		router.getDashboardsFromReferences(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `[{"title":"Kubernetes Workloads","panels":null},{"title":"Title 1","panels":null}]`, w)
	})
}

func TestGetDashboard(t *testing.T) {
	t.Run("get dashboard by id error", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetDashboardByID(gomock.Any(), "/cluster/cluster1/namespace/namespace1/name/name1").Return(nil, fmt.Errorf("could not get dashboard"))
		router := Router{chi.NewRouter(), dbClient}
		router.Get("/dashboard", router.getDashboard)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboard?id=/cluster/cluster1/namespace/namespace1/name/name1", nil)
		w := httptest.NewRecorder()

		router.getDashboard(w, req)

		utils.AssertStatusEq(t, http.StatusBadRequest, w)
		utils.AssertJSONEq(t, `{"error": "could not get dashboard"}`, w)
	})

	t.Run("can get dashboards", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetDashboardByID(gomock.Any(), "/cluster/cluster1/namespace/namespace1/name/name1").Return(&dashboardv1.DashboardSpec{Placeholders: []dashboardv1.Placeholder{{Name: "key1"}}}, nil)
		router := Router{chi.NewRouter(), dbClient}
		router.Get("/dashboard", router.getDashboard)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/dashboard?id=/cluster/cluster1/namespace/namespace1/name/name1&key1=value1", nil)
		w := httptest.NewRecorder()

		router.getDashboard(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `{"placeholders":[{"name":"key1"}],"variables":[{"name":"key1","label":"key1","hide":true,"plugin":{"type":"app","cluster":"","name":"placeholder","options":{"type":"string","value":"value1"}}}],"panels":null}`, w)
	})
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
