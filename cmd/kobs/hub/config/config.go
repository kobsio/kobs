package config

import (
	"io/ioutil"
	"os"

	"github.com/kobsio/kobs/pkg/hub/api"
	"github.com/kobsio/kobs/pkg/hub/auth"
	"github.com/kobsio/kobs/pkg/hub/satellites"

	"sigs.k8s.io/yaml"
)

// Config is the complete configuration for kobs.
type Config struct {
	Satellites satellites.Config `json:"satellites"`
	Auth       auth.Config       `json:"auth"`
	API        api.Config        `json:"api"`
}

// Load the configuration for kobs. Most of the configuration options are available as command-line flag, but we also
// need some more complex configuration options, which can be set via a config file in yaml format. The configuration
// file can contain environment variables in the following format: "${NAME_OF_THE_ENVIRONMENT_VARIABLE}".
func Load(file string) (*Config, error) {
	configContent, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}

	// For the hub we have to unmarshal the configuration file twice. The first time we do not replace the file content
	// with environment variables and the seconde time we replace the environment variables. This is required, because
	// the hashed user passwords will not be usabe after replacing.
	cfgNotReplaced := &Config{}
	if err := yaml.Unmarshal(configContent, cfgNotReplaced); err != nil {
		return nil, err
	}

	configContent = []byte(os.ExpandEnv(string(configContent)))
	cfg := &Config{}
	if err := yaml.Unmarshal(configContent, cfg); err != nil {
		return nil, err
	}

	cfg.Auth.Users = cfgNotReplaced.Auth.Users

	return cfg, nil
}
