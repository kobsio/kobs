package clusters

import (
	"context"
	"fmt"
	"os"
	"sort"
	"time"

	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/api/clusters/provider"
	"github.com/kobsio/kobs/pkg/generated/proto"

	"github.com/sirupsen/logrus"
	flag "github.com/spf13/pflag"
)

var (
	log           = logrus.WithFields(logrus.Fields{"package": "clusters"})
	cacheDuration string
)

func init() {
	defaultCacheDuration := "5m"
	if os.Getenv("KOBS_CLUSTERS_CACHE_DURATION") != "" {
		defaultCacheDuration = os.Getenv("KOBS_CLUSTERS_CACHE_DURATION")
	}

	flag.StringVar(&cacheDuration, "clusters.cache-duration", defaultCacheDuration, "The duration, for how long requests should be cached.")
}

// Config is the configuration required to load all clusters.
type Config struct {
	Providers            []provider.Config              `yaml:"providers"`
	DefaultDatasources   cluster.Datasources            `yaml:"defaultDatasources"`
	OverwriteDatasources map[string]cluster.Datasources `yaml:"overwriteDatasources"`
}

// Clusters contains all fields and methods to interact with the configured Kubernetes clusters. It must implement the
// Clusters service from the protocol buffers definition.
type Clusters struct {
	proto.UnimplementedClustersServer
	clusters []*cluster.Cluster
}

func (c *Clusters) getCluster(name string) *cluster.Cluster {
	for _, cl := range c.clusters {
		if cl.GetName() == name {
			return cl
		}
	}

	return nil
}

// GetClusters returns all loaded Kubernetes clusters.
// We are not returning the complete cluster structure. Instead we are returning just the names of the clusters. We are
// also sorting the clusters alphabetically, to improve the user experience in the frontend.
// NOTE: Maybe we can also save the cluster names slice, since the name of a cluster couldn't change during runtime.
func (c *Clusters) GetClusters(ctx context.Context, getClustersRequest *proto.GetClustersRequest) (*proto.GetClustersResponse, error) {
	var clusters []string

	for _, cluster := range c.clusters {
		clusters = append(clusters, cluster.GetName())
	}

	sort.Slice(clusters, func(i, j int) bool {
		return clusters[i] < clusters[j]
	})

	return &proto.GetClustersResponse{
		Clusters: clusters,
	}, nil
}

// GetNamespaces returns all namespaces for the given clusters.
// As we did it for the clusters, we are also just returning the names of all namespaces. After we retrieved all
// namespaces we have to depulicate them, so that our frontend logic can handle them properly. We are also sorting the
// namespaces alphabetically.
func (c *Clusters) GetNamespaces(ctx context.Context, getNamespacesRequest *proto.GetNamespacesRequest) (*proto.GetNamespacesResponse, error) {
	var namespaces []string

	for _, clusterName := range getNamespacesRequest.Clusters {
		cluster := c.getCluster(clusterName)
		if cluster == nil {
			return nil, fmt.Errorf("invalid cluster name")
		}

		clusterNamespaces, err := cluster.GetNamespaces(ctx)
		if err != nil {
			return nil, err
		}

		if clusterNamespaces != nil {
			namespaces = append(namespaces, clusterNamespaces...)
		}

	}

	keys := make(map[string]bool)
	uniqueNamespaces := []string{}
	for _, namespace := range namespaces {
		if _, value := keys[namespace]; !value {
			keys[namespace] = true
			uniqueNamespaces = append(uniqueNamespaces, namespace)
		}
	}

	sort.Slice(uniqueNamespaces, func(i, j int) bool {
		return uniqueNamespaces[i] < uniqueNamespaces[j]
	})

	return &proto.GetNamespacesResponse{
		Namespaces: uniqueNamespaces,
	}, nil
}

// GetResources returns a list of resources for the given clusters and namespaces.
// To generate this list, we loop over every cluster and namespace and try to get the resources for this. A resource is
// identified by it's Kubernetes API path and name.
func (c *Clusters) GetResources(ctx context.Context, getResourcesRequest *proto.GetResourcesRequest) (*proto.GetResourcesResponse, error) {
	var resources []*proto.Resources

	for _, clusterName := range getResourcesRequest.Clusters {
		cluster := c.getCluster(clusterName)
		if cluster == nil {
			return nil, fmt.Errorf("invalid cluster name")
		}

		for _, namespace := range getResourcesRequest.Namespaces {
			list, err := cluster.GetResources(ctx, namespace, getResourcesRequest.Path, getResourcesRequest.Resource, getResourcesRequest.ParamName, getResourcesRequest.Param)
			if err != nil {
				return nil, err
			}

			resources = append(resources, &proto.Resources{
				Cluster:      clusterName,
				Namespace:    namespace,
				ResourceList: list,
			})
		}
	}

	return &proto.GetResourcesResponse{
		Resources: resources,
	}, nil
}

// GetApplications returns a list of applications for the given clusters and namespaces.
// To generate this list, we loop over every cluster and namespace and try to get the applications for this.
func (c *Clusters) GetApplications(ctx context.Context, getApplicationsRequest *proto.GetApplicationsRequest) (*proto.GetApplicationsResponse, error) {
	var applications []*proto.Application

	log.WithFields(logrus.Fields{"clusters": getApplicationsRequest.Clusters, "namespaces": getApplicationsRequest.Namespaces}).Tracef("Get applications.")

	for _, clusterName := range getApplicationsRequest.Clusters {
		cluster := c.getCluster(clusterName)
		if cluster == nil {
			return nil, fmt.Errorf("invalid cluster name")
		}

		for _, namespace := range getApplicationsRequest.Namespaces {
			list, err := cluster.GetApplications(ctx, namespace)
			if err != nil {
				return nil, err
			}

			applications = append(applications, list...)
		}
	}

	return &proto.GetApplicationsResponse{
		Applications: applications,
	}, nil
}

// GetApplication returns a single application with the given name in the given cluster and namespace. If there isn't,
// such an application an error is returned.
func (c *Clusters) GetApplication(ctx context.Context, getApplicationRequest *proto.GetApplicationRequest) (*proto.GetApplicationResponse, error) {
	log.WithFields(logrus.Fields{"cluster": getApplicationRequest.Cluster, "namespace": getApplicationRequest.Namespace, "name": getApplicationRequest.Name}).Tracef("Get application.")

	cluster := c.getCluster(getApplicationRequest.Cluster)
	if cluster == nil {
		return nil, fmt.Errorf("invalid cluster name")
	}

	application, err := cluster.GetApplication(ctx, getApplicationRequest.Namespace, getApplicationRequest.Name)
	if err != nil {
		return nil, err
	}

	return &proto.GetApplicationResponse{
		Application: application,
	}, nil
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

	d, err := time.ParseDuration(cacheDuration)
	if err != nil {
		return nil, err
	}

	for _, c := range clusters {
		if datasources, ok := config.OverwriteDatasources[c.GetName()]; ok {
			c.SetOptions(d, datasources)
		} else {
			c.SetOptions(d, config.DefaultDatasources)
		}
	}

	return &Clusters{
		clusters: clusters,
	}, nil
}
