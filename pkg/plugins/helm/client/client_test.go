package client

import (
	"context"
	"fmt"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/kobsio/kobs/pkg/cluster/kubernetes"

	"github.com/stretchr/testify/require"
)

func TestList(t *testing.T) {
	ctrl := gomock.NewController(t)
	kubernetesClient := kubernetes.NewMockClient(ctrl)

	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace1", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("could not get secrets"))
	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace2", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]byte(`foobar`), nil)
	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace3", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]byte(`{"items":[{"data":{"release":"H4sIACQY1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsDGsBlraqGy4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}},{"data":{"release":"H4sIAC0Y1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsjGoBVeWHMC4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"2"},"name":"sh.helm.release.v1.kobs.v125","namespace":"kobs"}}]}`), nil)
	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace4", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]byte(`{"items":[{"data":{"release":"SDRzSUFLY2IxbUVBQTZ0V3lrdk1UVld5VXNyT1R5cFcwZ0h6aWdzU2s1R0V5bEtMaWpQejg1U3NER3NCbHJhcUd5NEFBQUE9Cg=="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}},{"data":{"release":"SDRzSUFKRWIxbUVBQTZ0V3lrdk1UVld5VXNyT1R5cFcwZ0h6aWdzU2s1R0V5bEtMaWpQejg1U3NqR29CVmVXSE1DNEFBQUE9Cg=="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"2"},"name":"sh.helm.release.v1.kobs.v125","namespace":"kobs"}}]}`), nil)

	helmClient := client{
		kubernetesClient: kubernetesClient,
		name:             "cluster1",
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
	ctrl := gomock.NewController(t)
	kubernetesClient := kubernetes.NewMockClient(ctrl)

	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace1", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("could not get secrets"))
	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace2", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]byte(`foobar`), nil)
	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace3", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]byte(`{"items":[{"data":{"release":"H4sIACQY1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsDGsBlraqGy4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}},{"data":{"release":"H4sIAC0Y1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsjGoBVeWHMC4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"2"},"name":"sh.helm.release.v1.kobs.v125","namespace":"kobs"}}]}`), nil)
	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace4", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]byte(`{"items":[{"data":{"release":"H4sIACQY1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsDGsBlraqGy4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}}]}`), nil)
	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace5", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]byte(`{"items":[{"data":{"release":"SDRzSUFLY2IxbUVBQTZ0V3lrdk1UVld5VXNyT1R5cFcwZ0h6aWdzU2s1R0V5bEtMaWpQejg1U3NER3NCbHJhcUd5NEFBQUE9Cg=="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}}]}`), nil)

	helmClient := client{
		kubernetesClient: kubernetesClient,
		name:             "cluster1",
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
	ctrl := gomock.NewController(t)
	kubernetesClient := kubernetes.NewMockClient(ctrl)

	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace1", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("could not get secrets"))
	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace2", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]byte(`foobar`), nil)
	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace3", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]byte(`{"items":[{"data":{"release":"H4sIACQY1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsDGsBlraqGy4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}},{"data":{"release":"H4sIAC0Y1mEAA6tWykvMTVWyUsrOTypW0gHzigsSk5GEylKLijPz85SsjGoBVeWHMC4AAAA="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"2"},"name":"sh.helm.release.v1.kobs.v125","namespace":"kobs"}}]}`), nil)
	kubernetesClient.EXPECT().GetResources(gomock.Any(), "namespace4", gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]byte(`{"items":[{"data":{"release":"SDRzSUFLY2IxbUVBQTZ0V3lrdk1UVld5VXNyT1R5cFcwZ0h6aWdzU2s1R0V5bEtMaWpQejg1U3NER3NCbHJhcUd5NEFBQUE9Cg=="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"1"},"name":"sh.helm.release.v1.kobs.v124","namespace":"kobs"}},{"data":{"release":"SDRzSUFKRWIxbUVBQTZ0V3lrdk1UVld5VXNyT1R5cFcwZ0h6aWdzU2s1R0V5bEtMaWpQejg1U3NqR29CVmVXSE1DNEFBQUE9Cg=="},"metadata":{"labels":{"name":"kobs","owner":"helm","version":"2"},"name":"sh.helm.release.v1.kobs.v125","namespace":"kobs"}}]}`), nil)

	helmClient := client{
		kubernetesClient: kubernetesClient,
		name:             "cluster1",
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
	ctrl := gomock.NewController(t)
	kubernetesClient := kubernetes.NewMockClient(ctrl)

	client := New("cluster1", kubernetesClient)
	require.NotEmpty(t, client)
}
