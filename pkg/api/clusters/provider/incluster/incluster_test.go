package incluster

import (
	"fmt"
	"testing"

	"github.com/kobsio/kobs/pkg/api/clusters/cluster"

	"github.com/stretchr/testify/require"
	"k8s.io/client-go/rest"
)

func getInClusterConfigError() (*rest.Config, error) {
	return nil, fmt.Errorf("could not create incluster config")
}

func getInClusterConfigSuccess() (*rest.Config, error) {
	return nil, nil
}

func getNewClusterTestError(name string, restConfig *rest.Config) (cluster.Client, error) {
	return nil, fmt.Errorf("could not create cluster")
}

func getNewClusterTestSuccess(name string, restConfig *rest.Config) (cluster.Client, error) {
	return &cluster.MockClient{}, nil
}

func TestGetClusters(t *testing.T) {
	t.Run("could not create in cluster config", func(t *testing.T) {
		getInClusterConfig = getInClusterConfigError

		client := New(&Config{Name: "kobs"})
		clusters, err := client.GetCluster()
		require.Error(t, err)
		require.Empty(t, clusters)
	})

	t.Run("new cluster fails", func(t *testing.T) {
		getInClusterConfig = getInClusterConfigSuccess
		getNewCluster = getNewClusterTestError

		client := New(&Config{Name: "kobs"})
		clusters, err := client.GetCluster()
		require.Error(t, err)
		require.Empty(t, clusters)
	})

	t.Run("new cluster", func(t *testing.T) {
		getInClusterConfig = getInClusterConfigSuccess
		getNewCluster = getNewClusterTestSuccess

		client := New(&Config{Name: "kobs"})
		clusters, err := client.GetCluster()
		require.NoError(t, err)
		require.NotEmpty(t, clusters)
	})
}

func TestNew(t *testing.T) {
	client := New(&Config{})
	require.NotEmpty(t, client)
}
