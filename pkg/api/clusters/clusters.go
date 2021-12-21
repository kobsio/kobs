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

// TODO
// Clusters contains all fields and methods to interact with the configured Kubernetes clusters. It must implement the
// Clusters service from the protocol buffers definition.
type Clusters struct {
	Clusters []*cluster.Cluster
}

func (c *Clusters) GetCluster(name string) *cluster.Cluster {
	for _, cl := range c.Clusters {
		if cl.GetName() == name {
			return cl
		}
	}

	return nil
}

// Load loads all clusters for the given configuration.
// The clusters can be retrieved from different providers. Currently we are supporting incluster configuration and
// kubeconfig files. In the future it is planning to directly support GKE, EKS, AKS, etc.
func Load(config Config) (*Clusters, error) {
	var clusters []*cluster.Cluster

	for _, p := range config.Providers {
		providerClusters, err := provider.GetClusters(&p)
		if err != nil {
			return nil, err
		}

		if providerClusters != nil {
			clusters = append(clusters, providerClusters...)
		}
	}

	cs := &Clusters{
		Clusters: clusters,
	}

	return cs, nil
}
