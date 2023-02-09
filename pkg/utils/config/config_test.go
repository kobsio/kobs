package config

import (
	"os"
	"testing"

	"github.com/kobsio/kobs/pkg/hub/clusters"

	"github.com/stretchr/testify/require"
)

type TestConfig struct {
	Clusters clusters.Config `json:"clusters"`
}

func TestLoad(t *testing.T) {
	var testConfig TestConfig

	t.Run("should load config", func(t *testing.T) {
		config, err := Load("mocks/config-valid.yaml", testConfig)
		require.NoError(t, err)
		require.NotEmpty(t, config)
	})

	t.Run("should fail because file doesn't exists", func(t *testing.T) {
		config, err := Load("mocks/config.yaml", testConfig)
		require.Error(t, err)
		require.Empty(t, config)
	})

	t.Run("should fail because config file is invalid", func(t *testing.T) {
		config, err := Load("mocks/config-invalid.yaml", testConfig)
		require.Error(t, err)
		require.Empty(t, config)
	})
}

func TestExpandEnv(t *testing.T) {
	t.Run("should replace environment variable", func(t *testing.T) {
		os.Setenv("TEST_EXPAND_ENV", "test")
		require.Equal(t, "test", expandEnv("$TEST_EXPAND_ENV"))
	})

	t.Run("should not replace escaped dollar sign", func(t *testing.T) {
		require.Equal(t, "$2y$10$5HNcrzTHq/zPbW/g8UGK7.jSGDNfdwQK.L5bEjFYlH50.j4pUuSRi", expandEnv("$$2y$$10$$5HNcrzTHq/zPbW/g8UGK7.jSGDNfdwQK.L5bEjFYlH50.j4pUuSRi"))
	})
}
