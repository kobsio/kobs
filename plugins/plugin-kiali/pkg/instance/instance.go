package instance

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/kobsio/kobs/pkg/middleware/roundtripper"

	"github.com/kiali/kiali/models"
	"github.com/mitchellh/mapstructure"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

// Config is the structure of the configuration for a single Harbor database instance.
type Config struct {
	Address  string `json:"address"`
	Username string `json:"username"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

type Instance interface {
	GetName() string
	GetNamespaces(ctx context.Context) ([]models.Namespace, error)
	GetGraph(ctx context.Context, duration int64, graphType, groupBy string, injectServiceNodes bool, appenders, namespaces []string) (*Graph, error)
	GetMetrics(ctx context.Context, url string) (*map[string]interface{}, error)
}

type instance struct {
	name    string
	address string
	client  *http.Client
	traffic Traffic
}

func (i *instance) GetName() string {
	return i.name
}

// GetNamespaces returns all namespaces from the Kiali instance.
func (i *instance) GetNamespaces(ctx context.Context) ([]models.Namespace, error) {
	namespaces, err := doRequest[[]models.Namespace](ctx, i.client, fmt.Sprintf("%s/kiali/api/namespaces", i.address))
	if err != nil {
		return nil, err
	}

	return namespaces, nil
}

// GetGraph returns the topology graph from the Kiali API, with some additional fields, which we need to render the
// graph in our React UI.
func (i *instance) GetGraph(ctx context.Context, duration int64, graphType, groupBy string, injectServiceNodes bool, appenders, namespaces []string) (*Graph, error) {
	graph, err := doRequest[*Graph](ctx, i.client, fmt.Sprintf("%s/kiali/api/namespaces/graph?duration=%ds&graphType=%s&injectServiceNodes=%t&groupBy=%s&appenders=%s&namespaces=%s", i.address, duration, graphType, injectServiceNodes, groupBy, strings.Join(appenders, ","), strings.Join(namespaces, ",")))
	if err != nil {
		return nil, err
	}

	if graph.Elements != nil {
		for j := 0; j < len(graph.Elements.Edges); j++ {
			var edgeType string
			var edgeLabel string

			if graph.Elements.Edges[j].Data != nil {
				if graph.Elements.Edges[j].Data.Traffic.Protocol == "http" {
					edgeType = "http"

					if httpRate, ok := graph.Elements.Edges[j].Data.Traffic.Rates["http"]; ok {
						edgeLabel = httpRate + "req/s"
					}

					if httpPercentErr, ok := graph.Elements.Edges[j].Data.Traffic.Rates["httpPercentErr"]; ok {
						if edgeLabel == "" {
							edgeLabel = httpPercentErr + "%"
						} else {
							edgeLabel = edgeLabel + "\n" + httpPercentErr + "%"
						}

						httpPercentErrFloat, err := strconv.ParseFloat(httpPercentErr, 64)
						if err == nil {
							if httpPercentErrFloat >= i.traffic.Failure {
								edgeType = "httpfailure"
							} else if httpPercentErrFloat >= i.traffic.Degraded {
								edgeType = "httpdegraded"
							} else {
								edgeType = "httphealthy"
							}
						}
					}
				} else if graph.Elements.Edges[j].Data.Traffic.Protocol == "grpc" {
					edgeType = "grpc"

					if grpcRate, ok := graph.Elements.Edges[j].Data.Traffic.Rates["grpc"]; ok {
						edgeLabel = grpcRate + "req/s"
					}

					if grpcPercentErr, ok := graph.Elements.Edges[j].Data.Traffic.Rates["grpcPercentErr"]; ok {
						if edgeLabel == "" {
							edgeLabel = grpcPercentErr + "%"
						} else {
							edgeLabel = edgeLabel + "\n" + grpcPercentErr + "%"
						}
					}
				} else if graph.Elements.Edges[j].Data.Traffic.Protocol == "tcp" && graph.Elements.Edges[j].Data.Traffic.Rates != nil {
					edgeType = "tcp"
					if rate, ok := graph.Elements.Edges[j].Data.Traffic.Rates["tcp"]; ok {
						edgeLabel = rate
					}
				}
			}

			graph.Elements.Edges[j].Data.EdgeType = edgeType
			graph.Elements.Edges[j].Data.EdgeLabel = edgeLabel
		}

		for j := 0; j < len(graph.Elements.Nodes); j++ {
			var nodeLabel string
			var nodeImage string

			if graph.Elements.Nodes[j].Data.NodeType == "service" {
				nodeLabel = graph.Elements.Nodes[j].Data.Service
			} else if graph.Elements.Nodes[j].Data.Parent != "" {
				nodeLabel = graph.Elements.Nodes[j].Data.Version
			} else {
				nodeLabel = graph.Elements.Nodes[j].Data.App
			}

			if graph.Elements.Nodes[j].Data.NodeType != "box" {
				if graph.Elements.Nodes[j].Data.App == "unknown" || graph.Elements.Nodes[j].Data.Service == "PassthroughCluster" {
					nodeImage = imageKey
				} else if graph.Elements.Nodes[j].Data.IsOutside {
					nodeImage = imageTopology
				} else {
					nodeImage = imageEmpty
				}
			} else {
				nodeImage = imageEmpty
			}

			if graph.Elements.Nodes[j].Data.NodeType == "service" && graph.Elements.Nodes[j].Data.IsServiceEntry != nil {
				graph.Elements.Nodes[j].Data.NodeType = "serviceentry"
			}

			graph.Elements.Nodes[j].Data.NodeLabel = nodeLabel
			graph.Elements.Nodes[j].Data.NodeLabelFull = fmt.Sprintf("%s\n%s", nodeLabel, graph.Elements.Nodes[j].Data.Namespace)
			graph.Elements.Nodes[j].Data.NodeImage = nodeImage
		}
	}

	return graph, nil
}

// GetMetrics returns the metrics for an edge or node in the Kiali topology graph.
func (i *instance) GetMetrics(ctx context.Context, url string) (*map[string]interface{}, error) {
	metrics, err := doRequest[map[string]interface{}](ctx, i.client, i.address+url)
	if err != nil {
		return nil, err
	}

	return &metrics, nil
}

// New returns a new Kiali instance for the given configuration.
func New(name string, options map[string]interface{}) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	roundTripper := roundtripper.DefaultRoundTripper

	if config.Username != "" && config.Password != "" {
		roundTripper = roundtripper.BasicAuthTransport{
			Transport: roundTripper,
			Username:  config.Username,
			Password:  config.Password,
		}
	}

	if config.Token != "" {
		roundTripper = roundtripper.TokenAuthTransporter{
			Transport: roundTripper,
			Token:     config.Token,
		}
	}

	return &instance{
		name:    name,
		address: config.Address,
		client: &http.Client{
			Transport: otelhttp.NewTransport(roundTripper),
		},
	}, nil
}
