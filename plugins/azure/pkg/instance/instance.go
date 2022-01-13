package instance

import (
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/containerinstances"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/costmanagement"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/kubernetesservices"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/monitor"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/resourcegroups"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/virtualmachinescalesets"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/go-autorest/autorest/azure/auth"
)

// Config is the structure of the configuration for a single Azure instance.
type Config struct {
	Name               string      `json:"name"`
	DisplayName        string      `json:"displayName"`
	Description        string      `json:"description"`
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
func New(config Config) (Instance, error) {
	credentials, err := azidentity.NewClientSecretCredential(config.Credentials.TenantID, config.Credentials.ClientID, config.Credentials.ClientSecret, nil)
	if err != nil {
		return nil, err
	}

	authorizerClientCredentialsConfig := auth.NewClientCredentialsConfig(config.Credentials.ClientID, config.Credentials.ClientSecret, config.Credentials.TenantID)
	authorizer, err := authorizerClientCredentialsConfig.Authorizer()
	if err != nil {
		return nil, err
	}

	resourceGroups := resourcegroups.New(config.Credentials.SubscriptionID, credentials)
	kubernetesServices := kubernetesservices.New(config.Credentials.SubscriptionID, credentials)
	containerInstances := containerinstances.New(config.Credentials.SubscriptionID, credentials)
	costManagement := costmanagement.New(config.Credentials.SubscriptionID, authorizer)
	virtualmachinescalesets := virtualmachinescalesets.New(config.Credentials.SubscriptionID, credentials)
	monitor := monitor.New(config.Credentials.SubscriptionID, credentials)

	return &instance{
		Name:                          config.Name,
		permissionsEnabled:            config.PermissionsEnabled,
		resourceGroupsClient:          resourceGroups,
		kubernetesServicesClient:      kubernetesServices,
		containerInstancesClient:      containerInstances,
		costManagementClient:          costManagement,
		virtualMachineScaleSetsClient: virtualmachinescalesets,
		monitorClient:                 monitor,
	}, nil
}
