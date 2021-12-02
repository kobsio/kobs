package costmanagement

import (
	"context"
	"fmt"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/services/costmanagement/mgmt/2019-11-01/costmanagement"
	"github.com/Azure/go-autorest/autorest"
	"github.com/Azure/go-autorest/autorest/date"
)

// Client is the client to interact with the container instance API.
type Client struct {
	subscriptionID string
	queryClient    *costmanagement.QueryClient
}

// GetActualCost query the actual costs for the configured subscription and given timeframe grouped by resourceGroup
func (c *Client) GetActualCost(ctx context.Context, timeframe int) (costmanagement.QueryResult, error) {
	scope := fmt.Sprintf("subscriptions/%s", c.subscriptionID)
	res, err := c.queryClient.Usage(ctx, scope, buildQueryParams(timeframe))
	if err != nil {
		return costmanagement.QueryResult{}, err
	}

	return res, nil
}

func buildQueryParams(timeframe int) costmanagement.QueryDefinition {
	agg := make(map[string]*costmanagement.QueryAggregation)
	tc := costmanagement.QueryAggregation{
		Name:     to.StringPtr("Cost"),
		Function: costmanagement.FunctionTypeSum,
	}
	agg["totalCost"] = &tc

	grouping := []costmanagement.QueryGrouping{
		{
			Type: costmanagement.QueryColumnTypeDimension,
			Name: to.StringPtr("resourceGroup"),
		},
	}

	ds := costmanagement.QueryDataset{
		Granularity:   "None",
		Configuration: nil,
		Aggregation:   agg,
		Grouping:      &grouping,
		Filter:        nil,
	}

	now := date.Time{Time: time.Now()}
	from := date.Time{Time: now.AddDate(0, 0, timeframe*-1)}
	tp := costmanagement.QueryTimePeriod{
		From: &from,
		To:   &now,
	}

	return costmanagement.QueryDefinition{
		Type:       costmanagement.ExportTypeActualCost,
		Timeframe:  costmanagement.TimeframeTypeCustom,
		TimePeriod: &tp,
		Dataset:    &ds,
	}
}

// New returns a new client to interact with the cost management API.
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) *Client {
	client := costmanagement.NewQueryClient(subscriptionID)
	client.Authorizer = authorizer

	return &Client{
		subscriptionID: subscriptionID,
		queryClient:    &client,
	}
}
