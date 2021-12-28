package clusters

import (
	"os"
	"time"

	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/api/clusters/provider"

	flag "github.com/spf13/pflag"
)

var (
	cacheDurationNamespaces time.Duration
	forbiddenResources      []string
)

// init is used to define all command-line flags for the clusters package.
func init() {
	defaultCacheDurationNamespaces := time.Duration(5 * time.Minute)
	if os.Getenv("KOBS_CLUSTERS_CACHE_DURATION_NAMESPACES") != "" {
		parsedCacheDurationNamespaces, err := time.ParseDuration(os.Getenv("KOBS_CLUSTERS_CACHE_DURATION_NAMESPACES"))
		if err == nil {
			defaultCacheDurationNamespaces = parsedCacheDurationNamespaces
		}
	}

	flag.DurationVar(&cacheDurationNamespaces, "clusters.cache-duration.namespaces", defaultCacheDurationNamespaces, "The duration, for how long requests to get the list of namespaces should be cached.")
}

// Config is the configuration required to load all clusters. It takes an array of providers, which are defined in the
// providers package.
type Config struct {
	Providers []provider.Config `json:"providers"`
}

// Client is the interface with all the methods to interact with all loaded Kubernetes clusters.
type Client interface {
	GetClusters() []cluster.Client
	GetCluster(name string) cluster.Client
}

// client implements the Client interface and is used to interact with multiple Kubernetes clusters. For that it
// contains a list of all cluster clients.
type client struct {
	clusters []cluster.Client
}

// GetClusters returns all loaded Kubernetes clusters.
func (c *client) GetClusters() []cluster.Client {
	return c.clusters
}

// GetCluster returns a cluster by it's name.
func (c *client) GetCluster(name string) cluster.Client {
	for _, cl := range c.clusters {
		if cl.GetName() == name {
			return cl
		}
	}

	return nil
}

// NewClient loads all clusters for the given configuration.
// The clusters can be retrieved from different providers. Currently we are supporting incluster configuration and
// kubeconfig files. In the future it is planning to directly support GKE, EKS, AKS, etc.
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
	}

	return client, nil
}
