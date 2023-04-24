package instance

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestDoRequest(t *testing.T) {
	t.Run("no context", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		defer ts.Close()

		// This is used to test when no context is passed to the function. This should never happen, but we want to make
		// sure that the function does not panic.
		//nolint:staticcheck
		_, _, err := doRequest[[]string](nil, ts.Client(), ts.URL)
		require.Error(t, err)
	})

	t.Run("invalid request", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		defer ts.Close()

		_, _, err := doRequest[[]string](context.Background(), ts.Client(), "")
		require.Error(t, err)
	})

	t.Run("request succeeds", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("x-total-count", "2")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`["public", "private"]`))
		}))
		defer ts.Close()

		projects, total, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.NoError(t, err)
		require.Equal(t, int64(2), total)
		require.Equal(t, []string{"public", "private"}, projects)
	})

	t.Run("request succeeds, with invalid total header", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("x-total-count", "test")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`["public", "private"]`))
		}))
		defer ts.Close()

		projects, total, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.Error(t, err)
		require.Equal(t, int64(0), total)
		require.Equal(t, []string{"public", "private"}, projects)
	})

	t.Run("request succeeds, without total header", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`["public", "private"]`))
		}))
		defer ts.Close()

		projects, total, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.NoError(t, err)
		require.Equal(t, int64(0), total)
		require.Equal(t, []string{"public", "private"}, projects)
	})

	t.Run("request fails with invalid json data", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`[public, private]`))
		}))
		defer ts.Close()

		_, _, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.Error(t, err)
	})

	t.Run("request fails with invalid json error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{error: could not get clusters}`))
		}))
		defer ts.Close()

		_, _, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.Error(t, err)
	})

	t.Run("request fails with error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"errors": [{"message": "could not get clusters"}]}`))
		}))
		defer ts.Close()

		_, _, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.Error(t, err)
	})

	t.Run("request fails with no error message", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"errors": []}`))
		}))
		defer ts.Close()

		_, _, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.Error(t, err)
	})
}
