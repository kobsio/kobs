package metrics

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestServer(t *testing.T) {
	metricsServer := New(Config{Address: ":8090"})
	require.NotNil(t, metricsServer)

	require.NotPanics(t, func() {
		go metricsServer.Start()
	})

	require.NotPanics(t, func() {
		metricsServer.Stop()
	})
}
