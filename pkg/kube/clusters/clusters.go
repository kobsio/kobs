package clusters

import (
	"context"

	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"
	"github.com/kobsio/kobs/pkg/kube/clusters/provider"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

// Config is the configuration required to load all clusters. It takes an array of providers, which are defined in the
// providers package.
type Config struct {
	Providers []provider.Config `json:"providers"`
}

// Client is the interface with all the methods to interact with all loaded Kubernetes clusters.
type Client interface {
	GetClusters(ctx context.Context) []cluster.Client
	GetCluster(ctx context.Context, name string) cluster.Client
}

// client implements the Client interface and is used to interact with multiple Kubernetes clusters. For that it
// contains a list of all cluster clients.
type client struct {
	clusters []cluster.Client
	tracer   trace.Tracer
}

// GetClusters returns all loaded Kubernetes clusters.
func (c *client) GetClusters(ctx context.Context) []cluster.Client {
	_, span := c.tracer.Start(ctx, "clusters.GetClusters")
	defer span.End()

	return c.clusters
}

// GetCluster returns a cluster by it's name.
func (c *client) GetCluster(ctx context.Context, name string) cluster.Client {
	_, span := c.tracer.Start(ctx, "clusters.GetCluster")
	span.SetAttributes(attribute.Key("name").String(name))
	defer span.End()

	for _, cl := range c.clusters {
		if cl.GetName() == name {
			return cl
		}
	}

	return nil
}

// NewClient returns a clusters client, which can then be used to interact with the Kubernetes API of all the configured
// clusters.
//
// The clusters can be retrieved from different providers. Currently we are supporting incluster configuration and
// kubeconfig files. In the future it is planned to directly support GKE, EKS, AKS, etc.
func NewClient(config Config) (Client, error) {
	var tmpClusters []cluster.Client

	for _, p := range config.Providers {
		providerClusters, err := provider.New(&p).GetClusters()
		if err != nil {
			return nil, err
		}

		if providerClusters != nil {
			tmpClusters = append(tmpClusters, providerClusters...)
		}
	}

	client := &client{
		clusters: tmpClusters,
		tracer:   otel.Tracer("clusters"),
	}

	return client, nil
}
