package incident

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/opsgenie/opsgenie-go-sdk-v2/client"
)

// Client implements the Opsgenie client for the incidents API.
type Client struct {
	address string
	client  *client.OpsGenieClient
}

// GetTimeline can be used to get the timeline entries for an Opsgenie incident.
func (c *Client) GetTimeline(ctx context.Context, id string) ([]Entry, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/v2/incident-timelines/%s/entries?limit=20&group=custom,incident", c.address, id), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("GenieKey %s", c.client.Config.ApiKey))

	resp, err := c.client.RetryableClient.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		var data Response

		err = json.NewDecoder(resp.Body).Decode(&data)
		if err != nil {
			return nil, err
		}

		return data.Data.Entries, nil
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return nil, fmt.Errorf("Could not get incident timeline: %s", string(bodyBytes))
}

// NewClient creates a new Opsgenie client for the incidents API. This is required because the incident client from the
// opsgenie-go-sdk-v2 doesn't implement the timeline api and the api to resolve incidents.
func NewClient(config *client.Config) (*Client, error) {
	opsgenieClient, err := client.NewOpsGenieClient(config)
	if err != nil {
		return nil, err
	}

	return &Client{
		address: fmt.Sprintf("https://%s", config.OpsGenieAPIURL),
		client:  opsgenieClient,
	}, nil
}
