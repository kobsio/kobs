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
	GetContainerGroup(ctx context.Context, resourceGroup, containerGroup string) (armcontainerinstance.ContainerGroupsClientGetResponse, error)
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

	pager := c.containerGroupsClient.NewListByResourceGroupPager(resourceGroup, &armcontainerinstance.ContainerGroupsClientListByResourceGroupOptions{})

	for pager.More() {
		page, err := pager.NextPage(ctx)
		if err != nil {
			return nil, err
		}

		containerGroups = append(containerGroups, page.Value...)
	}

	return containerGroups, nil
}

// GetContainerGroup returns a single container group.
func (c *client) GetContainerGroup(ctx context.Context, resourceGroup, containerGroup string) (armcontainerinstance.ContainerGroupsClientGetResponse, error) {
	return c.containerGroupsClient.Get(ctx, resourceGroup, containerGroup, &armcontainerinstance.ContainerGroupsClientGetOptions{})
}

// GetContainerLogs returns the logs for a container.
func (c *client) GetContainerLogs(ctx context.Context, resourceGroup, containerGroup, container string, tail *int32, timestamps *bool) (*string, error) {
	res, err := c.containersClient.ListLogs(ctx, resourceGroup, containerGroup, container, &armcontainerinstance.ContainersClientListLogsOptions{
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
	_, err := c.containerGroupsClient.BeginRestart(ctx, resourceGroup, containerGroup, &armcontainerinstance.ContainerGroupsClientBeginRestartOptions{})
	if err != nil {
		return err
	}

	return nil
}

// New returns a new client to interact with the container instances API.
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) (Client, error) {
	containerGroupsClient, err := armcontainerinstance.NewContainerGroupsClient(subscriptionID, credentials, &arm.ClientOptions{})
	if err != nil {
		return nil, err
	}

	containersClient, err := armcontainerinstance.NewContainersClient(subscriptionID, credentials, &arm.ClientOptions{})
	if err != nil {
		return nil, err
	}

	return &client{
		subscriptionID:        subscriptionID,
		containerGroupsClient: containerGroupsClient,
		containersClient:      containersClient,
	}, nil
}
