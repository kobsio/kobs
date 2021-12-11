package instance

import (
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/containerinstances"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/costmanagement"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/kubernetesservices"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/monitor"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/resourcegroups"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/virtualmachinescalesets"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/go-autorest/autorest/azure/auth"
	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "azure"})
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

// Instance represents a single Azure instance, which can be added via the configuration file.
type Instance struct {
	Name                    string
	PermissionsEnabled      bool
	ResourceGroups          *resourcegroups.Client
	KubernetesServices      *kubernetesservices.Client
	ContainerInstances      *containerinstances.Client
	CostManagement          *costmanagement.Client
	VirtualMachineScaleSets *virtualmachinescalesets.Client
	Monitor                 *monitor.Client
}

// New returns a new Elasticsearch instance for the given configuration.
func New(config Config) (*Instance, error) {
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

	return &Instance{
		Name:                    config.Name,
		PermissionsEnabled:      config.PermissionsEnabled,
		ResourceGroups:          resourceGroups,
		KubernetesServices:      kubernetesServices,
		ContainerInstances:      containerInstances,
		CostManagement:          costManagement,
		VirtualMachineScaleSets: virtualmachinescalesets,
		Monitor:                 monitor,
	}, nil
}
