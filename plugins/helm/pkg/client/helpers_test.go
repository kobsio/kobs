package client

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSecretDataToRelease(t *testing.T) {
	t.Run("base64 decode fails", func(t *testing.T) {
		release, err := secretDataToRelease("cluster1", []byte("foobar"))
		require.Error(t, err)
		require.Empty(t, release)
	})

	t.Run("decompress fails", func(t *testing.T) {
		release, err := secretDataToRelease("cluster1", []byte("Zm9vYmFy"))
		require.Error(t, err)
		require.Empty(t, release)
	})

	t.Run("unmarshal fails", func(t *testing.T) {
		release, err := secretDataToRelease("cluster1", []byte("H4sIAGkT1mEAA0vLz09KLAIAlR/2ngYAAAA="))
		require.Error(t, err)
		require.Empty(t, release)
	})

	// Test data was created using the following command:
	// echo -n '{"name":"kobs","namespace":"kobs","version":2}' | gzip | base64
	t.Run("secret to release succeeds", func(t *testing.T) {
		release, err := secretDataToRelease("cluster1", []byte("H4sIAC0Y1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsjGoBVeWHMC4AAAA="))
		require.NoError(t, err)
		require.Equal(t, Release{Name: "kobs", Namespace: "kobs", Version: 2, Cluster: "cluster1"}, *release)
	})
}
