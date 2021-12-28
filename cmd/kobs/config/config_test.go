package config

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestLoad(t *testing.T) {
	t.Run("load config", func(t *testing.T) {
		config, err := Load("mocks/config_valid.yaml")
		require.NoError(t, err)
		require.NotEmpty(t, config)
	})

	t.Run("load config failed: file does not exists", func(t *testing.T) {
		config, err := Load("mocks/config.yaml")
		require.Error(t, err)
		require.Empty(t, config)
	})

	t.Run("load config failed: invalid config", func(t *testing.T) {
		config, err := Load("mocks/config_invalid.yaml")
		require.Error(t, err)
		require.Empty(t, config)
	})
}
