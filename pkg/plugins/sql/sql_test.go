package sql

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/sql/instance"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"
)

func TestType(t *testing.T) {
	require.Equal(t, "sql", New().Type())
}

func TestGetInstance(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockInstance := instance.NewMockInstance(ctrl)
	mockInstance.EXPECT().GetName().Return("sql").Times(3)

	router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
	instance1 := router.getInstance("default")
	require.NotNil(t, instance1)

	instance2 := router.getInstance("sql")
	require.NotNil(t, instance2)

	instance3 := router.getInstance("invalidname")
	require.Nil(t, instance3)
}

func TestMount(t *testing.T) {
	router1, err := Mount([]plugin.Instance{{Name: "sql", Options: map[string]any{"driver": "mysql"}}}, nil)
	require.NoError(t, err)
	require.NotNil(t, router1)

	router2, err := Mount([]plugin.Instance{{Name: "sql", Options: map[string]any{"driver": "bigquery"}}}, nil)
	require.Error(t, err)
	require.Nil(t, router2)
}

func Test_getQueryResults(t *testing.T) {
	t.Run("should get rows from database", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{
			instances: []instance.Instance{mockInstance},
		}

		r, _ := http.NewRequest(http.MethodGet, "/query?query=select", nil)
		r.Header.Set("x-kobs-plugin", "sql")
		w := httptest.NewRecorder()

		mockInstance.EXPECT().GetName().Return("sql")
		mockInstance.EXPECT().GetQueryResults(gomock.Any(), "select").Return([]map[string]any{
			{
				"foo": "bar",
			},
		}, []string{"foo"}, nil)
		router.getQueryResults(w, r)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"rows": [{"foo": "bar"}], "columns": ["foo"]}`)
	})

	t.Run("should get error when instance is not found", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{
			instances: []instance.Instance{mockInstance},
		}

		r, _ := http.NewRequest(http.MethodGet, "/query", nil)
		w := httptest.NewRecorder()
		mockInstance.EXPECT().GetName().Return("sql")
		router.getQueryResults(w, r)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Could not find instance name"]}`)
	})

	t.Run("should get error when instance.GetQueryResults fails", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{
			instances: []instance.Instance{mockInstance},
		}

		r, _ := http.NewRequest(http.MethodGet, "/query?query=select", nil)
		r.Header.Set("x-kobs-plugin", "sql")
		w := httptest.NewRecorder()
		mockInstance.EXPECT().GetName().Return("sql")
		mockInstance.EXPECT().GetQueryResults(gomock.Any(), "select").Return(nil, nil, fmt.Errorf("unexpected error"))
		router.getQueryResults(w, r)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Could not get result for SQL query"]}`)
	})
}

func Test_getMetaInfo(t *testing.T) {
	t.Run("should respond with completions and dialect", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{
			instances: []instance.Instance{mockInstance},
		}

		r, _ := http.NewRequest(http.MethodGet, "/meta", nil)
		r.Header.Set("x-kobs-plugin", "sql")
		w := httptest.NewRecorder()
		mockInstance.EXPECT().GetName().Return("sql")
		mockInstance.EXPECT().GetDialect().Return("postgres")
		mockInstance.EXPECT().GetCompletions(gomock.Any()).Return(map[string][]string{"foo": {"first_column", "second_column"}}, nil)
		router.getMetaInfo(w, r)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"dialect": "postgres", "completions": {"foo": ["first_column", "second_column"]}}`)
	})

	t.Run("should get error when instance is not found", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{
			instances: []instance.Instance{mockInstance},
		}

		r, _ := http.NewRequest(http.MethodGet, "/meta", nil)
		w := httptest.NewRecorder()
		mockInstance.EXPECT().GetName().Return("sql")
		router.getMetaInfo(w, r)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Could not find instance name"]}`)
	})

	t.Run("should get error when GetCompletions fails", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{
			instances: []instance.Instance{mockInstance},
		}

		r, _ := http.NewRequest(http.MethodGet, "/meta", nil)
		r.Header.Set("x-kobs-plugin", "sql")
		w := httptest.NewRecorder()
		mockInstance.EXPECT().GetName().Return("sql")
		mockInstance.EXPECT().GetCompletions(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))
		router.getMetaInfo(w, r)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["could not get completions"]}`)
	})
}

func Test_Mount(t *testing.T) {
	ctrl := gomock.NewController(t)
	p := New()

	clusterRouter, err := p.MountCluster([]plugin.Instance{}, kubernetes.NewMockClient(ctrl))
	require.NoError(t, err)
	require.NotNil(t, clusterRouter)

	hubRouter, err := p.MountHub([]plugin.Instance{}, clusters.NewMockClient(ctrl), db.NewMockClient(ctrl))
	require.NoError(t, err)
	require.NotNil(t, hubRouter)
}
