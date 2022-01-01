package containerinstances

import (
	"context"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/containerinstance/armcontainerinstance"
)

// Client is the interface for a client to interact with the Azure container instances.
type Client interface {
	ListContainerGroups(ctx context.Context, resourceGroup string) ([]*armcontainerinstance.ContainerGroup, error)
	GetContainerGroup(ctx context.Context, resourceGroup, containerGroup string) (armcontainerinstance.ContainerGroupsGetResponse, error)
	GetContainerLogs(ctx context.Context, resourceGroup, containerGroup, container string, tail *int32, timestamps *bool) (*string, error)
	RestartContainerGroup(ctx context.Context, resourceGroup, containerGroup string) error
}

type client struct {
	subscriptionID        string
	containerGroupsClient *armcontainerinstance.ContainerGroupsClient
	containersClient      *armcontainerinstance.ContainersClient
}

// ListContainerGroups list all container groups in a subscription.
//
// We can not use the containerGroupsClient for this request, because the result is missing some important fields like
// the ids of the returned resources.
func (c *client) ListContainerGroups(ctx context.Context, resourceGroup string) ([]*armcontainerinstance.ContainerGroup, error) {
	var containerGroups []*armcontainerinstance.ContainerGroup

	pager := c.containerGroupsClient.ListByResourceGroup(resourceGroup, &armcontainerinstance.ContainerGroupsListByResourceGroupOptions{})
	if pager.Err() != nil {
		return nil, pager.Err()
	}

	for pager.NextPage(ctx) {
		containerGroups = append(containerGroups, pager.PageResponse().Value...)
	}

	return containerGroups, nil
}

// GetContainerGroup returns a single container group.
func (c *client) GetContainerGroup(ctx context.Context, resourceGroup, containerGroup string) (armcontainerinstance.ContainerGroupsGetResponse, error) {
	return c.containerGroupsClient.Get(ctx, resourceGroup, containerGroup, &armcontainerinstance.ContainerGroupsGetOptions{})
}

// GetContainerLogs returns the logs for a container.
func (c *client) GetContainerLogs(ctx context.Context, resourceGroup, containerGroup, container string, tail *int32, timestamps *bool) (*string, error) {
	res, err := c.containersClient.ListLogs(ctx, resourceGroup, containerGroup, container, &armcontainerinstance.ContainersListLogsOptions{
		Tail:       tail,
		Timestamps: timestamps,
	})
	if err != nil {
		return nil, err
	}

	return res.Content, nil
}

// RestartContainerGroup restarts a container group.
func (c *client) RestartContainerGroup(ctx context.Context, resourceGroup, containerGroup string) error {
	_, err := c.containerGroupsClient.BeginRestart(ctx, resourceGroup, containerGroup, &armcontainerinstance.ContainerGroupsBeginRestartOptions{})
	if err != nil {
		return err
	}

	return nil
}

// New returns a new client to interact with the container instances API.
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) Client {
	containerGroupsClient := armcontainerinstance.NewContainerGroupsClient(subscriptionID, credentials, &arm.ClientOptions{})
	containersClient := armcontainerinstance.NewContainersClient(subscriptionID, credentials, &arm.ClientOptions{})

	return &client{
		subscriptionID:        subscriptionID,
		containerGroupsClient: containerGroupsClient,
		containersClient:      containersClient,
	}
}
