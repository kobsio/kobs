package costmanagement

//go:generate mockgen -source=costmanagement.go -destination=./costmanagement_mock.go -package=costmanagement Client

import (
	"context"
	"fmt"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/costmanagement/armcostmanagement"
)

// Client is the interface for a client to interact with the Azure cost management api.
type Client interface {
	GetActualCosts(ctx context.Context, scope string, timeStart, timeEnd int64) (*armcostmanagement.QueryResult, error)
}

type client struct {
	subscriptionID string
	queryClient    *armcostmanagement.QueryClient
}

// GetActualCost query the actual costs for the configured subscription and given timeframe grouped by resourceGroup
func (c *client) GetActualCosts(ctx context.Context, scope string, timeStart, timeEnd int64) (*armcostmanagement.QueryResult, error) {
	var queryScope string
	var subscriptionScope bool

	if scope == "" {
		queryScope = fmt.Sprintf("subscriptions/%s", c.subscriptionID)
		subscriptionScope = true
	} else {
		queryScope = fmt.Sprintf("subscriptions/%s/resourceGroups/%s", c.subscriptionID, scope)
	}

	res, err := c.queryClient.Usage(ctx, queryScope, buildQueryParams(subscriptionScope, timeStart, timeEnd), &armcostmanagement.QueryClientUsageOptions{})
	if err != nil {
		return nil, err
	}

	return &res.QueryResult, nil
}

// New returns a new client to interact with the cost management API.
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) (Client, error) {
	queryClient, err := armcostmanagement.NewQueryClient(credentials, nil)
	if err != nil {
		return nil, err
	}

	return &client{
		subscriptionID: subscriptionID,
		queryClient:    queryClient,
	}, nil
}
