package kubeconfig

import (
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"

	"github.com/sirupsen/logrus"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "clusters"})
)

// Config is the configuration for the Kubeconfig provider.
type Config struct {
	Path string `yaml:"path"`
}

// GetClusters returns all clusters from a given Kubeconfig file. For that the user have to provide the path to the
// Kubeconfig file.
func GetClusters(config *Config) ([]*cluster.Cluster, error) {
	log.WithFields(logrus.Fields{"path": config.Path}).Tracef("Load Kubeconfig file.")

	clientConfig := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		&clientcmd.ClientConfigLoadingRules{ExplicitPath: config.Path},
		&clientcmd.ConfigOverrides{},
	)

	raw, err := clientConfig.RawConfig()
	if err != nil {
		return nil, err
	}

	var clusters []*cluster.Cluster

	for name, context := range raw.Contexts {
		if _, ok := raw.Clusters[context.Cluster]; ok {
			if _, ok := raw.AuthInfos[context.AuthInfo]; ok {
				log.WithFields(logrus.Fields{
					"name":     name,
					"context":  context,
					"cluster":  context.Cluster,
					"authinfo": context.AuthInfo,
				}).Tracef("Context was found.")

				clientConfig := clientcmd.NewDefaultClientConfig(clientcmdapi.Config{
					APIVersion:     "v1",
					Kind:           "Config",
					CurrentContext: name,
					Contexts:       map[string]*clientcmdapi.Context{name: context},
					Clusters:       map[string]*clientcmdapi.Cluster{context.Cluster: raw.Clusters[context.Cluster]},
					AuthInfos:      map[string]*clientcmdapi.AuthInfo{context.AuthInfo: raw.AuthInfos[context.AuthInfo]},
				}, &clientcmd.ConfigOverrides{})

				restConfig, err := clientConfig.ClientConfig()
				if err != nil {
					log.WithError(err).Debugf("Could not create rest config.")
					return nil, err
				}

				c, err := cluster.NewCluster(name, restConfig)
				if err != nil {
					return nil, err
				}

				clusters = append(clusters, c)
			} else {
				log.WithFields(logrus.Fields{"name": name}).Warnf("Could not find auth info.")
			}
		} else {
			log.WithFields(logrus.Fields{"name": name}).Warnf("Could not find cluster.")
		}
	}

	return clusters, nil
}
