package client

import (
	"context"
	"fmt"
	"testing"

	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestList(t *testing.T) {
	mockClusterClient := &cluster.MockClient{}
	mockClusterClient.AssertExpectations(t)
	mockClusterClient.On("GetResources", mock.Anything, "namespace1", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get secrets"))
	mockClusterClient.On("GetResources", mock.Anything, "namespace2", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return([]byte(`foobar`), nil)
	mockClusterClient.On("GetResources", mock.Anything, "namespace3", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return([]byte(`{"items":[{"data":{"release":"H4sIACQY1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsDGsBlraqGy4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}},{"data":{"release":"H4sIAC0Y1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsjGoBVeWHMC4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"2"},"name":"sh.helm.release.v1.kobs.v125","namespace":"kobs"}}]}`), nil)
	mockClusterClient.On("GetResources", mock.Anything, "namespace4", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return([]byte(`{"items":[{"data":{"release":"SDRzSUFLY2IxbUVBQTZ0V3lrdk1UVld5VXNyT1R5cFcwZ0h6aWdzU2s1R0V5bEtMaWpQejg1U3NER3NCbHJhcUd5NEFBQUE9Cg=="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}},{"data":{"release":"SDRzSUFKRWIxbUVBQTZ0V3lrdk1UVld5VXNyT1R5cFcwZ0h6aWdzU2s1R0V5bEtMaWpQejg1U3NqR29CVmVXSE1DNEFBQUE9Cg=="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"2"},"name":"sh.helm.release.v1.kobs.v125","namespace":"kobs"}}]}`), nil)

	helmClient := client{
		client: mockClusterClient,
		name:   "cluster1",
	}

	t.Run("get secrets fails", func(t *testing.T) {
		releases, err := helmClient.List(context.Background(), "namespace1")
		require.Error(t, err)
		require.Empty(t, releases)
	})

	t.Run("unmarshal secrets fails", func(t *testing.T) {
		releases, err := helmClient.List(context.Background(), "namespace2")
		require.Error(t, err)
		require.Empty(t, releases)
	})

	t.Run("secret data to release fails", func(t *testing.T) {
		releases, err := helmClient.List(context.Background(), "namespace3")
		require.Error(t, err)
		require.Empty(t, releases)
	})

	t.Run("return releases", func(t *testing.T) {
		releases, err := helmClient.List(context.Background(), "namespace4")
		require.NoError(t, err)
		require.Equal(t, []*Release{{Name: "kobs", Namespace: "kobs", Version: 2, Cluster: "cluster1"}}, releases)
	})
}

func TestGet(t *testing.T) {
	mockClusterClient := &cluster.MockClient{}
	mockClusterClient.AssertExpectations(t)
	mockClusterClient.On("GetResources", mock.Anything, "namespace1", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get secrets"))
	mockClusterClient.On("GetResources", mock.Anything, "namespace2", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return([]byte(`foobar`), nil)
	mockClusterClient.On("GetResources", mock.Anything, "namespace3", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return([]byte(`{"items":[{"data":{"release":"H4sIACQY1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsDGsBlraqGy4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}},{"data":{"release":"H4sIAC0Y1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsjGoBVeWHMC4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"2"},"name":"sh.helm.release.v1.kobs.v125","namespace":"kobs"}}]}`), nil)
	mockClusterClient.On("GetResources", mock.Anything, "namespace4", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return([]byte(`{"items":[{"data":{"release":"H4sIACQY1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsDGsBlraqGy4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}}]}`), nil)
	mockClusterClient.On("GetResources", mock.Anything, "namespace5", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return([]byte(`{"items":[{"data":{"release":"SDRzSUFLY2IxbUVBQTZ0V3lrdk1UVld5VXNyT1R5cFcwZ0h6aWdzU2s1R0V5bEtMaWpQejg1U3NER3NCbHJhcUd5NEFBQUE9Cg=="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}}]}`), nil)

	helmClient := client{
		client: mockClusterClient,
		name:   "cluster1",
	}

	t.Run("get secrets fails", func(t *testing.T) {
		releases, err := helmClient.Get(context.Background(), "namespace1", "kobs", 1)
		require.Error(t, err)
		require.Empty(t, releases)
	})

	t.Run("unmarshal secrets fails", func(t *testing.T) {
		releases, err := helmClient.Get(context.Background(), "namespace2", "kobs", 1)
		require.Error(t, err)
		require.Empty(t, releases)
	})

	t.Run("wrong number of secrets", func(t *testing.T) {
		releases, err := helmClient.Get(context.Background(), "namespace3", "kobs", 1)
		require.Error(t, err)
		require.Empty(t, releases)
	})

	t.Run("secrets to release fails", func(t *testing.T) {
		releases, err := helmClient.Get(context.Background(), "namespace4", "kobs", 1)
		require.Error(t, err)
		require.Empty(t, releases)
	})

	t.Run("return releases", func(t *testing.T) {
		releases, err := helmClient.Get(context.Background(), "namespace5", "kobs", 1)
		require.NoError(t, err)
		require.Equal(t, Release{Name: "kobs", Namespace: "kobs", Version: 1, Cluster: "cluster1"}, *releases)
	})
}

func TestHistory(t *testing.T) {
	mockClusterClient := &cluster.MockClient{}
	mockClusterClient.AssertExpectations(t)
	mockClusterClient.On("GetResources", mock.Anything, "namespace1", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get secrets"))
	mockClusterClient.On("GetResources", mock.Anything, "namespace2", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return([]byte(`foobar`), nil)
	mockClusterClient.On("GetResources", mock.Anything, "namespace3", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return([]byte(`{"items":[{"data":{"release":"H4sIACQY1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsDGsBlraqGy4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}},{"data":{"release":"H4sIAC0Y1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsjGoBVeWHMC4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"2"},"name":"sh.helm.release.v1.kobs.v125","namespace":"kobs"}}]}`), nil)
	mockClusterClient.On("GetResources", mock.Anything, "namespace4", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return([]byte(`{"items":[{"data":{"release":"SDRzSUFLY2IxbUVBQTZ0V3lrdk1UVld5VXNyT1R5cFcwZ0h6aWdzU2s1R0V5bEtMaWpQejg1U3NER3NCbHJhcUd5NEFBQUE9Cg=="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}},{"data":{"release":"SDRzSUFKRWIxbUVBQTZ0V3lrdk1UVld5VXNyT1R5cFcwZ0h6aWdzU2s1R0V5bEtMaWpQejg1U3NqR29CVmVXSE1DNEFBQUE9Cg=="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"2"},"name":"sh.helm.release.v1.kobs.v125","namespace":"kobs"}}]}`), nil)

	helmClient := client{
		client: mockClusterClient,
		name:   "cluster1",
	}

	t.Run("get secrets fails", func(t *testing.T) {
		releases, err := helmClient.History(context.Background(), "namespace1", "kobs")
		require.Error(t, err)
		require.Empty(t, releases)
	})

	t.Run("unmarshal secrets fails", func(t *testing.T) {
		releases, err := helmClient.History(context.Background(), "namespace2", "kobs")
		require.Error(t, err)
		require.Empty(t, releases)
	})

	t.Run("secret data to release fails", func(t *testing.T) {
		releases, err := helmClient.History(context.Background(), "namespace3", "kobs")
		require.Error(t, err)
		require.Empty(t, releases)
	})

	t.Run("return releases", func(t *testing.T) {
		releases, err := helmClient.History(context.Background(), "namespace4", "kobs")
		require.NoError(t, err)
		require.Equal(t, []*Release{{Name: "kobs", Namespace: "kobs", Version: 1, Cluster: "cluster1"}, {Name: "kobs", Namespace: "kobs", Version: 2, Cluster: "cluster1"}}, releases)
	})
}

func TestNew(t *testing.T) {
	mockClusterClient := &cluster.MockClient{}
	mockClusterClient.AssertExpectations(t)
	mockClusterClient.On("GetName").Return("cluster1")

	client := New(mockClusterClient)
	require.NotEmpty(t, client)
}
