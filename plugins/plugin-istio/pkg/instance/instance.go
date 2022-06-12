package instance

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	klogsInstance "github.com/kobsio/kobs/plugins/plugin-klogs/pkg/instance"
	prometheusInstance "github.com/kobsio/kobs/plugins/plugin-prometheus/pkg/instance"

	"github.com/mitchellh/mapstructure"
)

// Config is the structure of the configuration for a single Harbor database instance.
type Config struct {
	Prometheus ConfigPrometheus `json:"prometheus"`
	Klogs      ConfigKlogs      `json:"klogs"`
}

// ConfigPrometheus is the structure of the configuration, which is required to enabled the Prometheus integration for
// the Istio plugin.
type ConfigPrometheus struct {
	Enabled bool                   `json:"enabled"`
	Options map[string]interface{} `json:"options"`
}

// ConfigKlogs is the structure of the configuration, which is required to enabled the klogs integration for the Istio
// plugin.
type ConfigKlogs struct {
	Enabled bool                   `json:"enabled"`
	Options map[string]interface{} `json:"options"`
}

type Instance interface {
	GetName() string
	GetNamespaces(ctx context.Context, timeStart int64, timeEnd int64) ([]string, error)
	GetMetrics(ctx context.Context, namespaces []string, application, label, groupBy, reporter string, timeStart int64, timeEnd int64) (map[string]map[string]string, error)
	GetMetricsDetails(ctx context.Context, metric, reporter, destinationWorkload, destinationWorkloadNamespace, destinationVersion, destinationService, sourceWorkload, sourceWorkloadNamespace, pod string, timeStart int64, timeEnd int64) (*prometheusInstance.Metrics, error)
	GetMetricsPod(ctx context.Context, metric, namespace, pod string, timeStart int64, timeEnd int64) (*prometheusInstance.Metrics, error)
	GetTopology(ctx context.Context, namespace, application string, timeStart int64, timeEnd int64) ([]Edge, []Node, error)
	Tap(ctx context.Context, namespace, application, filterUpstreamCluster, filterMethod, filterPath string, timeStart int64, timeEnd int64) ([]map[string]interface{}, error)
	Top(ctx context.Context, namespace, application, filterUpstreamCluster, filterMethod, filterPath, sortBy, sortDirection string, timeStart int64, timeEnd int64) ([][]interface{}, error)
	TopDetails(ctx context.Context, namespace, application, upstreamCluster, method, path string, timeStart int64, timeEnd int64) ([][]interface{}, error)
}

type instance struct {
	name       string
	address    string
	client     *http.Client
	prometheus prometheusInstance.Instance
	klogs      klogsInstance.Instance
}

func (i *instance) GetName() string {
	return i.name
}

// GetNamespaces returns a list of namespaces, which can be selected to get the applications from.
func (i *instance) GetNamespaces(ctx context.Context, timeStart int64, timeEnd int64) ([]string, error) {
	return i.prometheus.GetVariable(ctx, "destination_workload_namespace", "istio_requests_total{reporter=\"destination\"}", "", timeStart, timeEnd)
}

// GetMetrics returns the success rate, requests per second, P50, P90 and P99 latency for the specified namespaces and
// labels.
func (i *instance) GetMetrics(ctx context.Context, namespaces []string, application, label, groupBy, reporter string, timeStart int64, timeEnd int64) (map[string]map[string]string, error) {
	label = "{% ." + label + " %}"
	namespacesStr := strings.Join(namespaces, "|")

	if application == "" {
		application = ".*"
	}

	queries := []prometheusInstance.Query{
		{
			Label: label,
			Query: fmt.Sprintf(`sum(irate(istio_requests_total{reporter="%s",destination_workload_namespace=~"%s",destination_app=~"%s",response_code!~"5.*"}[5m])) by (%s) / sum(irate(istio_requests_total{reporter="%s",destination_workload_namespace=~"%s",destination_app=~"%s"}[5m])) by (%s) * 100`, reporter, namespacesStr, application, groupBy, reporter, namespacesStr, application, groupBy),
		},
		{
			Label: label,
			Query: fmt.Sprintf(`round(sum(irate(istio_requests_total{reporter="%s",destination_workload_namespace=~"%s",destination_app=~"%s"}[5m])) by (%s), 0.001)`, reporter, namespacesStr, application, groupBy),
		},
		{
			Label: label,
			Query: fmt.Sprintf(`histogram_quantile(0.50, sum(irate(istio_request_duration_milliseconds_bucket{reporter="%s",destination_workload_namespace=~"%s",destination_app=~"%s"}[1m])) by (le, %s))`, reporter, namespacesStr, application, groupBy),
		},
		{
			Label: label,
			Query: fmt.Sprintf(`histogram_quantile(0.90, sum(irate(istio_request_duration_milliseconds_bucket{reporter="%s",destination_workload_namespace=~"%s",destination_app=~"%s"}[1m])) by (le, %s))`, reporter, namespacesStr, application, groupBy),
		},
		{
			Label: label,
			Query: fmt.Sprintf(`histogram_quantile(0.99, sum(irate(istio_request_duration_milliseconds_bucket{reporter="%s",destination_workload_namespace=~"%s",destination_app=~"%s"}[1m])) by (le, %s))`, reporter, namespacesStr, application, groupBy),
		},
	}

	return i.prometheus.GetTableData(ctx, queries, timeEnd)
}

// GetMetricsDetails returns the timeseries data for the requested details metric.
func (i *instance) GetMetricsDetails(ctx context.Context, metric, reporter, destinationWorkload, destinationWorkloadNamespace, destinationVersion, destinationService, sourceWorkload, sourceWorkloadNamespace, pod string, timeStart int64, timeEnd int64) (*prometheusInstance.Metrics, error) {
	var queries []prometheusInstance.Query

	if metric == "sr" {
		queries = append(queries, prometheusInstance.Query{
			Label: "SR",
			Query: fmt.Sprintf(`sum(irate(istio_requests_total{reporter="%s",destination_app=~"%s",destination_workload_namespace=~"%s",destination_version=~"%s",destination_service=~"%s",source_workload=~"%s",source_workload_namespace=~"%s",pod=~"%s",response_code!~"5.*"}[5m])) / sum(irate(istio_requests_total{reporter="%s",destination_app=~"%s",destination_workload_namespace=~"%s",destination_version=~"%s",destination_service=~"%s",source_workload=~"%s",source_workload_namespace=~"%s",pod=~"%s"}[5m])) * 100`, reporter, destinationWorkload, destinationWorkloadNamespace, destinationVersion, destinationService, sourceWorkload, sourceWorkloadNamespace, pod, reporter, destinationWorkload, destinationWorkloadNamespace, destinationVersion, destinationService, sourceWorkload, sourceWorkloadNamespace, pod),
		})
	} else if metric == "rps" {
		queries = append(queries, prometheusInstance.Query{
			Label: "RPS",
			Query: fmt.Sprintf(`round(sum(irate(istio_requests_total{reporter="%s",destination_app=~"%s",destination_workload_namespace=~"%s",destination_version=~"%s",destination_service=~"%s",source_workload=~"%s",source_workload_namespace=~"%s",pod=~"%s"}[5m])), 0.001)`, reporter, destinationWorkload, destinationWorkloadNamespace, destinationVersion, destinationService, sourceWorkload, sourceWorkloadNamespace, pod),
		})
	} else if metric == "latency" {
		queries = append(queries, prometheusInstance.Query{
			Label: "P50",
			Query: fmt.Sprintf(`histogram_quantile(0.50, sum(irate(istio_request_duration_milliseconds_bucket{reporter="%s",destination_app=~"%s",destination_workload_namespace=~"%s",destination_version=~"%s",destination_service=~"%s",source_workload=~"%s",source_workload_namespace=~"%s",pod=~"%s"}[1m])) by (le))`, reporter, destinationWorkload, destinationWorkloadNamespace, destinationVersion, destinationService, sourceWorkload, sourceWorkloadNamespace, pod),
		})
		queries = append(queries, prometheusInstance.Query{
			Label: "P90",
			Query: fmt.Sprintf(`histogram_quantile(0.90, sum(irate(istio_request_duration_milliseconds_bucket{reporter="%s",destination_app=~"%s",destination_workload_namespace=~"%s",destination_version=~"%s",destination_service=~"%s",source_workload=~"%s",source_workload_namespace=~"%s",pod=~"%s"}[1m])) by (le))`, reporter, destinationWorkload, destinationWorkloadNamespace, destinationVersion, destinationService, sourceWorkload, sourceWorkloadNamespace, pod),
		})
		queries = append(queries, prometheusInstance.Query{
			Label: "P99",
			Query: fmt.Sprintf(`histogram_quantile(0.99, sum(irate(istio_request_duration_milliseconds_bucket{reporter="%s",destination_app=~"%s",destination_workload_namespace=~"%s",destination_version=~"%s",destination_service=~"%s",source_workload=~"%s",source_workload_namespace=~"%s",pod=~"%s"}[1m])) by (le))`, reporter, destinationWorkload, destinationWorkloadNamespace, destinationVersion, destinationService, sourceWorkload, sourceWorkloadNamespace, pod),
		})
	} else {
		return nil, fmt.Errorf("invalid metric")
	}

	return i.prometheus.GetMetrics(ctx, queries, "", timeStart, timeEnd)
}

// GetMetricsPod returns the timeseries data for the requested details metric.
func (i *instance) GetMetricsPod(ctx context.Context, metric, namespace, pod string, timeStart int64, timeEnd int64) (*prometheusInstance.Metrics, error) {
	var queries []prometheusInstance.Query

	if metric == "cpu" {
		queries = append(queries, prometheusInstance.Query{
			Label: "Usage: {% .container %}",
			Query: fmt.Sprintf(`sum(rate(container_cpu_usage_seconds_total{namespace="%s", image!="", pod=~"%s", container!="POD", container!=""}[2m])) by (container)`, namespace, pod),
		})
		queries = append(queries, prometheusInstance.Query{
			Label: "Request: {% .container %}",
			Query: fmt.Sprintf(`sum(kube_pod_container_resource_requests{namespace="%s", resource="cpu", pod=~"%s", container!="POD", container!=""}) by (container)`, namespace, pod),
		})
		queries = append(queries, prometheusInstance.Query{
			Label: "Limits: {% .container %}",
			Query: fmt.Sprintf(`sum(kube_pod_container_resource_limits{namespace="%s", resource="cpu", pod=~"%s", container!="POD", container!=""}) by (container)`, namespace, pod),
		})
	} else if metric == "throttling" {
		queries = append(queries, prometheusInstance.Query{
			Label: "{% .container %}",
			Query: fmt.Sprintf(`sum(increase(container_cpu_cfs_throttled_periods_total{namespace="%s", pod="%s", container!="POD", container!=""}[5m])) by (container) /sum(increase(container_cpu_cfs_periods_total{namespace="%s", pod="%s", container!="POD", container!=""}[5m])) by (container) * 100`, namespace, pod, namespace, pod),
		})
	} else if metric == "memory" {
		queries = append(queries, prometheusInstance.Query{
			Label: "Usage: {% .container %}",
			Query: fmt.Sprintf(`sum(rate(container_memory_working_set_bytes{namespace="%s", image!="", pod=~"%s", container!="POD", container!=""}[2m])) by (container) / 1024 / 1024`, namespace, pod),
		})
		queries = append(queries, prometheusInstance.Query{
			Label: "Request: {% .container %}",
			Query: fmt.Sprintf(`sum(kube_pod_container_resource_requests{namespace="%s", resource="memory", pod=~"%s", container!="POD", container!=""}) by (container) / 1024 / 1024`, namespace, pod),
		})
		queries = append(queries, prometheusInstance.Query{
			Label: "Limits: {% .container %}",
			Query: fmt.Sprintf(`sum(kube_pod_container_resource_limits{namespace="%s", resource="memory", pod=~"%s", container!="POD", container!=""}) by (container) / 1024 / 1024`, namespace, pod),
		})
	} else {
		return nil, fmt.Errorf("invalid metric")
	}

	return i.prometheus.GetMetrics(ctx, queries, "", timeStart, timeEnd)
}

// GetTopology creates a simple topology graph for the given application, with all the incoming sources and outgoing
// destinations for the application.
func (i *instance) GetTopology(ctx context.Context, namespace, application string, timeStart int64, timeEnd int64) ([]Edge, []Node, error) {
	currentLabel := "{% .destination_workload_namespace %}_{% .destination_app %}"
	currentQueries := []prometheusInstance.Query{
		{
			Label: currentLabel,
			Query: fmt.Sprintf(`sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s",response_code!~"5.*"}[5m])) by (destination_app, destination_workload_namespace) / sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s"}[5m])) by (destination_app, destination_workload_namespace) * 100`, namespace, application, namespace, application),
		},
		{
			Label: currentLabel,
			Query: fmt.Sprintf(`round(sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s"}[5m])) by (destination_app, destination_workload_namespace), 0.001)`, namespace, application),
		},
		{
			Label: currentLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.50, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s"}[1m])) by (le, destination_app, destination_workload_namespace))`, namespace, application),
		},
		{
			Label: currentLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.90, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s"}[1m])) by (le, destination_app, destination_workload_namespace))`, namespace, application),
		},
		{
			Label: currentLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.99, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s"}[1m])) by (le, destination_app, destination_workload_namespace))`, namespace, application),
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
			Query: fmt.Sprintf(`sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s",response_code!~"5.*"}[5m])) by (source_workload, source_workload_namespace) / sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s"}[5m])) by (source_workload, source_workload_namespace) * 100`, namespace, application, namespace, application),
		},
		{
			Label: incomingLabel,
			Query: fmt.Sprintf(`round(sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s"}[5m])) by (source_workload, source_workload_namespace), 0.001)`, namespace, application),
		},
		{
			Label: incomingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.50, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s"}[1m])) by (le, source_workload, source_workload_namespace))`, namespace, application),
		},
		{
			Label: incomingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.90, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s"}[1m])) by (le, source_workload, source_workload_namespace))`, namespace, application),
		},
		{
			Label: incomingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.99, sum(irate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace=~"%s",destination_app=~"%s"}[1m])) by (le, source_workload, source_workload_namespace))`, namespace, application),
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
			Query: fmt.Sprintf(`sum(irate(istio_requests_total{reporter="source",source_workload_namespace=~"%s",source_app=~"%s",response_code!~"5.*"}[5m])) by (destination_service) / sum(irate(istio_requests_total{reporter="source",source_workload_namespace=~"%s",source_app=~"%s"}[5m])) by (destination_service) * 100`, namespace, application, namespace, application),
		},
		{
			Label: outgoingLabel,
			Query: fmt.Sprintf(`round(sum(irate(istio_requests_total{reporter="source",source_workload_namespace=~"%s",source_app=~"%s"}[5m])) by (destination_service), 0.001)`, namespace, application),
		},
		{
			Label: outgoingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.50, sum(irate(istio_request_duration_milliseconds_bucket{reporter="source",source_workload_namespace=~"%s",source_app=~"%s"}[1m])) by (le, destination_service))`, namespace, application),
		},
		{
			Label: outgoingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.90, sum(irate(istio_request_duration_milliseconds_bucket{reporter="source",source_workload_namespace=~"%s",source_app=~"%s"}[1m])) by (le, destination_service))`, namespace, application),
		},
		{
			Label: outgoingLabel,
			Query: fmt.Sprintf(`histogram_quantile(0.99, sum(irate(istio_request_duration_milliseconds_bucket{reporter="source",source_workload_namespace=~"%s",source_app=~"%s"}[1m])) by (le, destination_service))`, namespace, application),
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

// Tap returns the logs for the specified Istio application.
func (i *instance) Tap(ctx context.Context, namespace, application, filterUpstreamCluster, filterMethod, filterPath string, timeStart int64, timeEnd int64) ([]map[string]interface{}, error) {
	var filters string
	if filterUpstreamCluster != "" {
		filters = filters + fmt.Sprintf(" _and_ content.upstream_cluster~'%s'", filterUpstreamCluster)
	}
	if filterMethod != "" {
		filters = filters + fmt.Sprintf(" _and_ content.method~'%s'", filterMethod)
	}
	if filterPath != "" {
		filters = filters + fmt.Sprintf(" _and_ content.path~'%s'", filterPath)
	}

	logs, _, _, _, _, err := i.klogs.GetLogs(ctx, fmt.Sprintf("namespace='%s' _and_ app='%s' _and_ container_name='istio-proxy' %s", namespace, application, filters), "", "", 100, timeStart, timeEnd)
	if err != nil {
		return nil, err
	}

	return logs, nil
}

// Top returns the aggregated logs for the specified Istio application.
func (i *instance) Top(ctx context.Context, namespace, application, filterUpstreamCluster, filterMethod, filterPath, sortBy, sortDirection string, timeStart int64, timeEnd int64) ([][]interface{}, error) {
	var filters string
	if filterUpstreamCluster != "" {
		filters = filters + fmt.Sprintf(" AND match(fields_string.value[indexOf(fields_string.key, 'content.upstream_cluster')], '%s')", filterUpstreamCluster)
	}
	if filterMethod != "" {
		filters = filters + fmt.Sprintf(" AND match(fields_string.value[indexOf(fields_string.key, 'content.method')], '%s')", filterMethod)
	}
	if filterPath != "" {
		filters = filters + fmt.Sprintf(" AND match(fields_string.value[indexOf(fields_string.key, 'content.path')], '%s')", filterPath)
	}

	rows, _, err := i.klogs.GetRawQueryResults(ctx, fmt.Sprintf(`SELECT
    fields_string.value[indexOf(fields_string.key, 'content.upstream_cluster')] as upstream,
    fields_string.value[indexOf(fields_string.key, 'content.method')] as method,
    path(fields_string.value[indexOf(fields_string.key, 'content.path')]) as path,
    count(*) as count,
    min(fields_number.value[indexOf(fields_number.key, 'content.duration')]) as min,
    max(fields_number.value[indexOf(fields_number.key, 'content.duration')]) as max,
    avg(fields_number.value[indexOf(fields_number.key, 'content.duration')]) as avg,
    anyLast(fields_number.value[indexOf(fields_number.key, 'content.duration')]) as last,
    countIf(fields_number.value[indexOf(fields_number.key, 'content.response_code')] < 500) / count * 100 as sr
FROM logs.logs
WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) AND namespace = '%s' AND app = '%s' AND container_name = 'istio-proxy' %s
GROUP BY
    fields_string.value[indexOf(fields_string.key, 'content.upstream_cluster')],
    fields_string.value[indexOf(fields_string.key, 'content.method')],
    path(fields_string.value[indexOf(fields_string.key, 'content.path')])
ORDER BY %s %s
LIMIT 100
SETTINGS skip_unavailable_shards = 1`, timeStart, timeEnd, namespace, application, filters, sortBy, sortDirection))
	if err != nil {
		return nil, err
	}

	return rows, nil
}

// TopDetails returns the success rate and latency for the specified upstream cluster, method and path.
func (i *instance) TopDetails(ctx context.Context, namespace, application, upstreamCluster, method, path string, timeStart int64, timeEnd int64) ([][]interface{}, error) {
	interval := (timeEnd - timeStart) / 30
	filters := fmt.Sprintf(" AND namespace = '%s' AND app = '%s' AND container_name = 'istio-proxy'", namespace, application)

	if upstreamCluster != "" {
		filters = filters + fmt.Sprintf(" AND fields_string.value[indexOf(fields_string.key, 'content.upstream_cluster')] = '%s'", upstreamCluster)
	}
	if method != "" {
		filters = filters + fmt.Sprintf(" AND fields_string.value[indexOf(fields_string.key, 'content.method')] = '%s'", method)
	}
	if path != "" {
		filters = filters + fmt.Sprintf(" AND path(fields_string.value[indexOf(fields_string.key, 'content.path')]) = '%s'", path)
	}

	rows, _, err := i.klogs.GetRawQueryResults(ctx, fmt.Sprintf(`SELECT
    toStartOfInterval(timestamp, INTERVAL %d second) AS interval_data,
    count(*) AS count_data,
    countIf(fields_number.value[indexOf(fields_number.key, 'content.response_code')] < 500) / count_data * 100 as sr_data,
    quantile(0.5)(fields_number.value[indexOf(fields_number.key, 'content.duration')]) as p50_data,
    quantile(0.9)(fields_number.value[indexOf(fields_number.key, 'content.duration')]) as p90_data,
    quantile(0.99)(fields_number.value[indexOf(fields_number.key, 'content.duration')]) as p99_data
FROM logs.logs
WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) %s
GROUP BY interval_data
ORDER BY interval_data
WITH FILL FROM toStartOfInterval(FROM_UNIXTIME(%d), INTERVAL %d second) TO toStartOfInterval(FROM_UNIXTIME(%d), INTERVAL %d second) STEP %d
SETTINGS skip_unavailable_shards = 1`, interval, timeStart, timeEnd, filters, timeStart, interval, timeEnd, interval, interval))
	if err != nil {
		return nil, err
	}

	return rows, nil
}

// New returns a new Elasticsearch instance for the given configuration.
func New(name string, options map[string]interface{}) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	prometheusInstance, err := prometheusInstance.New("prometheus", config.Prometheus.Options)
	if err != nil {
		return nil, err
	}

	klogsInstance, err := klogsInstance.New("klogs", config.Klogs.Options)
	if err != nil {
		return nil, err
	}

	return &instance{
		name:       name,
		prometheus: prometheusInstance,
		klogs:      klogsInstance,
	}, nil
}
