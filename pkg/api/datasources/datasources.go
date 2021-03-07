package datasources

import (
	"context"
	"fmt"

	"github.com/kobsio/kobs/pkg/api/datasources/datasource"
	"github.com/kobsio/kobs/pkg/generated/proto"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "datasources"})
)

// Datasources contains all loaded datasources and implements the datasources service from the protocol buffers
// definition.
type Datasources struct {
	proto.UnimplementedDatasourcesServer
	datasources []datasource.Datasource
}

func (d *Datasources) getDatasource(name string) datasource.Datasource {
	for _, ds := range d.datasources {
		n, _ := ds.GetDatasource()
		if n == name {
			return ds
		}
	}

	return nil
}

// GetDatasources returns all configured datasources. For that we are looping through the datasources convert our
// internal datastructur to the protobuf message format.
func (d *Datasources) GetDatasources(ctx context.Context, getDatasourcesRequest *proto.GetDatasourcesRequest) (*proto.GetDatasourcesResponse, error) {
	var datasources []*proto.Datasource

	for _, ds := range d.datasources {
		n, t := ds.GetDatasource()
		datasources = append(datasources, &proto.Datasource{
			Name: n,
			Type: t,
		})
	}

	return &proto.GetDatasourcesResponse{
		Datasources: datasources,
	}, nil
}

// GetDatasource implements the GetDatasource from the Datasources service. It will return the name and type of a
// datasource by name. If no datasource for the given name could be found and error is returned.
func (d *Datasources) GetDatasource(ctx context.Context, getDatasourceRequest *proto.GetDatasourceRequest) (*proto.GetDatasourceResponse, error) {
	log.WithFields(logrus.Fields{"name": getDatasourceRequest.Name}).Tracef("Get datasource.")

	ds := d.getDatasource(getDatasourceRequest.Name)
	if ds == nil {
		return nil, fmt.Errorf("invalid datasource name")
	}

	n, t := ds.GetDatasource()

	return &proto.GetDatasourceResponse{
		Datasource: &proto.Datasource{
			Name: n,
			Type: t,
		},
	}, nil
}

// GetVariables implements the GetVariables for the Datasources service. It returns the variables for a metrics view,
// including the values and value field.
func (d *Datasources) GetVariables(ctx context.Context, getVariablesRequest *proto.GetVariablesRequest) (*proto.GetVariablesResponse, error) {
	log.WithFields(logrus.Fields{"name": getVariablesRequest.Name}).Tracef("Get variables.")

	ds := d.getDatasource(getVariablesRequest.Name)
	if ds == nil {
		return nil, fmt.Errorf("invalid datasource name")
	}

	variables, err := ds.GetVariables(ctx, getVariablesRequest.Options, getVariablesRequest.Variables)
	if err != nil {
		return nil, err
	}

	return &proto.GetVariablesResponse{
		Variables: variables,
	}, nil
}

// GetMetrics implements the GetMetrics for the Datasources service. It returns the a series of metrics for a list of
// given queries.
func (d *Datasources) GetMetrics(ctx context.Context, getMetricsRequest *proto.GetMetricsRequest) (*proto.GetMetricsResponse, error) {
	log.WithFields(logrus.Fields{"name": getMetricsRequest.Name}).Tracef("Get metrics.")

	ds := d.getDatasource(getMetricsRequest.Name)
	if ds == nil {
		return nil, fmt.Errorf("invalid datasource name")
	}

	metrics, interpolatedQueries, err := ds.GetMetrics(ctx, getMetricsRequest.Options, getMetricsRequest.Variables, getMetricsRequest.Queries)
	if err != nil {
		return nil, err
	}

	return &proto.GetMetricsResponse{
		Metrics:             metrics,
		InterpolatedQueries: interpolatedQueries,
	}, nil
}

// Load loads all given datasources from the configuration, so that we can use them within the datasources gRPC service.
func Load(config []datasource.Config) (*Datasources, error) {
	var datasources []datasource.Datasource

	for _, dsConfig := range config {
		ds, err := datasource.New(dsConfig)
		if err != nil {
			return nil, err
		}

		if ds != nil {
			datasources = append(datasources, ds)
		}
	}

	log.WithFields(logrus.Fields{"datasources count": len(datasources)}).Debugf("Loaded datasources.")

	return &Datasources{
		datasources: datasources,
	}, nil
}
