package log

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSetup(t *testing.T) {
	require.NotPanics(t, func() {
		Setup("debug", "console")
	})

	require.Panics(t, func() {
		Setup("debug", "logfmt")
	})
}
