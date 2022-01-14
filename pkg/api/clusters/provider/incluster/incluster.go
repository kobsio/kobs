package incluster

import (
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/log"

	"go.uber.org/zap"
	"k8s.io/client-go/rest"
)

// Define the getInClusterConfig and getNewCluster, so that we can overwrite this in our tests.
var getInClusterConfig = rest.InClusterConfig
var getNewCluster = cluster.NewClient

// Config is the configuration for the InCluster provider.
type Config struct {
	Name string `json:"name"`
}

// Client is the interface, which must be implemented by the incluster client.
type Client interface {
	GetCluster() ([]cluster.Client, error)
}

type client struct {
	config *Config
}

// GetCluster returns the cluster, where kobs is running in via the incluster configuration. For the selection of the
// cluster via a name, the user has to provide this name.
func (c *client) GetCluster() ([]cluster.Client, error) {
	log.Debug(nil, "Load incluster config", zap.String("name", c.config.Name))

	restConfig, err := getInClusterConfig()
	if err != nil {
		log.Error(nil, "Could not create rest config", zap.Error(err))
		return nil, err
	}

	cl, err := getNewCluster(c.config.Name, restConfig)
	if err != nil {
		return nil, err
	}

	return []cluster.Client{cl}, nil
}

// New returns a new incluster client, with the given configuration.
func New(config *Config) Client {
	return &client{
		config: config,
	}
}
