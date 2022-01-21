package loadbalancers

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Azure/azure-sdk-for-go/profiles/2020-09-01/monitor/mgmt/insights"
	"github.com/Azure/azure-sdk-for-go/services/network/mgmt/2021-05-01/network"
	"github.com/Azure/go-autorest/autorest"
)

type Client interface {
	GetLoadBalancer(ctx context.Context, resourceUri string, lbName string) (network.LoadBalancer, error)
	GetLoadBalancerMetrics(ctx context.Context, resourceUri string, metrics []string) (result insights.Response, err error)
	ListAllLoadBalancers(ctx context.Context) ([]network.LoadBalancer, error)
	ListLoadBalancers(ctx context.Context, resourceGroupName string) (network.LoadBalancerListResultPage, error)
}

type client struct {
	subscriptionID      string
	loadBalancersClient *network.LoadBalancersClient
	metricsClient       *insights.MetricsClient
}

func (c *client) GetLoadBalancer(ctx context.Context, resourceGroup string, lbName string) (network.LoadBalancer, error) {
	return c.loadBalancersClient.Get(ctx, resourceGroup, lbName, "")
}

// GetLoadBalancerMetrics Get the metric values for a resource
// resourceUri - resource identifier (e.g. LoadBalancer.ID)
// metrics - the names of the metrics (comma separated) to retrieve.
func (c *client) GetLoadBalancerMetrics(ctx context.Context, resourceUri string, metrics []string) (result insights.Response, err error) {
	endTime := time.Now().UTC()
	startTime := endTime.Add(time.Duration(-1) * time.Hour)
	timespan := fmt.Sprintf("%s/%s", startTime.Format(time.RFC3339), endTime.Format(time.RFC3339))

	return c.metricsClient.List(ctx, resourceUri, timespan, nil, strings.Join(metrics, ","), "", nil, "", "", insights.Data, "")
}

func (c *client) ListAllLoadBalancers(ctx context.Context) ([]network.LoadBalancer, error) {
	lbs, err := c.loadBalancersClient.ListAll(ctx)
	if err != nil {
		return nil, err
	}
	return lbs.Values(), nil
}

func (c *client) ListLoadBalancers(ctx context.Context, resourceGroupName string) (network.LoadBalancerListResultPage, error) {
	return c.loadBalancersClient.List(ctx, "dev-de1-nodepool")
}

// New returns a new client to interact with the kubernetes services API.
func New(subscriptionID string, authorizer autorest.Authorizer) Client {
	loadBalancersClient := network.NewLoadBalancersClient(subscriptionID)
	loadBalancersClient.Authorizer = authorizer

	metricsClient := insights.NewMetricsClient(subscriptionID)
	metricsClient.Authorizer = authorizer

	return &client{
		subscriptionID:      subscriptionID,
		loadBalancersClient: &loadBalancersClient,
		metricsClient:       &metricsClient,
	}
}
