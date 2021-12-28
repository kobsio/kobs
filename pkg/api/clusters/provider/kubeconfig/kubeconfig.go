package kubeconfig

import (
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/log"

	"go.uber.org/zap"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
)

// getRawConfigFunc is the function to get the raw cluster configuration from the kuebconfig under the given path. This
// function is then called via the "getRawConfig" variable, so that we can overwrite it in our tests.
func getRawConfigFunc(path string) (clientcmdapi.Config, error) {
	clientConfig := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		&clientcmd.ClientConfigLoadingRules{ExplicitPath: path},
		&clientcmd.ConfigOverrides{},
	)

	return clientConfig.RawConfig()
}

// Set the getRawConfig and getNewCluster functions, so that we can overwrite them in our tests.
var getRawConfig = getRawConfigFunc
var getNewCluster = cluster.NewClient

// Config is the configuration for the Kubeconfig provider.
type Config struct {
	Path string `json:"path"`
}

// Client is the interface, which must be implemented by the kubeconfig client.
type Client interface {
	GetClusters() ([]cluster.Client, error)
}

type client struct {
	config *Config
}

// GetClusters returns all clusters from a given Kubeconfig file. For that the user have to provide the path to the
// Kubeconfig file.
func (c *client) GetClusters() ([]cluster.Client, error) {
	log.Debug(nil, "Load Kubeconfig file.", zap.String("path", c.config.Path))

	raw, err := getRawConfig(c.config.Path)
	if err != nil {
		return nil, err
	}

	var clusters []cluster.Client

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

				c, err := getNewCluster(name, restConfig)
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

// New returns a new kubeconfig client, with the given configuration.
func New(config *Config) Client {
	return &client{
		config: config,
	}
}
