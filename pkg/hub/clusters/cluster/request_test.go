package cluster

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/stretchr/testify/require"
)

func TestDoRequest(t *testing.T) {
	t.Run("no context", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		defer ts.Close()

		_, err := doRequest[[]string](ts.Client(), nil, "", http.MethodGet, ts.URL, nil)
		require.Error(t, err)
	})

	t.Run("invalid request", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		defer ts.Close()

		_, err := doRequest[[]string](ts.Client(), context.Background(), "", http.MethodGet, "", nil)
		require.Error(t, err)
	})

	t.Run("request succeeds", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`["cluster1", "cluster2"]`))
		}))
		defer ts.Close()

		ctx := context.Background()
		ctx = context.WithValue(ctx, middleware.RequestIDKey, "request-id")
		clusters, err := doRequest[[]string](ts.Client(), ctx, "", http.MethodGet, ts.URL, nil)
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

		var expectedMap map[string][]string
		expectedMap = make(map[string][]string)
		expectedMap["cluster1"] = []string{"default", "kube-system"}

		ctx := context.Background()
		ctx = context.WithValue(ctx, middleware.RequestIDKey, "request-id")
		actualMap, err := doRequest[map[string][]string](ts.Client(), ctx, "", http.MethodGet, ts.URL, nil)
		require.NoError(t, err)
		require.Equal(t, expectedMap, actualMap)
	})

	t.Run("request fails with invalid json data", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`[cluster1, cluster2]`))
		}))
		defer ts.Close()

		ctx := context.Background()
		ctx = context.WithValue(ctx, middleware.RequestIDKey, "request-id")
		_, err := doRequest[[]string](ts.Client(), ctx, "", http.MethodGet, ts.URL, nil)
		require.Error(t, err)
	})

	t.Run("request fails with invalid json error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{error: could not get clusters}`))
		}))
		defer ts.Close()

		ctx := context.Background()
		ctx = context.WithValue(ctx, middleware.RequestIDKey, "request-id")
		_, err := doRequest[[]string](ts.Client(), ctx, "", http.MethodGet, ts.URL, nil)
		require.Error(t, err)
	})

	t.Run("request fails with error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error": "could not get clusters"}`))
		}))
		defer ts.Close()

		ctx := context.Background()
		ctx = context.WithValue(ctx, middleware.RequestIDKey, "request-id")
		_, err := doRequest[[]string](ts.Client(), ctx, "", http.MethodGet, ts.URL, nil)
		require.Error(t, err)
	})
}
