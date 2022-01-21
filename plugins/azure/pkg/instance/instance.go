package instance

import (
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/containerinstances"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/costmanagement"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/kubernetesservices"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/loadbalancers"
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
	CheckPermissions(pluginName string, user *authContext.User, resource, resourceGroup, verb string) error
	ContainerInstancesClient() containerinstances.Client
	CostManagementClient() costmanagement.Client
	GetName() string
	KubernetesServicesClient() kubernetesservices.Client
	LoadBalancersClient() loadbalancers.Client
	MonitorClient() monitor.Client
	ResourceGroupsClient() resourcegroups.Client
	VirtualMachineScaleSetsClient() virtualmachinescalesets.Client
}

type instance struct {
	Name                          string
	containerInstancesClient      containerinstances.Client
	costManagementClient          costmanagement.Client
	kubernetesServicesClient      kubernetesservices.Client
	loadBalancersClient           loadbalancers.Client
	monitorClient                 monitor.Client
	permissionsEnabled            bool
	resourceGroupsClient          resourcegroups.Client
	virtualMachineScaleSetsClient virtualmachinescalesets.Client
}

func (i *instance) LoadBalancersClient() loadbalancers.Client {
	return i.loadBalancersClient
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

	containerInstances := containerinstances.New(config.Credentials.SubscriptionID, credentials)
	costManagement := costmanagement.New(config.Credentials.SubscriptionID, authorizer)
	kubernetesServices := kubernetesservices.New(config.Credentials.SubscriptionID, credentials)
	loadBalancers := loadbalancers.New(config.Credentials.SubscriptionID, authorizer)
	monitor := monitor.New(config.Credentials.SubscriptionID, credentials)
	resourceGroups := resourcegroups.New(config.Credentials.SubscriptionID, credentials)
	virtualmachinescalesets := virtualmachinescalesets.New(config.Credentials.SubscriptionID, credentials)

	return &instance{
		Name:                          config.Name,
		containerInstancesClient:      containerInstances,
		costManagementClient:          costManagement,
		kubernetesServicesClient:      kubernetesServices,
		loadBalancersClient:           loadBalancers,
		monitorClient:                 monitor,
		permissionsEnabled:            config.PermissionsEnabled,
		resourceGroupsClient:          resourceGroups,
		virtualMachineScaleSetsClient: virtualmachinescalesets,
	}, nil
}
