package virtualmachinescalesets

import (
	"context"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/compute/armcompute"
)

// Client is the interface for a client to interact with the Azure virtual machien scale sets api.
type Client interface {
	ListVirtualMachineScaleSets(ctx context.Context, resourceGroup string) ([]*armcompute.VirtualMachineScaleSet, error)
	GetVirtualMachineScaleSet(ctx context.Context, resourceGroup, virtualMachineScaleSet string) (armcompute.VirtualMachineScaleSetsClientGetResponse, error)
	ListVirtualMachines(ctx context.Context, resourceGroup, virtualMachineScaleSet string) ([]*armcompute.VirtualMachineScaleSetVM, error)
}

type client struct {
	subscriptionID string
	vmssClient     *armcompute.VirtualMachineScaleSetsClient
	vmssVMsClient  *armcompute.VirtualMachineScaleSetVMsClient
}

// ListVirtualMachineScaleSets returns all virtual machine scale sets for the given resource group.
func (c *client) ListVirtualMachineScaleSets(ctx context.Context, resourceGroup string) ([]*armcompute.VirtualMachineScaleSet, error) {
	var vmsss []*armcompute.VirtualMachineScaleSet

	pager := c.vmssClient.NewListPager(resourceGroup, &armcompute.VirtualMachineScaleSetsClientListOptions{})

	for pager.More() {
		page, err := pager.NextPage(ctx)
		if err != nil {
			return nil, err
		}

		vmsss = append(vmsss, page.Value...)
	}

	return vmsss, nil
}

// GetVirtualMachineScaleSet returns a virtual machine scale set for the given resource group and virtual machine scale
// set name.
func (c *client) GetVirtualMachineScaleSet(ctx context.Context, resourceGroup, virtualMachineScaleSet string) (armcompute.VirtualMachineScaleSetsClientGetResponse, error) {
	return c.vmssClient.Get(ctx, resourceGroup, virtualMachineScaleSet, &armcompute.VirtualMachineScaleSetsClientGetOptions{})
}

// ListVirtualMachines returns all virtual machine scale sets for the given resource group and virtual machine scale
// set.
func (c *client) ListVirtualMachines(ctx context.Context, resourceGroup, virtualMachineScaleSet string) ([]*armcompute.VirtualMachineScaleSetVM, error) {
	var vmsss []*armcompute.VirtualMachineScaleSetVM

	pager := c.vmssVMsClient.NewListPager(resourceGroup, virtualMachineScaleSet, &armcompute.VirtualMachineScaleSetVMsClientListOptions{})

	for pager.More() {
		page, err := pager.NextPage(ctx)
		if err != nil {
			return nil, err
		}

		vmsss = append(vmsss, page.Value...)
	}

	return vmsss, nil
}

// New returns a new client to interact with the kubernetes services API.
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) (Client, error) {
	vmssClient, err := armcompute.NewVirtualMachineScaleSetsClient(subscriptionID, credentials, &arm.ClientOptions{})
	if err != nil {
		return nil, err
	}

	vmssVMsClient, err := armcompute.NewVirtualMachineScaleSetVMsClient(subscriptionID, credentials, &arm.ClientOptions{})
	if err != nil {
		return nil, err
	}

	return &client{
		subscriptionID: subscriptionID,
		vmssClient:     vmssClient,
		vmssVMsClient:  vmssVMsClient,
	}, nil
}
