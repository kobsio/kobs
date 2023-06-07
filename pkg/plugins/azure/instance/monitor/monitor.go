package monitor

//go:generate mockgen -source=monitor.go -destination=./monitor_mock.go -package=monitor Client

import (
	"context"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/monitor/armmonitor"
)

// Client is the interface for a client to interact with the Azure monitoring api.
type Client interface {
	GetMetrics(ctx context.Context, resourceGroup, provider, metric, aggregationType, interval string, timeStart, timeEnd int64) ([]*armmonitor.Metric, error)
	GetMetricDefinitions(ctx context.Context, resourceGroup, provider string) ([]*armmonitor.MetricDefinition, error)
}

type client struct {
	subscriptionID          string
	metricsClient           *armmonitor.MetricsClient
	metricDefinitionsClient *armmonitor.MetricDefinitionsClient
}

// GetMetrics returns the metrisc for a provider.
func (c *client) GetMetrics(ctx context.Context, resourceGroup, provider, metric, aggregationType, interval string, timeStart, timeEnd int64) ([]*armmonitor.Metric, error) {
	formattedInterval, timespan, top := getMetricsOptions(interval, timeStart, timeEnd)

	res, err := c.metricsClient.List(ctx, "/subscriptions/"+c.subscriptionID+"/resourceGroups/"+resourceGroup+"/providers/"+provider, &armmonitor.MetricsClientListOptions{
		Aggregation: &aggregationType,
		Interval:    &formattedInterval,
		Metricnames: &metric,
		ResultType:  to.Ptr(armmonitor.ResultTypeData),
		Timespan:    &timespan,
		Top:         &top,
	})
	if err != nil {
		return nil, err
	}

	return res.Value, nil
}

func (c *client) GetMetricDefinitions(ctx context.Context, resourceGroup, provider string) ([]*armmonitor.MetricDefinition, error) {
	var metricDefinitions []*armmonitor.MetricDefinition

	pager := c.metricDefinitionsClient.NewListPager("/subscriptions/"+c.subscriptionID+"/resourcegroups/"+resourceGroup+"/providers/"+provider, &armmonitor.MetricDefinitionsClientListOptions{})

	for pager.More() {
		page, err := pager.NextPage(ctx)
		if err != nil {
			return nil, err
		}

		metricDefinitions = append(metricDefinitions, page.Value...)
	}

	return metricDefinitions, nil
}

// New returns a new client to interact with the monitor API.
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) (Client, error) {
	metricsClient, err := armmonitor.NewMetricsClient(subscriptionID, credentials, &arm.ClientOptions{})
	if err != nil {
		return nil, err
	}

	metricDefinitionsClient, err := armmonitor.NewMetricDefinitionsClient(subscriptionID, credentials, &arm.ClientOptions{})
	if err != nil {
		return nil, err
	}

	return &client{
		subscriptionID:          subscriptionID,
		metricsClient:           metricsClient,
		metricDefinitionsClient: metricDefinitionsClient,
	}, nil
}
