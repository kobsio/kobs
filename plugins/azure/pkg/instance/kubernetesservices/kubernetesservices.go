package kubernetesservices

import (
	"context"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/containerservice/armcontainerservice"
)

// Client is the interface for a client to interact with the Azure Kubernetes services api.
type Client interface {
	ListManagedClusters(ctx context.Context, resourceGroup string) ([]*armcontainerservice.ManagedCluster, error)
	GetManagedCluster(ctx context.Context, resourceGroup, managedCluster string) (armcontainerservice.ManagedClustersGetResponse, error)
	ListNodePools(ctx context.Context, resourceGroup, managedCluster string) ([]*armcontainerservice.AgentPool, error)
}

type client struct {
	subscriptionID        string
	managedClustersClient *armcontainerservice.ManagedClustersClient
	agentPoolsClient      *armcontainerservice.AgentPoolsClient
}

// ListManagedClusters returns all managed clusters from the given resource group.
func (c *client) ListManagedClusters(ctx context.Context, resourceGroup string) ([]*armcontainerservice.ManagedCluster, error) {
	var managedClusters []*armcontainerservice.ManagedCluster

	pager := c.managedClustersClient.ListByResourceGroup(resourceGroup, &armcontainerservice.ManagedClustersListByResourceGroupOptions{})
	if pager.Err() != nil {
		return nil, pager.Err()
	}

	for pager.NextPage(ctx) {
		managedClusters = append(managedClusters, pager.PageResponse().Value...)
	}

	return managedClusters, nil
}

// GetManagedCluster returns a single managed cluster.
func (c *client) GetManagedCluster(ctx context.Context, resourceGroup, managedCluster string) (armcontainerservice.ManagedClustersGetResponse, error) {
	return c.managedClustersClient.Get(ctx, resourceGroup, managedCluster, &armcontainerservice.ManagedClustersGetOptions{})
}

// ListNodePools list all node pools for a manged cluster.
func (c *client) ListNodePools(ctx context.Context, resourceGroup, managedCluster string) ([]*armcontainerservice.AgentPool, error) {
	var nodePools []*armcontainerservice.AgentPool

	pager := c.agentPoolsClient.List(resourceGroup, managedCluster, &armcontainerservice.AgentPoolsListOptions{})
	if pager.Err() != nil {
		return nil, pager.Err()
	}

	for pager.NextPage(ctx) {
		nodePools = append(nodePools, pager.PageResponse().Value...)
	}

	return nodePools, nil
}

// New returns a new client to interact with the kubernetes services API.
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) Client {
	managedClustersClient := armcontainerservice.NewManagedClustersClient(subscriptionID, credentials, &arm.ClientOptions{})
	agentPoolsClient := armcontainerservice.NewAgentPoolsClient(subscriptionID, credentials, &arm.ClientOptions{})

	return &client{
		subscriptionID:        subscriptionID,
		managedClustersClient: managedClustersClient,
		agentPoolsClient:      agentPoolsClient,
	}
}