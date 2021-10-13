package instance

import (
	"context"
	"fmt"
	"strings"

	prometheusInstance "github.com/kobsio/kobs/plugins/prometheus/pkg/instance"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "istio"})
)

// Config is the structure of the configuration for a single Opsgenie instance.
type Config struct {
	Name        string           `json:"name"`
	DisplayName string           `json:"displayName"`
	Description string           `json:"description"`
	Prometheus  ConfigPrometheus `json:"prometheus"`
}

// ConfigPrometheus is the structure of the configuration, which is required to enabled the Prometheus integration for
// the Istio plugin.
type ConfigPrometheus struct {
	Enabled bool   `json:"enabled"`
	Name    string `json:"name"`
}

// Instance represents a single Jaeger instance, which can be added via the configuration file.
type Instance struct {
	Name       string
	prometheus *prometheusInstance.Instance
}

// GetNamespaces returns a list of namespaces, which can be selected to get the applications from.
func (i *Instance) GetNamespaces(ctx context.Context, timeStart int64, timeEnd int64) ([]string, error) {
	return i.prometheus.GetVariable(ctx, "destination_workload_namespace", "istio_requests_total{reporter=\"destination\"}", "", timeStart, timeEnd)
}

// GetMetrics returns the success rate, requests per second, P50, P90 and P99 latency for the specified namespaces and
// labels.
func (i *Instance) GetMetrics(ctx context.Context, namespaces []string, application, label, groupBy, reporter string, timeStart int64, timeEnd int64) (map[string]map[string]string, error) {
	label = "{% ." + label + " %}"
	namespacesStr := strings.Join(namespaces, "|")

	if application == "" {
		application = ".*"
	}

	queries := []prometheusInstance.Query{
		{
			Label: label,
			Query: fmt.Sprintf(`sum(irate(istio_requests_total{reporter="%s",destination_workload_namespace=~"%s",destination_workload=~"%s",response_code!~"5.*"}[5m])) by (%s) / sum(irate(istio_requests_total{reporter="%s",destination_workload_namespace=~"%s",destination_workload=~"%s"}[5m])) by (%s) * 100`, reporter, namespacesStr, application, groupBy, reporter, namespacesStr, application, groupBy),
		},
		{
			Label: label,
			Query: fmt.Sprintf(`round(sum(irate(istio_requests_total{reporter="%s",destination_workload_namespace=~"%s",destination_workload=~"%s"}[5m])) by (%s), 0.001)`, reporter, namespacesStr, application, groupBy),
		},
		{
			Label: label,
			Query: fmt.Sprintf(`histogram_quantile(0.50, sum(irate(istio_request_duration_milliseconds_bucket{reporter="%s",destination_workload_namespace=~"%s",destination_workload=~"%s"}[1m])) by (le, %s))`, reporter, namespacesStr, application, groupBy),
		},
		{
			Label: label,
			Query: fmt.Sprintf(`histogram_quantile(0.90, sum(irate(istio_request_duration_milliseconds_bucket{reporter="%s",destination_workload_namespace=~"%s",destination_workload=~"%s"}[1m])) by (le, %s))`, reporter, namespacesStr, application, groupBy),
		},
		{
			Label: label,
			Query: fmt.Sprintf(`histogram_quantile(0.99, sum(irate(istio_request_duration_milliseconds_bucket{reporter="%s",destination_workload_namespace=~"%s",destination_workload=~"%s"}[1m])) by (le, %s))`, reporter, namespacesStr, application, groupBy),
		},
	}

	return i.prometheus.GetTableData(ctx, queries, timeEnd)
}

// GetTopology creates a simple topology graph for the given application, with all the incoming sources and outgoing
// destinations for the application.
func (i *Instance) GetTopology(ctx context.Context, namespace, application string, timeStart int64, timeEnd int64) ([]Edge, []Node, error) {
	currentLabel := "{% .destination_workload_namespace %}_{% .destination_workload %}"
	currentQueries := []prometheusInstance.Query{
		{
			Label: currentLabel,
			Query: fmt.Sprintf(`sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s",response_code!~"5.*"}[5m])) by (destination_workload, destination_workload_namespace) / sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s"}[5m])) by (destination_workload, destination_workload_namespace) * 100`, namespace, application, namespace, application),
		},
		{
			Label: currentLabel,
			Query: fmt.Sprintf(`round(sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s"}[5m])) by (destination_workload, destination_workload_namespace), 0.001)`, namespace, application),
		},
		{
			Label: currentLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.50, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s"}[1m])) by (le, destination_workload, destination_workload_namespace))`, namespace, application),
		},
		{
			Label: currentLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.90, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s"}[1m])) by (le, destination_workload, destination_workload_namespace))`, namespace, application),
		},
		{
			Label: currentLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.99, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s"}[1m])) by (le, destination_workload, destination_workload_namespace))`, namespace, application),
		},
	}

	current, err := i.prometheus.GetTableData(ctx, currentQueries, timeEnd)
	if err != nil {
		return nil, nil, err
	}

	incomingLabel := "{% .source_workload_namespace %}_{% .source_workload %}"
	incomingQueries := []prometheusInstance.Query{
		{
			Label: incomingLabel,
			Query: fmt.Sprintf(`sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s",response_code!~"5.*"}[5m])) by (source_workload, source_workload_namespace) / sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s"}[5m])) by (source_workload, source_workload_namespace) * 100`, namespace, application, namespace, application),
		},
		{
			Label: incomingLabel,
			Query: fmt.Sprintf(`round(sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s"}[5m])) by (source_workload, source_workload_namespace), 0.001)`, namespace, application),
		},
		{
			Label: incomingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.50, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s"}[1m])) by (le, source_workload, source_workload_namespace))`, namespace, application),
		},
		{
			Label: incomingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.90, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s"}[1m])) by (le, source_workload, source_workload_namespace))`, namespace, application),
		},
		{
			Label: incomingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.99, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_workload=~"%s"}[1m])) by (le, source_workload, source_workload_namespace))`, namespace, application),
		},
	}

	incoming, err := i.prometheus.GetTableData(ctx, incomingQueries, timeEnd)
	if err != nil {
		return nil, nil, err
	}

	outgoingLabel := "{% .destination_service %}"
	outgoingQueries := []prometheusInstance.Query{
		{
			Label: outgoingLabel,
			Query: fmt.Sprintf(`sum(irate(istio_requests_total{reporter="source",source_workload_namespace=~"%s",source_workload=~"%s",response_code!~"5.*"}[5m])) by (destination_service) / sum(irate(istio_requests_total{reporter="source",source_workload_namespace=~"%s",source_workload=~"%s"}[5m])) by (destination_service) * 100`, namespace, application, namespace, application),
		},
		{
			Label: outgoingLabel,
			Query: fmt.Sprintf(`round(sum(irate(istio_requests_total{reporter="source",source_workload_namespace=~"%s",source_workload=~"%s"}[5m])) by (destination_service), 0.001)`, namespace, application),
		},
		{
			Label: outgoingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.50, sum(irate(istio_request_duration_milliseconds_bucket{reporter="source",source_workload_namespace=~"%s",source_workload=~"%s"}[1m])) by (le, destination_service))`, namespace, application),
		},
		{
			Label: outgoingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.90, sum(irate(istio_request_duration_milliseconds_bucket{reporter="source",source_workload_namespace=~"%s",source_workload=~"%s"}[1m])) by (le, destination_service))`, namespace, application),
		},
		{
			Label: outgoingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.99, sum(irate(istio_request_duration_milliseconds_bucket{reporter="source",source_workload_namespace=~"%s",source_workload=~"%s"}[1m])) by (le, destination_service))`, namespace, application),
		},
	}

	outgoing, err := i.prometheus.GetTableData(ctx, outgoingQueries, timeEnd)
	if err != nil {
		return nil, nil, err
	}

	var edges []Edge
	var nodes []Node

	currentNode := Node{
		Data: NodeData{
			ID:      fmt.Sprintf("%s_%s", namespace, application),
			Metrics: current[fmt.Sprintf("%s_%s", namespace, application)],
		},
	}
	nodes = append(nodes, currentNode)

	for key, value := range incoming {
		nodes = append(nodes, Node{
			Data: NodeData{
				ID:      key,
				Metrics: value,
			},
		})

		edges = append(edges, Edge{
			Data: EdgeData{
				ID:     fmt.Sprintf("%s_%s", key, currentNode.Data.ID),
				Source: key,
				Target: currentNode.Data.ID,
			},
		})
	}

	for key, value := range outgoing {
		nodes = append(nodes, Node{
			Data: NodeData{
				ID:      key,
				Metrics: value,
			},
		})

		edges = append(edges, Edge{
			Data: EdgeData{
				ID:     fmt.Sprintf("%s_%s", currentNode.Data.ID, key),
				Source: currentNode.Data.ID,
				Target: key,
			},
		})
	}

	return edges, nodes, nil
}

// New returns a new Elasticsearch instance for the given configuration.
func New(config Config, prometheusInstances []*prometheusInstance.Instance) (*Instance, error) {
	var prometheusInstance *prometheusInstance.Instance

	if config.Prometheus.Enabled {
		for _, instance := range prometheusInstances {
			if instance.Name == config.Prometheus.Name {
				prometheusInstance = instance
			}
		}

		if prometheusInstance == nil {
			return nil, fmt.Errorf("Prometheus instance \"%s\" was not found", config.Prometheus.Name)
		}
	}

	return &Instance{
		Name:       config.Name,
		prometheus: prometheusInstance,
	}, nil
}
