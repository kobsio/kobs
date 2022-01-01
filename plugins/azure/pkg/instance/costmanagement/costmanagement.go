package costmanagement

import (
	"context"
	"fmt"

	"github.com/Azure/azure-sdk-for-go/services/costmanagement/mgmt/2019-11-01/costmanagement"
	"github.com/Azure/go-autorest/autorest"
)

// Client is the interface for a client to interact with the Azure cost management api.
type Client interface {
	GetActualCost(ctx context.Context, scope string, timeStart, timeEnd int64) (costmanagement.QueryResult, error)
}

type client struct {
	subscriptionID string
	queryClient    *costmanagement.QueryClient
}

// GetActualCost query the actual costs for the configured subscription and given timeframe grouped by resourceGroup
func (c *client) GetActualCost(ctx context.Context, scope string, timeStart, timeEnd int64) (costmanagement.QueryResult, error) {
	var queryScope string
	var subscriptionScope bool

	if "All" == scope {
		queryScope = fmt.Sprintf("subscriptions/%s", c.subscriptionID)
		subscriptionScope = true
	} else {
		queryScope = fmt.Sprintf("subscriptions/%s/resourceGroups/%s", c.subscriptionID, scope)
	}

	return c.queryClient.Usage(ctx, queryScope, buildQueryParams(subscriptionScope, timeStart, timeEnd))
}

// New returns a new client to interact with the cost management API.
func New(subscriptionID string, authorizer autorest.Authorizer) Client {
	queryClient := costmanagement.NewQueryClient(subscriptionID)
	queryClient.Authorizer = authorizer

	return &client{
		subscriptionID: subscriptionID,
		queryClient:    &queryClient,
	}
}
