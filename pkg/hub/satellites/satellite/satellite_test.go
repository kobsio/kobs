package satellite

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

var testConfig = Config{
	Name:    "foobar",
	Address: "http://localhost:15221",
	Token:   "unsecure",
}

func TestGetName(t *testing.T) {
	client, _ := NewClient(testConfig)
	require.Equal(t, testConfig.Name, client.GetName())
}

func TestGetAddress(t *testing.T) {
	client, _ := NewClient(testConfig)
	require.Equal(t, testConfig.Address, client.GetAddress())
}

func TestGetToken(t *testing.T) {
	client, _ := NewClient(testConfig)
	require.Equal(t, testConfig.Token, client.GetToken())
}

func TestProxy(t *testing.T) {
	satelliteServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			c, _, _ := w.(http.Hijacker).Hijack()
			c.Close()
			return
		}

		if r.Method == http.MethodPost {
			if r.URL.Query().Get("status") == "ok" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{"status":"ok"}`))
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error":"foobar"}`))
			return
		}
	}))
	defer satelliteServer.Close()

	client, _ := NewClient(Config{Address: satelliteServer.URL})

	hubServer := httptest.NewServer(http.HandlerFunc(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		client.Proxy(w, r)
	})))
	defer hubServer.Close()

	t.Run("proxy error", func(t *testing.T) {
		resp, err := http.Get(hubServer.URL)
		body, _ := io.ReadAll(resp.Body)

		require.NoError(t, err)
		require.Equal(t, http.StatusBadGateway, resp.StatusCode)
		require.Equal(t, "{\"error\":\"Satellite request failed: EOF\"}\n", string(body))
	})

	t.Run("request ok", func(t *testing.T) {
		resp, err := http.Post(hubServer.URL+"?status=ok", "", nil)
		body, _ := io.ReadAll(resp.Body)

		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.Equal(t, "{\"status\":\"ok\"}", string(body))
	})

	t.Run("request error", func(t *testing.T) {
		resp, err := http.Post(hubServer.URL+"?status=error", "", nil)
		body, _ := io.ReadAll(resp.Body)

		require.NoError(t, err)
		require.Equal(t, http.StatusBadRequest, resp.StatusCode)
		require.Equal(t, "{\"error\":\"foobar\"}", string(body))
	})
}

func TestNewClient(t *testing.T) {
	t.Run("create new client fails", func(t *testing.T) {
		_, err := NewClient(Config{Address: " http://localhost:15221"})
		require.Error(t, err)
	})

	t.Run("create new client succeeds", func(t *testing.T) {
		client, err := NewClient(Config{Address: "http://localhost:15221"})
		require.NoError(t, err)
		require.NotEmpty(t, client)
	})
}
