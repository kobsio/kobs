package provider

import (
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/api/clusters/provider/incluster"
	"github.com/kobsio/kobs/pkg/api/clusters/provider/kubeconfig"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "provider"})
)

// Type is the type of the cluster provider. At the moment it is only possible to load clusters via the
// incluster configuration or a Kubeconfig file. It is planed to implement support GKE, EKS and AKS later, so that all
// clusters can be automatically added from a cloud provider.
type Type string

const (
	// INCLUSTER is the type of the cluster provider, when kobs should be used for the cluster where it is running in.
	INCLUSTER Type = "incluster"
	// KUBECONFIG is the type of the cluster provider, when kobs should be used for all clusters in a given Kubeconfig
	// file.
	KUBECONFIG Type = "kubeconfig"
)

// Config is the provider configuration to get Kubernetes clusters from. The provider configuration only contains the
// provider type and a provider specific configuration.
type Config struct {
	Provider   Type              `yaml:"provider"`
	InCluster  incluster.Config  `yaml:"incluster"`
	Kubeconfig kubeconfig.Config `yaml:"kubeconfig"`
}

// GetClusters returns all clusters for the given provider. When the provider field doesn't match our custom Type, we
// only log a warning instead of throwing an error. This allows kobs to start also, when one provided provider is
// invalid.
func GetClusters(config *Config) ([]*cluster.Cluster, error) {
	switch config.Provider {
	case INCLUSTER:
		return incluster.GetCluster(&config.InCluster)
	case KUBECONFIG:
		return kubeconfig.GetClusters(&config.Kubeconfig)
	default:
		log.WithFields(logrus.Fields{"provider": config.Provider}).Warnf("Invalid provider.")
		return nil, nil
	}
}
