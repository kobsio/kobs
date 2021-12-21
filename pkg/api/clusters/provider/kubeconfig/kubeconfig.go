package kubeconfig

import (
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/log"

	"go.uber.org/zap"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
)

// Config is the configuration for the Kubeconfig provider.
type Config struct {
	Path string `json:"path"`
}

// GetClusters returns all clusters from a given Kubeconfig file. For that the user have to provide the path to the
// Kubeconfig file.
func GetClusters(config *Config) ([]*cluster.Cluster, error) {
	log.Debug(nil, "Load Kubeconfig file.", zap.String("path", config.Path))

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
				log.Debug(nil, "Context was found.", zap.String("name", name), zap.String("cluster", context.Cluster), zap.String("authInfo", context.AuthInfo))

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
					log.Error(nil, "Could not create rest config.", zap.Error(err))
					return nil, err
				}

				c, err := cluster.NewCluster(name, restConfig)
				if err != nil {
					return nil, err
				}

				clusters = append(clusters, c)
			} else {
				log.Warn(nil, "Could not find auth info.", zap.String("name", name))
			}
		} else {
			log.Warn(nil, "Could not find cluster.", zap.String("name", name))
		}
	}

	return clusters, nil
}
