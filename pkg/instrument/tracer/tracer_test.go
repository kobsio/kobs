package tracer

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestShutdown(t *testing.T) {
	client, err := Setup(Config{Enabled: true, Service: "kobs", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
	require.NotNil(t, client)
	require.NoError(t, err)
	require.NotPanics(t, client.Shutdown)
}

func TestSetup(t *testing.T) {
	t.Run("should return no error if tracing is disabled", func(t *testing.T) {
		client, err := Setup(Config{Enabled: false, Service: "", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
		require.Nil(t, client)
		require.NoError(t, err)
	})

	t.Run("should fail when service name is missing", func(t *testing.T) {
		client, err := Setup(Config{Enabled: true, Service: "", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
		require.Nil(t, client)
		require.Error(t, err)
	})

	t.Run("should succeeded", func(t *testing.T) {
		client, err := Setup(Config{Enabled: true, Service: "kobs", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
		require.NotNil(t, client)
		require.NoError(t, err)
	})
}

func TestNewProvider(t *testing.T) {
	t.Run("should fail when no service name is provided", func(t *testing.T) {
		tp, err := newProvider(Config{Service: "", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
		require.Error(t, err)
		require.Nil(t, tp)
	})

	t.Run("should fail when no address is provided", func(t *testing.T) {
		tp, err := newProvider(Config{Service: "kobs", Provider: "jaeger", Address: ""})
		require.Error(t, err)
		require.Nil(t, tp)
	})

	t.Run("should fail to setup zipkin provider for invalid address", func(t *testing.T) {
		tp, err := newProvider(Config{Service: "kobs", Provider: "zipkin", Address: "///threeslashes"})
		require.Error(t, err)
		require.Nil(t, tp)
	})

	t.Run("should create zipkin provider", func(t *testing.T) {
		tp, err := newProvider(Config{Service: "kobs", Provider: "zipkin", Address: "http://localhost:14268/api/traces"})
		require.NoError(t, err)
		require.NotNil(t, tp)
	})

	t.Run("should create jaeger provider", func(t *testing.T) {
		tp, err := newProvider(Config{Service: "kobs", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
		require.NoError(t, err)
		require.NotNil(t, tp)
	})
}
