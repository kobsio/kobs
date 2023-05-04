package sql

import (
	"testing"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/sql/instance"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
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

func TestMountCluster(t *testing.T) {
	ctrl := gomock.NewController(t)
	p := New()

	clusterRouter, err := p.MountCluster([]plugin.Instance{}, kubernetes.NewMockClient(ctrl))
	require.NoError(t, err)
	require.NotNil(t, clusterRouter)
}

func TestMountHub(t *testing.T) {
	ctrl := gomock.NewController(t)
	p := New()

	hubRouter, err := p.MountHub([]plugin.Instance{}, clusters.NewMockClient(ctrl), db.NewMockClient(ctrl))
	require.NoError(t, err)
	require.NotNil(t, hubRouter)
}
