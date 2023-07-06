package instance

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetName(t *testing.T) {
	instance := &instance{
		name: "jaeger",
	}

	require.Equal(t, "jaeger", instance.GetName())
}

func TestDoRequest(t *testing.T) {
	t.Run("should fail when context is nil", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		defer ts.Close()

		i := &instance{name: "jaeger", client: ts.Client(), address: ts.URL}
		// This is used to test when no context is passed to the function. This should never happen, but we want to make
		// sure that the function does not panic.
		//nolint:staticcheck
		err := i.doRequest(nil, nil, "/")
		require.Error(t, err)
	})

	t.Run("should fail for invalid request", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		defer ts.Close()

		i := &instance{name: "jaeger", client: ts.Client(), address: ""}
		err := i.doRequest(context.Background(), nil, "/")
		require.Error(t, err)
	})

	t.Run("should return result", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"key": "value"}`))
		}))
		defer ts.Close()

		i := &instance{name: "jaeger", client: ts.Client(), address: ts.URL}
		w := httptest.NewRecorder()
		err := i.doRequest(context.Background(), w, "/")
		require.NoError(t, err)
		require.Equal(t, []byte(`{"key": "value"}`), w.Body.Bytes())
	})

	t.Run("should return error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"errors": [{"core": "error code", "msg": "error message"}]}`))
		}))
		defer ts.Close()

		i := &instance{name: "jaeger", client: ts.Client(), address: ts.URL}
		err := i.doRequest(context.Background(), nil, "/")
		require.Error(t, err)
		require.Equal(t, "error message", err.Error())
	})

	t.Run("should return error if error contains invalid json", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"errors": [{"core: "error code", "msg": "error message"}]}`))
		}))
		defer ts.Close()

		i := &instance{name: "jaeger", client: ts.Client(), address: ts.URL}
		err := i.doRequest(context.Background(), nil, "/")
		require.Error(t, err)
	})
}

func TestGetServices(t *testing.T) {
	t.Run("should return services", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"key": "value"}`))
		}))
		defer ts.Close()

		i := &instance{name: "jaeger", client: ts.Client(), address: ts.URL}
		w := httptest.NewRecorder()
		err := i.GetServices(context.Background(), w)
		require.NoError(t, err)
		require.Equal(t, []byte(`{"key": "value"}`), w.Body.Bytes())
	})
}

func TestGetOperations(t *testing.T) {
	t.Run("should return operations", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"key": "value"}`))
		}))
		defer ts.Close()

		i := &instance{name: "jaeger", client: ts.Client(), address: ts.URL}
		w := httptest.NewRecorder()
		err := i.GetOperations(context.Background(), w, "service")
		require.NoError(t, err)
		require.Equal(t, []byte(`{"key": "value"}`), w.Body.Bytes())
	})
}

func TestGetTraces(t *testing.T) {
	t.Run("should return traces", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"key": "value"}`))
		}))
		defer ts.Close()

		i := &instance{name: "jaeger", client: ts.Client(), address: ts.URL}
		w := httptest.NewRecorder()
		err := i.GetTraces(context.Background(), w, "", "", "", "operation", "service", "", 0, 0)
		require.NoError(t, err)
		require.Equal(t, []byte(`{"key": "value"}`), w.Body.Bytes())
	})
}

func TestGetTrace(t *testing.T) {
	t.Run("should return trace", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"key": "value"}`))
		}))
		defer ts.Close()

		i := &instance{name: "jaeger", client: ts.Client(), address: ts.URL}
		w := httptest.NewRecorder()
		err := i.GetTrace(context.Background(), w, "")
		require.NoError(t, err)
		require.Equal(t, []byte(`{"key": "value"}`), w.Body.Bytes())
	})
}

func TestGetMetrics(t *testing.T) {
	t.Run("should return trace", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"key": "value"}`))
		}))
		defer ts.Close()

		i := &instance{name: "jaeger", client: ts.Client(), address: ts.URL}
		w := httptest.NewRecorder()
		err := i.GetMetrics(context.Background(), w, "", "", "", "", "", "", []string{"kind1", "kind2"}, 0, 0)
		require.NoError(t, err)
		require.Equal(t, []byte(`{"key": "value"}`), w.Body.Bytes())
	})
}

func TestNew(t *testing.T) {
	t.Run("should return error for invalid options", func(t *testing.T) {
		instance, err := New("jaeger", map[string]any{"address": []string{"localhost"}})
		require.Error(t, err)
		require.Nil(t, instance)
	})

	t.Run("should return instance with default round tripper", func(t *testing.T) {
		instance, err := New("jaeger", map[string]any{"address": "localhost"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})

	t.Run("should return instance with basic auth", func(t *testing.T) {
		instance, err := New("jaeger", map[string]any{"address": "localhost", "username": "admin", "password": "admin"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})

	t.Run("should return instance with token auth", func(t *testing.T) {
		instance, err := New("jaeger", map[string]any{"address": "localhost", "token": "token"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})
}
