package config

import (
	"io/ioutil"
	"os"

	"sigs.k8s.io/yaml"
)

// Load the configuration for kobs. Most of the configuration options are available as command-line flag, but we also
// need some more complex configuration options, which can be set via a config file in yaml format. The configuration
// file can contain environment variables in the following format: "${NAME_OF_THE_ENVIRONMENT_VARIABLE}".
func Load[T any](file string) (T, error) {
	var cfg T

	configContent, err := ioutil.ReadFile(file)
	if err != nil {
		return cfg, err
	}

	configContent = []byte(os.ExpandEnv(string(configContent)))
	if err := yaml.Unmarshal(configContent, cfg); err != nil {
		return cfg, err
	}

	return cfg, nil
}
