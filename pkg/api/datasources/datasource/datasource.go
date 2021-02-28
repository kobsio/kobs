package datasource

import (
	"context"

	"github.com/kobsio/kobs/pkg/api/datasources/datasource/prometheus"
	"github.com/kobsio/kobs/pkg/generated/proto"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "datasource"})
)

// Config is the configuration for a datasource. Each datasource must contain a name and type. Each datasource also
// contains a type specific configuration.
type Config struct {
	Name       string            `yaml:"name"`
	Type       string            `yaml:"type"`
	Prometheus prometheus.Config `yaml:"prometheus"`
}

// Datasource is the interface, which must be implemented by each datasource. Also when a datasource doesn't support
// logs or traces like Prometheus, it must implement the corresponding method, but it should return an error when the
// method is called.
type Datasource interface {
	GetDatasource() (string, string)
	GetVariables(ctx context.Context, options *proto.DatasourceOptions, variables []*proto.ApplicationMetricsVariable) ([]*proto.ApplicationMetricsVariable, error)
	GetMetrics(ctx context.Context, options *proto.DatasourceOptions, variables []*proto.ApplicationMetricsVariable, queries []*proto.ApplicationMetricsQuery) ([]*proto.DatasourceMetrics, error)
	GetLogs(ctx context.Context, options *proto.DatasourceOptions) error
	GetTraces(ctx context.Context, options *proto.DatasourceOptions) error
}

// New returns a new datasource for the given configuration. It checks the provided type and returns the corresponding
// datasource config. If the user provided an invalid datasource we just log a warning, but we do not return an error.
func New(config Config) (Datasource, error) {
	switch config.Type {
	case "prometheus":
		log.WithFields(logrus.Fields{"name": config.Name, "type": config.Type}).Debugf("Load datasource.")
		return prometheus.New(config.Name, config.Prometheus)
	default:
		log.WithFields(logrus.Fields{"type": config.Type}).Warnf("Invalid datasource.")
		return nil, nil
	}
}
