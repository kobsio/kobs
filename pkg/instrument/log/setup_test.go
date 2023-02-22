package log

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSetup(t *testing.T) {
	t.Run("should succeed", func(t *testing.T) {
		logger, err := Setup(Config{Level: "debug", Format: "console"})
		require.NoError(t, err)
		require.NotNil(t, logger)
	})

	t.Run("should fail", func(t *testing.T) {
		logger, err := Setup(Config{Level: "debug", Format: "logfmt"})
		require.Error(t, err)
		require.Nil(t, logger)
	})
}
