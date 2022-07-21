/*
Copyright 2022, Staffbase GmbH and contributors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.

You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package tracer

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestShutdown(t *testing.T) {
	client, err := Setup(true, "kobs", "jaeger", "http://localhost:14268/api/traces")
	require.NotNil(t, client)
	require.NoError(t, err)
	require.NotPanics(t, client.Shutdown)
}

func TestSetup(t *testing.T) {
	t.Run("tracing disabled", func(t *testing.T) {
		client, err := Setup(false, "", "jaeger", "http://localhost:14268/api/traces")
		require.Nil(t, client)
		require.NoError(t, err)
	})

	t.Run("setup failed", func(t *testing.T) {
		client, err := Setup(true, "", "jaeger", "http://localhost:14268/api/traces")
		require.Nil(t, client)
		require.Error(t, err)
	})

	t.Run("setup succeeded", func(t *testing.T) {
		client, err := Setup(true, "kobs", "jaeger", "http://localhost:14268/api/traces")
		require.NotNil(t, client)
		require.NoError(t, err)
	})
}

func TestNewProvider(t *testing.T) {
	t.Run("no service name", func(t *testing.T) {
		tp, err := newProvider("", "jaeger", "http://localhost:14268/api/traces")
		require.Error(t, err)
		require.Nil(t, tp)
	})

	t.Run("no provider url", func(t *testing.T) {
		tp, err := newProvider("myapp", "jaeger", "")
		require.Error(t, err)
		require.Nil(t, tp)
	})

	t.Run("zipkin provider error", func(t *testing.T) {
		tp, err := newProvider("myapp", "zipkin", "///threeslashes")
		require.Error(t, err)
		require.Nil(t, tp)
	})

	t.Run("zipkin provider created", func(t *testing.T) {
		tp, err := newProvider("myapp", "zipkin", "http://localhost:14268/api/traces")
		require.NoError(t, err)
		require.NotNil(t, tp)
	})

	t.Run("jaeger provider created", func(t *testing.T) {
		tp, err := newProvider("myapp", "jaeger", "http://localhost:14268/api/traces")
		require.NoError(t, err)
		require.NotNil(t, tp)
	})
}
