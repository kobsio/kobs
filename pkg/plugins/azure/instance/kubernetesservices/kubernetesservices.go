package kubernetesservices

//go:generate mockgen -source=kubernetesservices.go -destination=./kubernetesservices_mock.go -package=kubernetesservices Client

import (
	"context"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/containerservice/armcontainerservice"
)

// Client is the interface for a client to interact with the Azure Kubernetes services api.
type Client interface {
	ListManagedClusters(ctx context.Context, resourceGroup string) ([]string, error)
}

type client struct {
	subscriptionID        string
	managedClustersClient *armcontainerservice.ManagedClustersClient
}

// ListManagedClusters returns all managed clusters from the given resource group.
func (c *client) ListManagedClusters(ctx context.Context, resourceGroup string) ([]string, error) {
	var managedClusters []string

	pager := c.managedClustersClient.NewListByResourceGroupPager(resourceGroup, &armcontainerservice.ManagedClustersClientListByResourceGroupOptions{})

	for pager.More() {
		page, err := pager.NextPage(ctx)
		if err != nil {
			return nil, err
		}

		for _, managedCluster := range page.Value {
			managedClusters = append(managedClusters, *managedCluster.Name)
		}
	}

	return managedClusters, nil
}

// New returns a new client to interact with the kubernetes services API.
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) (Client, error) {
	managedClustersClient, err := armcontainerservice.NewManagedClustersClient(subscriptionID, credentials, &arm.ClientOptions{})
	if err != nil {
		return nil, err
	}

	return &client{
		subscriptionID:        subscriptionID,
		managedClustersClient: managedClustersClient,
	}, nil
}
