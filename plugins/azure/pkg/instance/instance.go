package instance

import (
	"os"

	"github.com/Azure/go-autorest/autorest/azure/auth"
	"github.com/kobsio/kobs/plugins/azure/pkg/instance/containerinstances"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "azure"})
)

// Config is the structure of the configuration for a single Azure instance.
type Config struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Description string `json:"description"`
}

// Instance represents a single Azure instance, which can be added via the configuration file.
type Instance struct {
	Name               string
	ContainerInstances *containerinstances.Client
}

// New returns a new Elasticsearch instance for the given configuration.
func New(config Config) (*Instance, error) {
	subscriptionID := os.Getenv("AZURE_SUBSCRIPTION_ID")

	authorizer, err := auth.NewAuthorizerFromEnvironment()
	if err != nil {
		return nil, err
	}

	containerInstances := containerinstances.New(subscriptionID, authorizer)

	return &Instance{
		Name:               config.Name,
		ContainerInstances: containerInstances,
	}, nil
}
