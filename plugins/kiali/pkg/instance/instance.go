package instance

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	"github.com/kobsio/kobs/pkg/api/middleware/roundtripper"

	"github.com/kiali/kiali/graph/config/cytoscape"
	"github.com/kiali/kiali/models"
)

// Config is the structure of the configuration for a single Kiali instance.
type Config struct {
	Name        string  `json:"name"`
	DisplayName string  `json:"displayName"`
	Description string  `json:"description"`
	Home        bool    `json:"home"`
	Address     string  `json:"address"`
	Username    string  `json:"username"`
	Password    string  `json:"password"`
	Token       string  `json:"token"`
	Traffic     Traffic `json:"traffic"`
}

// Traffic is the traffic configuration, to set the value to mark a edge as degraded and failure.
type Traffic struct {
	Degraded float64 `json:"degraded"`
	Failure  float64 `json:"failure"`
}

// Graph is the structure of the returned topology graph from Kiali. We have to implement it by ourselve, because we
// have to add some additional fields, which are required by the React UI.
type Graph struct {
	Elements *Elements `json:"elements"`
}

// Elements is the https://pkg.go.dev/github.com/kiali/kiali@v1.37.0/graph/config/cytoscape#Elements struct.
type Elements struct {
	Nodes []*NodeWrapper `json:"nodes"`
	Edges []*EdgeWrapper `json:"edges"`
}

// NodeWrapper is the https://pkg.go.dev/github.com/kiali/kiali@v1.37.0/graph/config/cytoscape#NodeWrapper struct.
type NodeWrapper struct {
	Data *NodeData `json:"data"`
}

// NodeData is the https://pkg.go.dev/github.com/kiali/kiali@v1.37.0/graph/config/cytoscape#NodeData struct plus our
// additional fields.
type NodeData struct {
	cytoscape.NodeData

	NodeLabel     string `json:"nodeLabel"`
	NodeLabelFull string `json:"nodeLabelFull"`
	NodeImage     string `json:"nodeImage"`
}

// EdgeWrapper is the https://pkg.go.dev/github.com/kiali/kiali@v1.37.0/graph/config/cytoscape#EdgeWrapper struct.
type EdgeWrapper struct {
	Data *EdgeData `json:"data"`
}

// EdgeData is the https://pkg.go.dev/github.com/kiali/kiali@v1.37.0/graph/config/cytoscape#EdgeData struct plus our
// additional fields.
type EdgeData struct {
	cytoscape.EdgeData

	EdgeType  string `json:"edgeType"`
	EdgeLabel string `json:"edgeLabel"`
}

// ResponseError is the structure for a failed Kiali API request.
type ResponseError struct {
	Error string `json:"error"`
}

// Instance represents a single Kiali instance, which can be added via the configuration file.
type Instance struct {
	Name    string
	address string
	client  *http.Client
	traffic Traffic
}

// doRequest is a helper function to run a request against a Kiali instance for the given path. It returns the body or
// if the request failed the error message.
func (i *Instance) doRequest(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s%s", i.address, url), nil)
	if err != nil {
		return nil, err
	}

	resp, err := i.client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}

		return body, nil
	}

	var res ResponseError

	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return nil, err
	}

	return nil, fmt.Errorf("%s", res.Error)
}

// GetNamespaces returns all namespaces from the Kiali instance.
func (i *Instance) GetNamespaces(ctx context.Context) ([]models.Namespace, error) {
	body, err := i.doRequest(ctx, "/kiali/api/namespaces")
	if err != nil {
		return nil, err
	}

	var namespaces []models.Namespace
	err = json.Unmarshal(body, &namespaces)
	if err != nil {
		return nil, err
	}

	return namespaces, nil
}

// GetGraph returns the topology graph from the Kiali API, with some additional fields, which we need to render the
// graph in our React UI.
func (i *Instance) GetGraph(ctx context.Context, duration int64, graphType, groupBy string, injectServiceNodes bool, appenders, namespaces []string) (*Graph, error) {
	body, err := i.doRequest(ctx, fmt.Sprintf("/kiali/api/namespaces/graph?duration=%ds&graphType=%s&injectServiceNodes=%t&groupBy=%s&appenders=%s&namespaces=%s", duration, graphType, injectServiceNodes, groupBy, strings.Join(appenders, ","), strings.Join(namespaces, ",")))
	if err != nil {
		return nil, err
	}

	var graph Graph
	err = json.Unmarshal(body, &graph)
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

	return &graph, nil
}

// GetMetrics returns the metrics for an edge or node in the Kiali topology graph.
func (i *Instance) GetMetrics(ctx context.Context, url string) (*map[string]interface{}, error) {
	body, err := i.doRequest(ctx, url)
	if err != nil {
		return nil, err
	}

	var metrics map[string]interface{}
	err = json.Unmarshal(body, &metrics)
	if err != nil {
		return nil, err
	}

	return &metrics, nil
}

// New returns a new Kiali instance for the given configuration.
func New(config Config) (*Instance, error) {
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

	traffic := config.Traffic
	if traffic.Degraded <= 0 || traffic.Degraded >= 100 || traffic.Degraded > traffic.Failure {
		traffic.Degraded = 1
	}

	if traffic.Failure <= 0 || traffic.Failure >= 100 || traffic.Degraded > traffic.Failure {
		traffic.Failure = 5
	}

	return &Instance{
		Name:    config.Name,
		address: config.Address,
		client: &http.Client{
			Transport: roundTripper,
		},
		traffic: traffic,
	}, nil
}
