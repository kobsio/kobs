package instance

import (
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance/containerinstances"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance/costmanagement"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance/kubernetesservices"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance/monitor"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance/resourcegroups"
	"github.com/kobsio/kobs/plugins/plugin-azure/pkg/instance/virtualmachinescalesets"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/go-autorest/autorest/azure/auth"
	"github.com/mitchellh/mapstructure"
)

// Config is the structure of the configuration for a single Azure instance.
type Config struct {
	Credentials        Credentials `json:"credentials"`
	PermissionsEnabled bool        `json:"permissionsEnabled"`
}

// Credentials is the structure of the required information to authenticate against the Azure API.
type Credentials struct {
	SubscriptionID string `json:"subscriptionID"`
	TenantID       string `json:"tenantID"`
	ClientID       string `json:"clientID"`
	ClientSecret   string `json:"clientSecret"`
}

// Instance is the interface which must be implemented by an Azure instance.
type Instance interface {
	GetName() string
	ResourceGroupsClient() resourcegroups.Client
	KubernetesServicesClient() kubernetesservices.Client
	ContainerInstancesClient() containerinstances.Client
	CostManagementClient() costmanagement.Client
	VirtualMachineScaleSetsClient() virtualmachinescalesets.Client
	MonitorClient() monitor.Client
	CheckPermissions(pluginName string, user *authContext.User, resource, resourceGroup, verb string) error
}

type instance struct {
	Name                          string
	permissionsEnabled            bool
	resourceGroupsClient          resourcegroups.Client
	kubernetesServicesClient      kubernetesservices.Client
	containerInstancesClient      containerinstances.Client
	costManagementClient          costmanagement.Client
	virtualMachineScaleSetsClient virtualmachinescalesets.Client
	monitorClient                 monitor.Client
}

func (i *instance) GetName() string {
	return i.Name
}

func (i *instance) ResourceGroupsClient() resourcegroups.Client {
	return i.resourceGroupsClient
}

func (i *instance) KubernetesServicesClient() kubernetesservices.Client {
	return i.kubernetesServicesClient
}

func (i *instance) ContainerInstancesClient() containerinstances.Client {
	return i.containerInstancesClient
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

	authorizerClientCredentialsConfig := auth.NewClientCredentialsConfig(config.Credentials.ClientID, config.Credentials.ClientSecret, config.Credentials.TenantID)
	authorizer, err := authorizerClientCredentialsConfig.Authorizer()
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

	containerInstances, err := containerinstances.New(config.Credentials.SubscriptionID, credentials)
	if err != nil {
		return nil, err
	}

	costManagement, err := costmanagement.New(config.Credentials.SubscriptionID, authorizer)
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
		Name:                          name,
		permissionsEnabled:            config.PermissionsEnabled,
		resourceGroupsClient:          resourceGroups,
		kubernetesServicesClient:      kubernetesServices,
		containerInstancesClient:      containerInstances,
		costManagementClient:          costManagement,
		virtualMachineScaleSetsClient: virtualmachinescalesets,
		monitorClient:                 monitor,
	}, nil
}
