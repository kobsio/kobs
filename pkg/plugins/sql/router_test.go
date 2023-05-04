package sql

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/sql/instance"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetQueryResults(t *testing.T) {
	t.Run("should get rows from database", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{
			instances: []instance.Instance{mockInstance},
		}

		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/query?query=select", nil)
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

		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/query", nil)
		w := httptest.NewRecorder()
		mockInstance.EXPECT().GetName().Return("sql")
		router.getQueryResults(w, r)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should get error when instance.GetQueryResults fails", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{
			instances: []instance.Instance{mockInstance},
		}

		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/query?query=select", nil)
		r.Header.Set("x-kobs-plugin", "sql")
		w := httptest.NewRecorder()
		mockInstance.EXPECT().GetName().Return("sql")
		mockInstance.EXPECT().GetQueryResults(gomock.Any(), "select").Return(nil, nil, fmt.Errorf("unexpected error"))
		router.getQueryResults(w, r)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get result for SQL query"]}`)
	})
}

func TestGetMetaInfo(t *testing.T) {
	t.Run("should respond with completions and dialect", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{
			instances: []instance.Instance{mockInstance},
		}

		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/meta", nil)
		r.Header.Set("x-kobs-plugin", "sql")
		w := httptest.NewRecorder()
		mockInstance.EXPECT().GetName().Return("sql")
		mockInstance.EXPECT().GetDialect().Return("postgres")
		mockInstance.EXPECT().GetCompletions().Return(map[string][]string{"foo": {"first_column", "second_column"}})
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

		r, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/meta", nil)
		w := httptest.NewRecorder()
		mockInstance.EXPECT().GetName().Return("sql")
		router.getMetaInfo(w, r)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})
}

func TestMount(t *testing.T) {
	router1, err := Mount([]plugin.Instance{{Name: "sql", Options: map[string]any{"driver": "mysql", "database": "mydb"}}}, nil)
	require.NoError(t, err)
	require.NotNil(t, router1)

	router2, err := Mount([]plugin.Instance{{Name: "sql", Options: map[string]any{"driver": "unknown"}}}, nil)
	require.Error(t, err)
	require.Nil(t, router2)
}
