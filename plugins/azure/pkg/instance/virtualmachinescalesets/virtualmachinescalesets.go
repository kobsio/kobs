package virtualmachinescalesets

import (
	"context"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/compute/armcompute"
)

// Client is the client to interact with the virtual machine scale set API.
type Client struct {
	subscriptionID string
	vmssClient     *armcompute.VirtualMachineScaleSetsClient
	vmssVMsClient  *armcompute.VirtualMachineScaleSetVMsClient
}

// ListVirtualMachineScaleSets returns all virtual machine scale sets for the given resource group.
func (c *Client) ListVirtualMachineScaleSets(ctx context.Context, resourceGroup string) ([]*armcompute.VirtualMachineScaleSet, error) {
	var vmsss []*armcompute.VirtualMachineScaleSet

	pager := c.vmssClient.List(resourceGroup, &armcompute.VirtualMachineScaleSetsListOptions{})
	if pager.Err() != nil {
		return nil, pager.Err()
	}

	for pager.NextPage(ctx) {
		vmsss = append(vmsss, pager.PageResponse().Value...)
	}

	return vmsss, nil
}

// GetVirtualMachineScaleSet returns a virtual machine scale set for the given resource group and virtual machine scale
// set name.
func (c *Client) GetVirtualMachineScaleSet(ctx context.Context, resourceGroup, virtualMachineScaleSet string) (armcompute.VirtualMachineScaleSetsGetResponse, error) {
	return c.vmssClient.Get(ctx, resourceGroup, virtualMachineScaleSet, &armcompute.VirtualMachineScaleSetsGetOptions{})
}

// ListVirtualMachines returns all virtual machine scale sets for the given resource group and virtual machine scale
// set.
func (c *Client) ListVirtualMachines(ctx context.Context, resourceGroup, virtualMachineScaleSet string) ([]*armcompute.VirtualMachineScaleSetVM, error) {
	var vmsss []*armcompute.VirtualMachineScaleSetVM

	pager := c.vmssVMsClient.List(resourceGroup, virtualMachineScaleSet, &armcompute.VirtualMachineScaleSetVMsListOptions{})
	if pager.Err() != nil {
		return nil, pager.Err()
	}

	for pager.NextPage(ctx) {
		vmsss = append(vmsss, pager.PageResponse().Value...)
	}

	return vmsss, nil
}

// New returns a new client to interact with the kubernetes services API.
func New(subscriptionID string, credentials *azidentity.ClientSecretCredential) *Client {
	vmssClient := armcompute.NewVirtualMachineScaleSetsClient(subscriptionID, credentials, &arm.ClientOptions{})
	vmssVMsClient := armcompute.NewVirtualMachineScaleSetVMsClient(subscriptionID, credentials, &arm.ClientOptions{})

	return &Client{
		subscriptionID: subscriptionID,
		vmssClient:     vmssClient,
		vmssVMsClient:  vmssVMsClient,
	}
}
