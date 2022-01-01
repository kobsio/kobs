package monitor

import (
	"context"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/monitor/armmonitor"
)

// Client is the interface for a client to interact with the Azure monitoring api.
type Client interface {
	GetMetrics(ctx context.Context, resourceGroup, provider, metricNames, aggregationType string, timeStart, timeEnd int64) ([]*armmonitor.Metric, error)
}

type client struct {
	subscriptionID string
	metricsClient  *armmonitor.MetricsClient
}

// GetMetrics returns the metrisc for a provider.
func (c *client) GetMetrics(ctx context.Context, resourceGroup, provider, metricNames, aggregationType string, timeStart, timeEnd int64) ([]*armmonitor.Metric, error) {
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
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) Client {
	metricsClient := armmonitor.NewMetricsClient(credentials, &arm.ClientOptions{})

	return &client{
		subscriptionID: subscriptionID,
		metricsClient:  metricsClient,
	}
}
