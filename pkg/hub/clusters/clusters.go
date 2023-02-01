package clusters

//go:generate mockgen -source=clusters.go -destination=./clusters_mock.go -package=clusters Client

import (
	cluster "github.com/kobsio/kobs/pkg/hub/clusters/cluster"
)

type Config []cluster.Config

type Client interface {
	GetClusters() []cluster.Client
	GetCluster(name string) cluster.Client
}

type client struct {
	clusters []cluster.Client
}

func (c *client) GetClusters() []cluster.Client {
	return c.clusters
}

func (c *client) GetCluster(name string) cluster.Client {
	for _, cluster := range c.clusters {
		if cluster.GetName() == name {
			return cluster
		}
	}

	return nil
}

func NewClient(config Config) (Client, error) {
	var clusters []cluster.Client

	for _, satelliteConfig := range config {
		clusterClient, err := cluster.NewClient(satelliteConfig)
		if err != nil {
			return nil, err
		}

		clusters = append(clusters, clusterClient)
	}

	return &client{
		clusters: clusters,
	}, nil
}
