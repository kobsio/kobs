package instance

import (
	"os"

	"github.com/kobsio/kobs/plugins/azure/pkg/instance/containerinstances"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/resourcegroups"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/go-autorest/autorest/azure/auth"
	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "azure"})
)

// Config is the structure of the configuration for a single Azure instance.
type Config struct {
	Name               string `json:"name"`
	DisplayName        string `json:"displayName"`
	Description        string `json:"description"`
	PermissionsEnabled bool   `json:"permissionsEnabled"`
}

// Instance represents a single Azure instance, which can be added via the configuration file.
type Instance struct {
	Name               string
	PermissionsEnabled bool
	ResourceGroups     *resourcegroups.Client
	ContainerInstances *containerinstances.Client
}

// New returns a new Elasticsearch instance for the given configuration.
func New(config Config) (*Instance, error) {
	subscriptionID := os.Getenv("AZURE_SUBSCRIPTION_ID")

	credentials, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		return nil, err
	}

	authorizer, err := auth.NewAuthorizerFromEnvironment()
	if err != nil {
		return nil, err
	}

	containerInstances := containerinstances.New(subscriptionID, authorizer)
	resourceGroups := resourcegroups.New(subscriptionID, credentials)

	return &Instance{
		Name:               config.Name,
		PermissionsEnabled: config.PermissionsEnabled,
		ResourceGroups:     resourceGroups,
		ContainerInstances: containerInstances,
	}, nil
}
