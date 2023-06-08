package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"github.com/kobsio/kobs/pkg/plugins/azure/instance/costmanagement"
	"github.com/kobsio/kobs/pkg/plugins/azure/instance/kubernetesservices"
	"github.com/kobsio/kobs/pkg/plugins/azure/instance/monitor"
	"github.com/kobsio/kobs/pkg/plugins/azure/instance/resourcegroups"
	"github.com/kobsio/kobs/pkg/plugins/azure/instance/virtualmachinescalesets"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/mitchellh/mapstructure"
)

// Config is the structure of the configuration for a single GitHub instance.
type Config struct {
	Credentials Credentials `json:"credentials"`
}

type Credentials struct {
	SubscriptionID string `json:"subscriptionID"`
	TenantID       string `json:"tenantID"`
	ClientID       string `json:"clientID"`
	ClientSecret   string `json:"clientSecret"`
}

type Instance interface {
	GetName() string
	ResourceGroupsClient() resourcegroups.Client
	KubernetesServicesClient() kubernetesservices.Client
	CostManagementClient() costmanagement.Client
	VirtualMachineScaleSetsClient() virtualmachinescalesets.Client
	MonitorClient() monitor.Client
}

type instance struct {
	name                          string
	resourceGroupsClient          resourcegroups.Client
	kubernetesServicesClient      kubernetesservices.Client
	costManagementClient          costmanagement.Client
	virtualMachineScaleSetsClient virtualmachinescalesets.Client
	monitorClient                 monitor.Client
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) ResourceGroupsClient() resourcegroups.Client {
	return i.resourceGroupsClient
}

func (i *instance) KubernetesServicesClient() kubernetesservices.Client {
	return i.kubernetesServicesClient
}

func (i *instance) CostManagementClient() costmanagement.Client {
	return i.costManagementClient
}

func (i *instance) VirtualMachineScaleSetsClient() virtualmachinescalesets.Client {
	return i.virtualMachineScaleSetsClient
}

func (i *instance) MonitorClient() monitor.Client {
	return i.monitorClient
}

// New returns a new Azure instance for the given configuration.
func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	credentials, err := azidentity.NewClientSecretCredential(config.Credentials.TenantID, config.Credentials.ClientID, config.Credentials.ClientSecret, nil)
	if err != nil {
		return nil, err
	}

	resourceGroups, err := resourcegroups.New(config.Credentials.SubscriptionID, credentials)
	if err != nil {
		return nil, err
	}

	kubernetesServices, err := kubernetesservices.New(config.Credentials.SubscriptionID, credentials)
	if err != nil {
		return nil, err
	}

	costManagement, err := costmanagement.New(config.Credentials.SubscriptionID, credentials)
	if err != nil {
		return nil, err
	}

	virtualmachinescalesets, err := virtualmachinescalesets.New(config.Credentials.SubscriptionID, credentials)
	if err != nil {
		return nil, err
	}

	monitor, err := monitor.New(config.Credentials.SubscriptionID, credentials)
	if err != nil {
		return nil, err
	}

	return &instance{
		name:                          name,
		resourceGroupsClient:          resourceGroups,
		kubernetesServicesClient:      kubernetesServices,
		costManagementClient:          costManagement,
		virtualMachineScaleSetsClient: virtualmachinescalesets,
		monitorClient:                 monitor,
	}, nil
}
