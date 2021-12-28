package provider

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetClusters(t *testing.T) {
	t.Run("incluster", func(t *testing.T) {
		p := provider{config: &Config{Provider: INCLUSTER}}
		clusters, err := p.GetClusters()
		require.Error(t, err)
		require.Empty(t, clusters)
	})

	t.Run("kubeconfig", func(t *testing.T) {
		p := provider{config: &Config{Provider: KUBECONFIG}}
		clusters, err := p.GetClusters()
		require.NoError(t, err)
		require.Empty(t, clusters)
	})

	t.Run("", func(t *testing.T) {
		p := provider{config: &Config{Provider: ""}}
		clusters, err := p.GetClusters()
		require.NoError(t, err)
		require.Empty(t, clusters)
	})
}

func TestNew(t *testing.T) {
	client := New(&Config{})
	require.NotEmpty(t, client)
}
