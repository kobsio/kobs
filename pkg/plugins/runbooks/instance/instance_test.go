package instance

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/clusters/cluster"
	"github.com/kobsio/kobs/pkg/hub/db"

	gomock "github.com/golang/mock/gomock"
	"github.com/orlangure/gnomock"
	"github.com/orlangure/gnomock/preset/mongo"
	"github.com/stretchr/testify/require"
)

func setupDatabase(t *testing.T) (string, *gnomock.Container) {
	err := os.MkdirAll("/tmp/mongodb/", os.ModePerm)
	if err != nil {
		t.Fatal(err)
	}
	p := mongo.Preset(mongo.WithData("/tmp/mongodb/"))
	c, err := gnomock.Start(p)
	if err != nil {
		t.Fatal(err)
	}

	return fmt.Sprintf("mongodb://%s", c.DefaultAddress()), c
}

func TestGetName(t *testing.T) {
	instance := &instance{
		name: "runbooks",
	}

	require.Equal(t, "runbooks", instance.GetName())
}

func TestSyncAndGetRunbooks(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockClusters := clusters.NewMockClient(ctrl)
	mockCluster := cluster.NewMockClient(ctrl)

	mockClusters.EXPECT().GetClusters().Return([]cluster.Client{mockCluster})
	mockCluster.EXPECT().Request(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(map[string]any{
		"items": []map[string]any{{
			"spec": map[string]any{
				"groups": []map[string]any{{
					"name": "test",
					"rules": []map[string]any{{
						"alert": "test",
						"expr":  "vector(1)",
						"for":   "1m",
						"labels": map[string]any{
							"severity": "info",
						},
						"annotations": map[string]any{
							"message": "Test alert message",
							"runbook": "Test runbook",
						},
					}},
				}},
			},
		}},
	}, nil)

	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	dbClient, _ := db.NewClient(db.Config{URI: uri})

	i := &instance{
		name:           "runbooks",
		clustersClient: mockClusters,
		dbClient:       dbClient,
	}

	err := i.SyncRunbooks(context.Background())
	require.NoError(t, err)

	runbooks1, err := i.GetRunbooks(context.Background(), "", "", "")
	require.NoError(t, err)
	require.Equal(t, 1, len(runbooks1))
	require.Equal(t, "test", runbooks1[0].Group)
	require.Equal(t, "test", runbooks1[0].Alert)
	require.Equal(t, "vector(1)", runbooks1[0].Expr)
	require.Equal(t, "info", runbooks1[0].Severity)
	require.Equal(t, "Test alert message", runbooks1[0].Message)
	require.Equal(t, "Test runbook", runbooks1[0].Runbook)

	runbooks2, err := i.GetRunbooks(context.Background(), "", "test", "test")
	require.NoError(t, err)
	require.Equal(t, 1, len(runbooks2))
	require.Equal(t, "test", runbooks2[0].Group)
	require.Equal(t, "test", runbooks2[0].Alert)
	require.Equal(t, "vector(1)", runbooks2[0].Expr)
	require.Equal(t, "info", runbooks2[0].Severity)
	require.Equal(t, "Test alert message", runbooks2[0].Message)
	require.Equal(t, "Test runbook", runbooks2[0].Runbook)

	runbooks3, err := i.GetRunbooks(context.Background(), "", "", "test")
	require.NoError(t, err)
	require.Equal(t, 1, len(runbooks3))
	require.Equal(t, "test", runbooks3[0].Group)
	require.Equal(t, "test", runbooks3[0].Alert)
	require.Equal(t, "vector(1)", runbooks3[0].Expr)
	require.Equal(t, "info", runbooks3[0].Severity)
	require.Equal(t, "Test alert message", runbooks3[0].Message)
	require.Equal(t, "Test runbook", runbooks3[0].Runbook)

	runbooks4, err := i.GetRunbooks(context.Background(), "test", "", "")
	require.NoError(t, err)
	require.Equal(t, 1, len(runbooks4))
	require.Equal(t, "test", runbooks4[0].Group)
	require.Equal(t, "test", runbooks4[0].Alert)
	require.Equal(t, "vector(1)", runbooks4[0].Expr)
	require.Equal(t, "info", runbooks4[0].Severity)
	require.Equal(t, "Test alert message", runbooks4[0].Message)
	require.Equal(t, "Test runbook", runbooks4[0].Runbook)
}

func TestNew(t *testing.T) {
	t.Run("should return error for invalid options", func(t *testing.T) {
		instance, err := New("runbooks", map[string]any{"resource": []string{"fake"}}, nil, nil)
		require.Error(t, err)
		require.Nil(t, instance)
	})

	t.Run("should return instance with default metrics", func(t *testing.T) {
		instance, err := New("runbooks", map[string]any{"resource": "fake"}, nil, nil)
		require.NoError(t, err)
		require.NotNil(t, instance)
	})
}
