package incluster

import (
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/log"

	"go.uber.org/zap"
	"k8s.io/client-go/rest"
)

// Config is the configuration for the InCluster provider.
type Config struct {
	Name string `json:"name"`
}

// GetCluster returns the cluster, where kobs is running in via the incluster configuration. For the selection of the
// cluster via a name, the user has to provide this name.
func GetCluster(config *Config) ([]*cluster.Cluster, error) {
	log.Debug(nil, "Load incluster config.", zap.String("name", config.Name))

	restConfig, err := rest.InClusterConfig()
	if err != nil {
		log.Error(nil, "Could not create rest config.", zap.Error(err))
		return nil, err
	}

	c, err := cluster.NewCluster(config.Name, restConfig)
	if err != nil {
		return nil, err
	}

	return []*cluster.Cluster{c}, nil
}
