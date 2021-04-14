package plugins

import (
	"context"

	"github.com/kobsio/kobs/pkg/api/plugins/clusters"
	clustersProto "github.com/kobsio/kobs/pkg/api/plugins/clusters/proto"
	"github.com/kobsio/kobs/pkg/api/plugins/elasticsearch"
	"github.com/kobsio/kobs/pkg/api/plugins/jaeger"
	"github.com/kobsio/kobs/pkg/api/plugins/kiali"
	pluginsProto "github.com/kobsio/kobs/pkg/api/plugins/plugins/proto"
	"github.com/kobsio/kobs/pkg/api/plugins/prometheus"
	"github.com/kobsio/kobs/pkg/config"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "plugins"})
)

// Plugins contains all fields and methods to interact with the configured Kubernetes Plugins. It must implement the
// Plugins service from the protocol buffers definition.
type Plugins struct {
	pluginsProto.UnimplementedPluginsServer
	plugins []*pluginsProto.PluginShort
}

// GetPlugins returns all loaded plugins with their name and type.
func (p *Plugins) GetPlugins(ctx context.Context, getPluginsRequest *pluginsProto.GetPluginsRequest) (*pluginsProto.GetPluginsResponse, error) {
	log.WithFields(logrus.Fields{"count": len(p.plugins)}).Tracef("GetPlugins")

	return &pluginsProto.GetPluginsResponse{
		Plugins: p.plugins,
	}, nil
}

// Register is used to register all our plugin services at the gRPC server. We can use the same handling for each
// plugin, except the clusters plugin. The clusters plugin uses a special handling because it is the only core plugin
// for kobs. The clusters plugin can also be used from other plugins to receive the Kubernetes resources of a cluster.
func Register(cfg *config.Config, grpcServer *grpc.Server) error {
	log.Tracef("Register Plugins.")

	// Register the clusters plugin, which is used to retrieve the Kubernetes resources of all configured clusters.
	c, err := clusters.Load(cfg.Clusters)
	if err != nil {
		log.WithError(err).WithFields(logrus.Fields{"plugin": "clusters"}).Errorf("Failed to register Clusters plugin.")
		return err
	}

	clustersProto.RegisterClustersServer(grpcServer, c)

	// Register all other plugins.
	prometheusInstances, err := prometheus.Register(cfg.Prometheus, grpcServer)
	if err != nil {
		log.WithError(err).WithFields(logrus.Fields{"plugin": "prometheus"}).Errorf("Failed to register Prometheus plugin.")
		return err
	}

	elasticsearchInstances, err := elasticsearch.Register(cfg.Elasticsearch, grpcServer)
	if err != nil {
		log.WithError(err).WithFields(logrus.Fields{"plugin": "elasticsearch"}).Errorf("Failed to register Elasticsearch plugin.")
		return err
	}

	jaegerInstances, err := jaeger.Register(cfg.Jaeger, grpcServer)
	if err != nil {
		log.WithError(err).WithFields(logrus.Fields{"plugin": "jaeger"}).Errorf("Failed to register Jaeger plugin.")
		return err
	}

	kialiInstances, err := kiali.Register(cfg.Kiali, grpcServer)
	if err != nil {
		log.WithError(err).WithFields(logrus.Fields{"plugin": "kiali"}).Errorf("Failed to register Kiali plugin.")
		return err
	}

	var plugins []*pluginsProto.PluginShort
	plugins = append(plugins, prometheusInstances...)
	plugins = append(plugins, elasticsearchInstances...)
	plugins = append(plugins, jaegerInstances...)
	plugins = append(plugins, kialiInstances...)

	pluginsProto.RegisterPluginsServer(grpcServer, &Plugins{
		plugins: plugins,
	})

	return nil
}
