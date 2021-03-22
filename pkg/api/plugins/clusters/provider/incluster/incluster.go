package incluster

import (
	"github.com/kobsio/kobs/pkg/api/plugins/clusters/cluster"

	"github.com/sirupsen/logrus"
	"k8s.io/client-go/rest"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "clusters"})
)

// Config is the configuration for the InCluster provider.
type Config struct {
	Name string `yaml:"name"`
}

// GetCluster returns the cluster, where kobs is running in via the incluster configuration. For the selection of the
// cluster via a name, the user has to provide this name.
func GetCluster(config *Config) ([]*cluster.Cluster, error) {
	log.WithFields(logrus.Fields{"name": config.Name}).Tracef("Load incluster config.")

	restConfig, err := rest.InClusterConfig()
	if err != nil {
		log.WithError(err).Debugf("Could not create rest config.")
		return nil, err
	}

	c, err := cluster.NewCluster(config.Name, restConfig)
	if err != nil {
		return nil, err
	}

	return []*cluster.Cluster{c}, nil
}
