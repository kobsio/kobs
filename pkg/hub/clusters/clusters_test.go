package clusters

import (
	"testing"

	"github.com/stretchr/testify/require"
)

var testConfig = Config{{
	Name:    "foobar",
	Address: "http://localhost:15221",
	Token:   "unsecure",
}}

func TestGetClusters(t *testing.T) {
	client, _ := NewClient(testConfig)
	clusters := client.GetClusters()

	require.NotEmpty(t, clusters)
	require.Equal(t, testConfig[0].Name, clusters[0].GetName())
}

func TestGetAddress(t *testing.T) {
	client, _ := NewClient(testConfig)

	t.Run("cluster found", func(t *testing.T) {
		cluster := client.GetCluster("foobar")
		require.NotEmpty(t, cluster)
	})

	t.Run("cluster not found", func(t *testing.T) {
		cluster := client.GetCluster("helloworld")
		require.Empty(t, cluster)
	})
}

func TestNewClient(t *testing.T) {
	t.Run("create new client fails", func(t *testing.T) {
		_, err := NewClient(Config{{Address: " http://localhost:15221"}})
		require.Error(t, err)
	})

	t.Run("create new client succeeds", func(t *testing.T) {
		client, err := NewClient(Config{{Address: "http://localhost:15221"}})
		require.NoError(t, err)
		require.NotEmpty(t, client)
	})
}
