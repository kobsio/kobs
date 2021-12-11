package monitor

import (
	"context"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/monitor/armmonitor"
)

// Client is the client to interact with the monitor API.
type Client struct {
	subscriptionID string
	metricsClient  *armmonitor.MetricsClient
}

// GetMetrics returns the metrisc for a provider.
func (c *Client) GetMetrics(ctx context.Context, resourceGroup, provider, metricNames, aggregationType string, timeStart, timeEnd int64) ([]*armmonitor.Metric, error) {
	interval, timespan, top := getMetricsOptions(timeStart, timeEnd)

	res, err := c.metricsClient.List(ctx, "/subscriptions/"+c.subscriptionID+"/resourceGroups/"+resourceGroup+"/providers/"+provider, &armmonitor.MetricsListOptions{
		Aggregation: &aggregationType,
		Interval:    &interval,
		Metricnames: &metricNames,
		ResultType:  armmonitor.ResultTypeData.ToPtr(),
		Timespan:    &timespan,
		Top:         &top,
	})
	if err != nil {
		return nil, err
	}

	return res.Value, nil
}

// New returns a new client to interact with the monitor API.
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) *Client {
	metricsClient := armmonitor.NewMetricsClient(credentials, &arm.ClientOptions{})

	return &Client{
		subscriptionID: subscriptionID,
		metricsClient:  metricsClient,
	}
}
