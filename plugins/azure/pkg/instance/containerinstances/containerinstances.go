package containerinstances

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/Azure/azure-sdk-for-go/profiles/2020-09-01/monitor/mgmt/insights"
	"github.com/Azure/azure-sdk-for-go/profiles/latest/containerinstance/mgmt/containerinstance"
	"github.com/Azure/go-autorest/autorest"
)

// Client is the client to interact with the container instance API.
type Client struct {
	subscriptionID        string
	baseClient            containerinstance.BaseClient
	containerGroupsClient containerinstance.ContainerGroupsClient
	containersClient      containerinstance.ContainersClient
	metricsClient         insights.MetricsClient
}

// ContainerGroupListResult the container group list response that contains the container group properties.
type ContainerGroupListResult struct {
	Value    *[]map[string]interface{} `json:"value,omitempty"`
	NextLink *string                   `json:"nextLink,omitempty"`
}

// ListContainerGroups list all container groups in a subscription.
//
// We can not use the containerGroupsClient for this request, because the result is missing some important fields like
// the ids of the returned resources.
func (c *Client) ListContainerGroups(ctx context.Context) (*[]map[string]interface{}, error) {
	req, err := http.NewRequestWithContext(context.Background(), "GET", containerinstance.DefaultBaseURI+"/subscriptions/"+c.subscriptionID+"/providers/Microsoft.ContainerInstance/containerGroups?api-version=2021-07-01", nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode <= 299 {
		var containerGroupListResult ContainerGroupListResult

		if err := json.NewDecoder(resp.Body).Decode(&containerGroupListResult); err != nil {
			return nil, err
		}

		return containerGroupListResult.Value, nil
	}

	errBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return nil, fmt.Errorf("could not list container groups: %s", string(errBody))
}

// GetContainerGroup returns a single container group.
func (c *Client) GetContainerGroup(ctx context.Context, resourceGroup, containerGroup string) (map[string]interface{}, error) {
	req, err := http.NewRequestWithContext(context.Background(), "GET", containerinstance.DefaultBaseURI+"/subscriptions/"+c.subscriptionID+"/resourceGroups/"+resourceGroup+"/providers/Microsoft.ContainerInstance/containerGroups/"+containerGroup+"?api-version=2021-07-01", nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode <= 299 {
		var containerGroup map[string]interface{}

		if err := json.NewDecoder(resp.Body).Decode(&containerGroup); err != nil {
			return nil, err
		}

		return containerGroup, nil
	}

	errBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return nil, fmt.Errorf("could not get container group: %s", string(errBody))
}

// GetContainerGroupMetrics returns the metrisc for a container group.
func (c *Client) GetContainerGroupMetrics(ctx context.Context, resourceGroup, containerGroup, metricname string, timeStart, timeEnd int64) (*[]insights.Metric, error) {
	interval := getInterval(timeStart, timeEnd)
	top := int32(500)

	timeStartISO := time.Unix(timeStart, 0).UTC()
	timeEndISO := time.Unix(timeEnd, 0).UTC()
	timespan := timeStartISO.Format("2006-01-02T15:04:05") + "/" + timeEndISO.Format("2006-01-02T15:04:05")

	res, err := c.metricsClient.List(
		ctx,
		"/subscriptions/"+c.subscriptionID+"/resourceGroups/"+resourceGroup+"/providers/Microsoft.ContainerInstance/containerGroups/"+containerGroup,
		timespan,
		&interval,
		metricname,
		"",
		&top,
		"",
		"",
		insights.Data,
		"",
	)
	if err != nil {
		return nil, err
	}

	return res.Value, nil
}

// GetContainerLogs returns the logs for a container.
func (c *Client) GetContainerLogs(ctx context.Context, resourceGroup, containerGroup, container string, tail *int32, timestamps *bool) (*string, error) {
	res, err := c.containersClient.ListLogs(ctx, resourceGroup, containerGroup, container, tail, timestamps)
	if err != nil {
		return nil, err
	}

	return res.Content, nil
}

// RestartContainerGroup restarts a container group.
func (c *Client) RestartContainerGroup(ctx context.Context, resourceGroup, containerGroup string) error {
	_, err := c.containerGroupsClient.Restart(ctx, resourceGroup, containerGroup)
	if err != nil {
		return err
	}

	return nil
}

// New returns a new client to interact with the container instances API.
func New(subscriptionID string, authorizer autorest.Authorizer) *Client {
	baseClient := containerinstance.NewWithBaseURI(containerinstance.DefaultBaseURI, subscriptionID)
	baseClient.Authorizer = authorizer

	containerGroupsClient := containerinstance.NewContainerGroupsClient(subscriptionID)
	containerGroupsClient.Authorizer = authorizer

	containersClient := containerinstance.NewContainersClient(subscriptionID)
	containersClient.Authorizer = authorizer

	metricsClient := insights.NewMetricsClient(subscriptionID)
	metricsClient.Authorizer = authorizer

	return &Client{
		subscriptionID:        subscriptionID,
		baseClient:            baseClient,
		containerGroupsClient: containerGroupsClient,
		containersClient:      containersClient,
		metricsClient:         metricsClient,
	}
}
