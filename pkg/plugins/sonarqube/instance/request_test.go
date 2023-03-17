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

		_, err := doRequest[[]string](nil, ts.Client(), ts.URL)
		require.Error(t, err)
	})

	t.Run("invalid request", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		defer ts.Close()

		_, err := doRequest[[]string](context.Background(), ts.Client(), "")
		require.Error(t, err)
	})

	t.Run("request succeeds", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`["cluster1", "cluster2"]`))
		}))
		defer ts.Close()

		clusters, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.NoError(t, err)
		require.Equal(t, []string{"cluster1", "cluster2"}, clusters)
	})

	t.Run("request succeeds with map", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"cluster1":["default", "kube-system"]}`))
		}))
		defer ts.Close()

		var expectedNamespaces map[string][]string
		expectedNamespaces = make(map[string][]string)
		expectedNamespaces["cluster1"] = []string{"default", "kube-system"}

		actualNamespaces, err := doRequest[map[string][]string](context.Background(), ts.Client(), ts.URL)
		require.NoError(t, err)
		require.Equal(t, expectedNamespaces, actualNamespaces)
	})

	t.Run("request fails with invalid json data", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`[cluster1, cluster2]`))
		}))
		defer ts.Close()

		_, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.Error(t, err)
	})

	t.Run("request fails with invalid json error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{error: could not get clusters}`))
		}))
		defer ts.Close()

		_, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.Error(t, err)
	})

	t.Run("request fails with error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"errors": [{"msg": "could not get clusters"}]}`))
		}))
		defer ts.Close()

		_, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.Error(t, err)
	})

	t.Run("request fails with no error message", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"errors": []}`))
		}))
		defer ts.Close()

		_, err := doRequest[[]string](context.Background(), ts.Client(), ts.URL)
		require.Error(t, err)
	})
}
