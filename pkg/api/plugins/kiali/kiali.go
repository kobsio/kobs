package kiali

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	kialiProto "github.com/kobsio/kobs/pkg/api/plugins/kiali/proto"
	pluginsProto "github.com/kobsio/kobs/pkg/api/plugins/plugins/proto"
	"github.com/kobsio/kobs/pkg/api/plugins/plugins/shared"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "kiali"})
)

type Config struct {
	Name        string  `yaml:"name"`
	Description string  `yaml:"description"`
	Address     string  `yaml:"address"`
	Username    string  `yaml:"username"`
	Password    string  `yaml:"password"`
	Token       string  `yaml:"token"`
	Traffic     Traffic `yaml:"traffic"`
}

type Traffic struct {
	Degraded float64 `yaml:"degraded"`
	Failure  float64 `yaml:"failure"`
}

type Metric struct {
	Labels     map[string]string `json:"labels"`
	Datapoints [][]interface{}   `json:"datapoints"`
	Stat       string            `json:"stat"`
	Name       string            `json:"name"`
}

type Kiali struct {
	kialiProto.UnimplementedKialiServer
	instances []*Instance
}

type ResponseError struct {
	Error string `json:"error"`
}

type Instance struct {
	name    string
	address string
	client  *http.Client
	traffic Traffic
}

// doRequest is a helper function for the requests against the Kiali API. It takes the request URL as parameter and
// returns the response from the Kiali API as bytes array, which we can then unmarshal in the correct protobuf message
// format.
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

func (k *Kiali) getInstace(name string) *Instance {
	for _, i := range k.instances {
		if i.name == name {
			return i
		}
	}

	return nil
}

// GetNamespaces returns all namespaces for the requested instance. We just passthrough the call to the Kiali API. Then
// we unmarshal the response into our protobuf message format and return it to the frontend.
func (k *Kiali) GetNamespaces(ctx context.Context, getNamespacesRequest *kialiProto.GetNamespacesRequest) (*kialiProto.GetNamespacesResponse, error) {
	if getNamespacesRequest == nil {
		return nil, fmt.Errorf("request data is missing")
	}

	instance := k.getInstace(getNamespacesRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Kiali plugin")
	}

	body, err := instance.doRequest(ctx, "/kiali/api/namespaces")
	if err != nil {
		return nil, err
	}

	var response []*kialiProto.Namespace
	err = json.Unmarshal(body, &response)
	if err != nil {
		return nil, err
	}

	log.WithFields(logrus.Fields{"namespaces": len(response)}).Debugf("Results.")

	return &kialiProto.GetNamespacesResponse{
		Namespaces: response,
	}, nil
}

// GetGraph returns the data to render the graph for the requested namespaces. We unmarshal the response from the Kiali
// API into our protobuf message format. After that we loop through all edges and nodes to transform some of the
// returned field. This is required so that we can simplify that rendering of the graph in our React UI.
//
// We generate all labels for the edges, where each edge contains the request and success rate for http traffic and the
// bytes for tcp traffic. For http traffic we also determine the status for the edge. This can be enabled in the
// configuration of a single Kiali instance. It is also possible to configure the thresholds. For all nodes we determine
// which image should be rendered within a node, the type of the node and the label for a node.
func (k *Kiali) GetGraph(ctx context.Context, getGraphRequest *kialiProto.GetGraphRequest) (*kialiProto.GetGraphResponse, error) {
	if getGraphRequest == nil {
		return nil, fmt.Errorf("request data is missing")
	}

	instance := k.getInstace(getGraphRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Kiali plugin")
	}

	body, err := instance.doRequest(ctx, fmt.Sprintf("/kiali/api/namespaces/graph?duration=%ds&graphType=%s&injectServiceNodes=%t&groupBy=%s&appenders=%s&namespaces=%s", getGraphRequest.Duration, getGraphRequest.GraphType, getGraphRequest.InjectServiceNodes, getGraphRequest.GroupBy, strings.Join(getGraphRequest.Appenders, ","), strings.Join(getGraphRequest.Namespaces, ",")))
	if err != nil {
		return nil, err
	}

	var response *kialiProto.GetGraphResponse
	err = json.Unmarshal(body, &response)
	if err != nil {
		return nil, err
	}

	if response.Elements != nil {
		for i := 0; i < len(response.Elements.Edges); i++ {
			var edgeType string
			var edgeLabel string

			if response.Elements.Edges[i].Data.Traffic != nil {
				if response.Elements.Edges[i].Data.Traffic.Protocol == "http" {
					edgeType = "http"

					if httpRate, ok := response.Elements.Edges[i].Data.Traffic.Rates["http"]; ok {
						edgeLabel = httpRate + "req/s"
					}

					if httpPercentErr, ok := response.Elements.Edges[i].Data.Traffic.Rates["httpPercentErr"]; ok {
						if edgeLabel == "" {
							edgeLabel = httpPercentErr + "%"
						} else {
							edgeLabel = edgeLabel + "\n" + httpPercentErr + "%"
						}

						httpPercentErrFloat, err := strconv.ParseFloat(httpPercentErr, 64)
						if err == nil {
							if httpPercentErrFloat >= instance.traffic.Failure {
								edgeType = "httpfailure"
							} else if httpPercentErrFloat >= instance.traffic.Degraded {
								edgeType = "httpdegraded"
							} else {
								edgeType = "httphealthy"
							}
						}
					}
				} else if response.Elements.Edges[i].Data.Traffic.Protocol == "grpc" {
					edgeType = "grpc"

					if grpcRate, ok := response.Elements.Edges[i].Data.Traffic.Rates["grpc"]; ok {
						edgeLabel = grpcRate + "req/s"
					}

					if grpcPercentErr, ok := response.Elements.Edges[i].Data.Traffic.Rates["grpcPercentErr"]; ok {
						if edgeLabel == "" {
							edgeLabel = grpcPercentErr + "%"
						} else {
							edgeLabel = edgeLabel + "\n" + grpcPercentErr + "%"
						}
					}
				} else if response.Elements.Edges[i].Data.Traffic.Protocol == "tcp" && response.Elements.Edges[i].Data.Traffic.Rates != nil {
					edgeType = "tcp"
					if rate, ok := response.Elements.Edges[i].Data.Traffic.Rates["tcp"]; ok {
						edgeLabel = rate
					}
				}
			}

			response.Elements.Edges[i].Data.EdgeType = edgeType
			response.Elements.Edges[i].Data.EdgeLabel = edgeLabel
		}

		for i := 0; i < len(response.Elements.Nodes); i++ {
			var nodeLabel string
			var nodeImage string

			if response.Elements.Nodes[i].Data.NodeType == "service" {
				nodeLabel = response.Elements.Nodes[i].Data.Service
			} else if response.Elements.Nodes[i].Data.Parent != "" {
				nodeLabel = response.Elements.Nodes[i].Data.Version
			} else {
				nodeLabel = response.Elements.Nodes[i].Data.App
			}

			if response.Elements.Nodes[i].Data.NodeType != "box" {
				if response.Elements.Nodes[i].Data.App == "unknown" || response.Elements.Nodes[i].Data.Service == "PassthroughCluster" {
					nodeImage = "/img/plugins/kiali/key.png"
				} else if response.Elements.Nodes[i].Data.IsOutside {
					nodeImage = "/img/plugins/kiali/topology.png"
				} else {
					nodeImage = "/img/plugins/kiali/empty.png"
				}
			} else {
				nodeImage = "/img/plugins/kiali/empty.png"
			}

			if response.Elements.Nodes[i].Data.NodeType == "service" && response.Elements.Nodes[i].Data.IsServiceEntry != nil {
				response.Elements.Nodes[i].Data.NodeType = "serviceentry"
			}

			response.Elements.Nodes[i].Data.NodeLabel = nodeLabel
			response.Elements.Nodes[i].Data.NodeLabelFull = fmt.Sprintf("%s\n%s", nodeLabel, response.Elements.Nodes[i].Data.Namespace)
			response.Elements.Nodes[i].Data.NodeImage = nodeImage
		}
	}

	log.WithFields(logrus.Fields{"nodes": len(response.Elements.Nodes), "edges": len(response.Elements.Edges)}).Debugf("Results.")
	return response, nil
}

// GetMetrics returns the Prometheus metrics for the given workload/service from the Kiali API. We transform the API
// response into our protobuf message format, so that we can handle the datapoints better in the React UI.
func (k *Kiali) GetMetrics(ctx context.Context, getMetricsRequest *kialiProto.GetMetricsRequest) (*kialiProto.GetMetricsResponse, error) {
	if getMetricsRequest == nil {
		return nil, fmt.Errorf("request data is missing")
	}

	instance := k.getInstace(getMetricsRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Kiali plugin")
	}

	quantiles := "&quantiles[]=0.5&quantiles[]=0.95&quantiles[]=0.99"
	filters := strings.Join(getMetricsRequest.Filters, "&filters[]=")
	byLabels := strings.Join(getMetricsRequest.ByLabels, "&byLabels[]=")

	var requestProtocol string
	if getMetricsRequest.RequestProtocol != "" {
		requestProtocol = "&requestProtocol=" + getMetricsRequest.RequestProtocol
	}

	url := fmt.Sprintf(
		"/kiali/api/namespaces/%s/%s/%s/metrics?queryTime=%d&duration=%d&step=%d&rateInterval=%s%s&filters[]=%s&byLabels[]=%s&direction=%s&reporter=%s%s",
		getMetricsRequest.Namespace,
		getMetricsRequest.NodeType,
		getMetricsRequest.NodeName,
		getMetricsRequest.QueryTime,
		getMetricsRequest.Duration,
		getMetricsRequest.Step,
		getMetricsRequest.RateInterval,
		quantiles,
		filters,
		byLabels,
		getMetricsRequest.Direction,
		getMetricsRequest.Reporter,
		requestProtocol,
	)
	log.WithFields(logrus.Fields{"url": url}).Debugf("GetMetrics.")

	body, err := instance.doRequest(ctx, url)
	if err != nil {
		return nil, err
	}

	var response map[string][]Metric
	err = json.Unmarshal(body, &response)
	if err != nil {
		return nil, err
	}

	var metrics []*kialiProto.Metric

	for metricName, metricsList := range response {
		for _, metric := range metricsList {
			var data []*kialiProto.Data
			for _, point := range metric.Datapoints {
				value, err := strconv.ParseFloat(point[1].(string), 64)
				if err == nil {
					data = append(data, &kialiProto.Data{
						X: int64(point[0].(float64)) * 1000,
						Y: value,
					})
				}
			}

			metrics = append(metrics, &kialiProto.Metric{
				Name:  metricName,
				Label: metric.Labels[getMetricsRequest.ByLabels[0]],
				Stat:  metric.Stat,
				Data:  data,
			})
		}
	}

	return &kialiProto.GetMetricsResponse{
		Metrics: metrics,
	}, nil
}

// Register is used to register the Kiali plugin at our gRPC server, with all configured instances.
func Register(cfg []Config, grpcServer *grpc.Server) ([]*pluginsProto.PluginShort, error) {
	log.Tracef("Register Kiali Plugin.")

	var pluginDetails []*pluginsProto.PluginShort
	var instances []*Instance

	for _, config := range cfg {
		roundTripper := shared.DefaultRoundTripper

		if config.Username != "" && config.Password != "" {
			roundTripper = shared.BasicAuthTransport{
				Transport: roundTripper,
				Username:  config.Username,
				Password:  config.Password,
			}
		}

		if config.Token != "" {
			roundTripper = shared.TokenAuthTransporter{
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

		pluginDetails = append(pluginDetails, &pluginsProto.PluginShort{
			Name:        config.Name,
			Description: config.Description,
			Type:        "kiali",
		})
		instances = append(instances, &Instance{
			name:    config.Name,
			address: config.Address,
			client: &http.Client{
				Transport: roundTripper,
			},
			traffic: traffic,
		})
	}

	kialiProto.RegisterKialiServer(grpcServer, &Kiali{
		instances: instances,
	})

	return pluginDetails, nil
}
