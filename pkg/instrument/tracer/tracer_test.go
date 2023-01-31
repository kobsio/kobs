package tracer

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestShutdown(t *testing.T) {
	client, err := Setup(Config{Enabled: true, Service: "feeddeck", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
	require.NotNil(t, client)
	require.NoError(t, err)
	require.NotPanics(t, client.Shutdown)
}

func TestSetup(t *testing.T) {
	t.Run("tracing disabled", func(t *testing.T) {
		client, err := Setup(Config{Enabled: false, Service: "", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
		require.Nil(t, client)
		require.NoError(t, err)
	})

	t.Run("setup failed", func(t *testing.T) {
		client, err := Setup(Config{Enabled: true, Service: "", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
		require.Nil(t, client)
		require.Error(t, err)
	})

	t.Run("setup succeeded", func(t *testing.T) {
		client, err := Setup(Config{Enabled: true, Service: "feeddeck", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
		require.NotNil(t, client)
		require.NoError(t, err)
	})
}

func TestNewProvider(t *testing.T) {
	t.Run("no service name", func(t *testing.T) {
		tp, err := newProvider(Config{Service: "", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
		require.Error(t, err)
		require.Nil(t, tp)
	})

	t.Run("no provider url", func(t *testing.T) {
		tp, err := newProvider(Config{Service: "feeddeck", Provider: "jaeger", Address: ""})
		require.Error(t, err)
		require.Nil(t, tp)
	})

	t.Run("zipkin provider error", func(t *testing.T) {
		tp, err := newProvider(Config{Service: "feeddeck", Provider: "zipkin", Address: "///threeslashes"})
		require.Error(t, err)
		require.Nil(t, tp)
	})

	t.Run("zipkin provider created", func(t *testing.T) {
		tp, err := newProvider(Config{Service: "feeddeck", Provider: "zipkin", Address: "http://localhost:14268/api/traces"})
		require.NoError(t, err)
		require.NotNil(t, tp)
	})

	t.Run("jaeger provider created", func(t *testing.T) {
		tp, err := newProvider(Config{Service: "feeddeck", Provider: "jaeger", Address: "http://localhost:14268/api/traces"})
		require.NoError(t, err)
		require.NotNil(t, tp)
	})
}
