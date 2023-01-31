package log

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSetup(t *testing.T) {
	require.NotPanics(t, func() {
		Setup(Config{Level: "debug", Format: "console"})
	})

	require.Panics(t, func() {
		Setup(Config{Level: "debug", Format: "logfmt"})
	})
}
