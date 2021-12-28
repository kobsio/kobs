package kubeconfig

import (
	"fmt"
	"testing"

	"github.com/kobsio/kobs/pkg/api/clusters/cluster"

	"github.com/stretchr/testify/require"
	"k8s.io/client-go/rest"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
)

func getRawConfigTest(path string) (clientcmdapi.Config, error) {
	if path == "" {
		return clientcmdapi.Config{}, fmt.Errorf("empty path")
	}

	if path == "kubeconfig_missing_cluster.yaml" {
		return clientcmdapi.Config{
			AuthInfos: map[string]*clientcmdapi.AuthInfo{"admin": {Token: "token"}},
			Contexts:  map[string]*clientcmdapi.Context{"kobs": {Cluster: "kobs", AuthInfo: "admin"}},
		}, nil
	}

	if path == "kubeconfig_missing_authinfo.yaml" {
		return clientcmdapi.Config{
			Clusters: map[string]*clientcmdapi.Cluster{"kobs": {Server: "https://kubernetes.kobs.io", CertificateAuthorityData: []byte(`certificate-authority-data`)}},
			Contexts: map[string]*clientcmdapi.Context{"kobs": {Cluster: "kobs", AuthInfo: "admin"}},
		}, nil
	}

	return clientcmdapi.Config{
		Clusters:  map[string]*clientcmdapi.Cluster{"kobs": {Server: "https://kubernetes.kobs.io", CertificateAuthorityData: []byte(`certificate-authority-data`)}},
		AuthInfos: map[string]*clientcmdapi.AuthInfo{"admin": {Token: "token"}},
		Contexts:  map[string]*clientcmdapi.Context{"kobs": {Cluster: "kobs", AuthInfo: "admin"}},
	}, nil
}

func getNewClusterTestError(name string, restConfig *rest.Config) (cluster.Client, error) {
	return nil, fmt.Errorf("could not create cluster")
}

func getNewClusterTestSuccess(name string, restConfig *rest.Config) (cluster.Client, error) {
	return &cluster.MockClient{}, nil
}

func TestGetRawConfigFunc(t *testing.T) {
	raw, err := getRawConfig("")
	require.NoError(t, err)
	require.NotEmpty(t, raw)
}

func TestGetClusters(t *testing.T) {
	getRawConfig = getRawConfigTest

	t.Run("get raw config fails", func(t *testing.T) {
		client := New(&Config{Path: ""})
		clusters, err := client.GetClusters()
		require.Error(t, err)
		require.Empty(t, clusters)
	})

	t.Run("kubeconfig missing cluster", func(t *testing.T) {
		client := New(&Config{Path: "kubeconfig_missing_cluster.yaml"})
		clusters, err := client.GetClusters()
		require.NoError(t, err)
		require.Empty(t, clusters)
	})

	t.Run("kubeconfig missing authinfo", func(t *testing.T) {
		client := New(&Config{Path: "kubeconfig_missing_authinfo.yaml"})
		clusters, err := client.GetClusters()
		require.NoError(t, err)
		require.Empty(t, clusters)
	})

	t.Run("new cluster fails", func(t *testing.T) {
		getNewCluster = getNewClusterTestError

		client := New(&Config{Path: "kubeconfig.yaml"})
		clusters, err := client.GetClusters()
		require.Error(t, err)
		require.Empty(t, clusters)
	})

	t.Run("new cluster", func(t *testing.T) {
		getNewCluster = getNewClusterTestSuccess

		client := New(&Config{Path: "kubeconfig.yaml"})
		clusters, err := client.GetClusters()
		require.NoError(t, err)
		require.NotEmpty(t, clusters)
	})
}

func TestNew(t *testing.T) {
	client := New(&Config{})
	require.NotEmpty(t, client)
}
