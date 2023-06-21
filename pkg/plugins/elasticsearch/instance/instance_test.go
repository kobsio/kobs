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
		name: "elasticsearch",
	}

	require.Equal(t, "elasticsearch", instance.GetName())
}

func TestGetLogs(t *testing.T) {
	for _, tt := range []struct {
		name          string
		address       string
		ctx           context.Context
		handlerFunc   func(w http.ResponseWriter, r *http.Request)
		expectedError bool
		expectedData  *Data
	}{
		{
			name:          "should return error for invalid request",
			ctx:           nil,
			handlerFunc:   func(w http.ResponseWriter, r *http.Request) {},
			expectedError: true,
		},
		{
			name:          "should return error for invalid request address",
			address:       "kobs.io",
			ctx:           context.Background(),
			handlerFunc:   func(w http.ResponseWriter, r *http.Request) {},
			expectedError: true,
		},
		{
			name: "should return error for invalid request with error response",
			ctx:  context.Background(),
			handlerFunc: func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				w.Write([]byte(`{"error": {"root_cause": [{"type": "type", "reason": "reason"}], "type": "type", "reason": "reason"}, "status": 400}`))
			},
			expectedError: true,
		},
		{
			name: "should return error for invalid request without error response",
			ctx:  context.Background(),
			handlerFunc: func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				w.Write([]byte(`{"error": []}`))
			},
			expectedError: true,
		},
		{
			name: "should return data",
			ctx:  context.Background(),
			handlerFunc: func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{"took": 100, "hits": {"total": {"value": 1000}, "hits": [{"test": "test"}]}, "aggregations": {"logcount": {"buckets": [{"key_as_string": "123", "key": 123, "doc_count": 1000}]}}}`))
			},
			expectedError: false,
			expectedData:  &Data{Took: 100, Hits: 1000, Documents: []map[string]any{{"test": "test"}}, Buckets: []Bucket{{KeyAsString: "123", Key: 123, DocCount: 1000}}},
		},
		{
			name: "should return error for invalid data",
			ctx:  context.Background(),
			handlerFunc: func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{"took": [100]}`))
			},
			expectedError: true,
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			ts := httptest.NewServer(http.HandlerFunc(tt.handlerFunc))
			defer ts.Close()

			if tt.address == "" {
				tt.address = ts.URL
			}

			instance := &instance{
				name:    "elasticsearch",
				address: tt.address,
				client:  ts.Client(),
			}

			actualData, actualError := instance.GetLogs(tt.ctx, "", "", "", 0, 0)
			if tt.expectedError {
				require.Error(t, actualError)
			} else {
				require.NoError(t, actualError)
			}
			require.Equal(t, tt.expectedData, actualData)
		})
	}
}

func TestNew(t *testing.T) {
	t.Run("should return error for invalid options", func(t *testing.T) {
		instance, err := New("elasticsearch", map[string]any{"address": []string{"localhost"}})
		require.Error(t, err)
		require.Nil(t, instance)
	})

	t.Run("should return instance", func(t *testing.T) {
		instance, err := New("elasticsearch", map[string]any{"address": "localhost"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})

	t.Run("should return instance with basic auth", func(t *testing.T) {
		instance, err := New("elasticsearch", map[string]any{"address": "localhost", "username": "username", "password": "password"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})

	t.Run("should return instance with token auth", func(t *testing.T) {
		instance, err := New("elasticsearch", map[string]any{"address": "localhost", "token": "token"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})
}
