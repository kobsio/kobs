package config

import (
	"io/ioutil"
	"os"
	"strings"

	"sigs.k8s.io/yaml"
)

// Load the configuration for kobs. Most of the configuration options are available as command-line flag, but we also
// need some more complex configuration options, which can be set via a config file in yaml format. The configuration
// file can contain environment variables in the following format: "${NAME_OF_THE_ENVIRONMENT_VARIABLE}".
func Load[T any](file string, config T) (T, error) {
	configContent, err := ioutil.ReadFile(file)
	if err != nil {
		return config, err
	}

	configContent = []byte(os.ExpandEnv(string(configContent)))
	if err := yaml.Unmarshal(configContent, &config); err != nil {
		return config, err
	}

	return config, nil
}

// expandEnv replaces all environment variables in the provided string. The environment variables can be in the form
// `${var}` or `$var`. If the string should contain a `$` it can be escaped via `$$`.
func expandEnv(s string) string {
	os.Setenv("CRANE_DOLLAR", "$")
	return os.ExpandEnv(strings.Replace(s, "$$", "${CRANE_DOLLAR}", -1))
}
