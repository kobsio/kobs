package resourcegroups

import (
	"context"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/resources/armresources"
)

// Client is the interface for a client to interact with the Azure resource groups api.
type Client interface {
	ListResourceGroups(ctx context.Context) ([]*armresources.ResourceGroup, error)
}

type client struct {
	resourceGroupsClient *armresources.ResourceGroupsClient
}

// ListResourceGroups lists all resource groups for the configured subscription.
func (c *client) ListResourceGroups(ctx context.Context) ([]*armresources.ResourceGroup, error) {
	var resourceGroups []*armresources.ResourceGroup

	pager := c.resourceGroupsClient.NewListPager(&armresources.ResourceGroupsClientListOptions{Top: nil})

	for pager.More() {
		page, err := pager.NextPage(ctx)
		if err != nil {
			return nil, err
		}

		resourceGroups = append(resourceGroups, page.Value...)
	}

	return resourceGroups, nil
}

// New returns a new client to interact with the container instances API.
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) (Client, error) {
	resourceGroupsClient, err := armresources.NewResourceGroupsClient(subscriptionID, credentials, &arm.ClientOptions{})
	if err != nil {
		return nil, err
	}

	return &client{
		resourceGroupsClient: resourceGroupsClient,
	}, nil
}
