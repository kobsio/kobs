package incident

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/opsgenie/opsgenie-go-sdk-v2/client"
	"github.com/stretchr/testify/require"
)

func TestGetTimeline(t *testing.T) {
	t.Run("no context", func(t *testing.T) {
		opsgenieClient, _ := client.NewOpsGenieClient(&client.Config{
			ApiKey:         "test",
			OpsGenieAPIURL: "test",
		})

		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		defer ts.Close()

		client := &Client{
			address: ts.URL,
			client:  opsgenieClient,
		}

		// This is used to test when no context is passed to the function. This should never happen, but we want to make
		// sure that the function does not panic.
		//nolint:staticcheck
		_, err := client.GetTimeline(nil, "")
		require.Error(t, err)
	})

	t.Run("invalid request", func(t *testing.T) {
		opsgenieClient, _ := client.NewOpsGenieClient(&client.Config{
			ApiKey:         "test",
			OpsGenieAPIURL: "test",
		})

		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
		}))
		defer ts.Close()

		client := &Client{
			address: "",
			client:  opsgenieClient,
		}

		_, err := client.GetTimeline(context.Background(), "")
		require.Error(t, err)
	})

	t.Run("error response", func(t *testing.T) {
		opsgenieClient, _ := client.NewOpsGenieClient(&client.Config{
			ApiKey:         "test",
			OpsGenieAPIURL: "test",
		})

		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
		}))
		defer ts.Close()

		client := &Client{
			address: ts.URL,
			client:  opsgenieClient,
		}

		_, err := client.GetTimeline(context.Background(), "")
		require.Error(t, err)
	})

	t.Run("successful request with invalid data", func(t *testing.T) {
		opsgenieClient, _ := client.NewOpsGenieClient(&client.Config{
			ApiKey:         "test",
			OpsGenieAPIURL: "test",
		})

		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		}))
		defer ts.Close()

		client := &Client{
			address: ts.URL,
			client:  opsgenieClient,
		}

		_, err := client.GetTimeline(context.Background(), "")
		require.Error(t, err)
	})

	t.Run("successful request", func(t *testing.T) {
		opsgenieClient, _ := client.NewOpsGenieClient(&client.Config{
			ApiKey:         "test",
			OpsGenieAPIURL: "test",
		})

		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"data":{"entries":[{"id":"IncidentOpened_b29cd1ec-2ad7-55fc-a09b","group":"incident","type":"IncidentOpened","eventTime":"2021-12-22T09:47:44.432Z","hidden":false,"actor":{"name":"System","type":"system"},"title":{"type":"plain_text","content":"Incident opened"}}]},"took":0.012,"requestId":"5c0ce327-5860-4d57-b49b"}`))
		}))
		defer ts.Close()

		client := &Client{
			address: ts.URL,
			client:  opsgenieClient,
		}

		entries, err := client.GetTimeline(context.Background(), "")
		require.NoError(t, err)
		require.Equal(t, []Entry{{ID: "IncidentOpened_b29cd1ec-2ad7-55fc-a09b", Group: "incident", Type: "IncidentOpened", EventTime: time.Date(2021, time.December, 22, 9, 47, 44, 432000000, time.UTC), Hidden: false, Actor: Actor{Name: "System", Type: "system"}, Description: Description{Name: "", Type: ""}, LastEdit: LastEdit{EditTime: time.Date(1, time.January, 1, 0, 0, 0, 0, time.UTC), Actor: Actor{Name: "", Type: ""}}}}, entries)
	})
}

func TestNewClient(t *testing.T) {
	t.Run("could not create client", func(t *testing.T) {
		_, err := NewClient(&client.Config{})
		require.Error(t, err)
	})

	t.Run("create client", func(t *testing.T) {
		client, err := NewClient(&client.Config{
			ApiKey:         "test",
			OpsGenieAPIURL: "test",
		})
		require.NoError(t, err)
		require.NotEmpty(t, client)
	})
}
