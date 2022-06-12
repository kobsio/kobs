package clusters

import (
	"testing"

	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"
	"github.com/kobsio/kobs/pkg/kube/clusters/provider"

	"github.com/stretchr/testify/require"
)

func TestGetClusters(t *testing.T) {
	c := client{
		clusters: []cluster.Client{},
	}

	clusters := c.GetClusters()
	require.Empty(t, clusters)
}

func TestGetCluster(t *testing.T) {
	mockClusterClient := &cluster.MockClient{}
	mockClusterClient.On("GetName").Return("testname")

	c := client{clusters: []cluster.Client{mockClusterClient}}

	t.Run("name found", func(t *testing.T) {
		clusters := c.GetCluster("testname")
		require.NotEmpty(t, clusters)
	})

	t.Run("name not found", func(t *testing.T) {
		clusters := c.GetCluster("testname1")
		require.Empty(t, clusters)
	})
}

func TestNewClient(t *testing.T) {
	t.Run("invalid config", func(t *testing.T) {
		c, err := NewClient(Config{
			Providers: []provider.Config{
				{
					Provider: provider.INCLUSTER,
				},
			},
		})
		require.Error(t, err)
		require.Empty(t, c)
	})

	t.Run("valid config", func(t *testing.T) {
		c, err := NewClient(Config{
			Providers: []provider.Config{
				{
					Provider: provider.KUBECONFIG,
				},
			},
		})
		require.NoError(t, err)
		require.Empty(t, c)
	})
}
