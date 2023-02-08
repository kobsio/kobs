package provider

import (
	"github.com/kobsio/kobs/pkg/instrument/log"

	"go.uber.org/zap"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

type Config struct {
	Type       string `env:"TYPE" enum:"incluster,kubeconfig" default:"incluster" help:"The provider which should be used for the Kubernetes cluster. Must be \"incluster\" or \"kubeconfig\"."`
	Kubeconfig struct {
		Path    string `env:"PATH" default:"" help:"The path to the Kubeconfig file, which should be used when the provider is \"kubeconfig\"."`
		Context string `env:"CONTEXT" default:"" help:"The context, which should be used from the Kubeconfig file, when the provider is \"kubeconfig\""`
	} `embed:"" prefix:"kubeconfig." envprefix:"KUBECONFIG_"`
}

func NewRestConfig(config Config) (*rest.Config, error) {
	log.Debug(nil, "Create rest config", zap.String("provider", config.Type))

	switch config.Type {
	case "kubeconfig":
		return clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
			&clientcmd.ClientConfigLoadingRules{ExplicitPath: config.Kubeconfig.Path},
			&clientcmd.ConfigOverrides{
				CurrentContext: config.Kubeconfig.Context,
			},
		).ClientConfig()
	default:
		return rest.InClusterConfig()
	}
}
