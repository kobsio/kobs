package resourcegroups

import (
	"context"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/resources/armresources"
)

// Client is the client to interact with the container instance API.
type Client struct {
	resourceGroupsClient *armresources.ResourceGroupsClient
}

// ListResourceGroups lists all resource groups for the configured subscription.
func (c *Client) ListResourceGroups(ctx context.Context) ([]*armresources.ResourceGroup, error) {
	pager := c.resourceGroupsClient.List(&armresources.ResourceGroupsListOptions{Top: nil})

	var resourceGroups []*armresources.ResourceGroup
	for pager.NextPage(ctx) {
		resp := pager.PageResponse()
		if resp.ResourceGroupListResult.Value != nil {
			resourceGroups = append(resourceGroups, resp.ResourceGroupListResult.Value...)
		}
	}

	return resourceGroups, pager.Err()
}

// New returns a new client to interact with the container instances API.
func New(subscriptionID string, credentials *azidentity.DefaultAzureCredential) *Client {
	resourceGroupsClient := armresources.NewResourceGroupsClient(subscriptionID, credentials, &arm.ClientOptions{})

	return &Client{
		resourceGroupsClient: resourceGroupsClient,
	}
}
