package timeline

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/opsgenie/opsgenie-go-sdk-v2/client"
)

// Response is the structure of the Opsgenie API response.
type Response struct {
	Data struct {
		Entries    []Entry `json:"entries"`
		NextOffset string  `json:"nextOffset"`
	} `json:"data"`
	Took      float64 `json:"took"`
	RequestID string  `json:"requestId"`
}

// Entry is the structure for a single incident timeline entry.
type Entry struct {
	ID        string    `json:"id"`
	Group     string    `json:"group"`
	Type      string    `json:"type"`
	EventTime time.Time `json:"eventTime"`
	Hidden    bool      `json:"hidden"`
	Actor     struct {
		Name string `json:"name"`
		Type string `json:"type"`
	} `json:"actor"`
	Description struct {
		Name string `json:"name"`
		Type string `json:"type"`
	} `json:"description"`
	LastEdit struct {
		EditTime time.Time `json:"editTime"`
		Actor    struct {
			Name string `json:"name"`
			Type string `json:"type"`
		} `json:"actor"`
	} `json:"lastEdit"`
}

// Client implements the Opsgenie client for the incidents timeline API.
type Client struct {
	client *client.OpsGenieClient
}

// GetTimeline can be used to get the timeline entries for an Opsgenie incident.
func (c *Client) GetTimeline(ctx context.Context, id string) ([]Entry, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("https://%s/v2/incident-timelines/%s/entries?limit=20&group=custom,incident", c.client.Config.OpsGenieAPIURL, id), nil)
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

	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return nil, fmt.Errorf("Could not get incident timeline: %s", string(bodyBytes))
}

// NewClient creates a new Opsgenie client for the incidents timeline API.
func NewClient(config *client.Config) (*Client, error) {
	opsgenieClient, err := client.NewOpsGenieClient(config)
	if err != nil {
		return nil, err
	}

	return &Client{client: opsgenieClient}, nil
}
