package debug

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestServer(t *testing.T) {
	debugServer := New(Config{Address: ":8090"})
	require.NotNil(t, debugServer)

	require.NotPanics(t, func() {
		go debugServer.Start()
	})

	require.NotPanics(t, func() {
		debugServer.Stop()
	})
}
