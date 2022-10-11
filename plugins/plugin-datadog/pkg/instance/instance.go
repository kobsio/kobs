package instance

import (
	"context"
	"fmt"

	"github.com/DataDog/datadog-api-client-go/v2/api/datadog"
	"github.com/DataDog/datadog-api-client-go/v2/api/datadogV2"
	"github.com/mitchellh/mapstructure"
)

// Config is the structure of the configuration for a single Datadog instance.
type Config struct {
	Address string `json:"address"`
	APIKey  string `json:"apiKey"`
	AppKey  string `json:"appKey"`
}

type Instance interface {
	GetName() string
	GetLogs(ctx context.Context, query string, startTime, endTime int64) ([]datadogV2.Log, error)
}

// Instance represents a single Datadog instance, which can be added via the configuration file.
type instance struct {
	name      string
	config    Config
	apiClient *datadog.APIClient
}

func (i *instance) getContext(ctx context.Context) context.Context {
	ctx = context.WithValue(
		ctx,
		datadog.ContextServerVariables,
		map[string]string{"site": i.config.Address},
	)

	ctx = context.WithValue(
		ctx,
		datadog.ContextAPIKeys,
		map[string]datadog.APIKey{
			"apiKeyAuth": {
				Key: i.config.APIKey,
			},
			"appKeyAuth": {
				Key: i.config.AppKey,
			},
		},
	)

	return ctx
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) GetLogs(ctx context.Context, query string, startTime, endTime int64) ([]datadogV2.Log, error) {
	body := datadogV2.LogsListRequest{
		Filter: &datadogV2.LogsQueryFilter{
			Query: &query,
			From:  datadog.PtrString(fmt.Sprintf("%d", startTime*1000)),
			To:    datadog.PtrString(fmt.Sprintf("%d", endTime*1000)),
		},
		Sort: datadogV2.LOGSSORT_TIMESTAMP_DESCENDING.Ptr(),
		Page: &datadogV2.LogsListRequestPage{
			Limit: datadog.PtrInt32(1000),
		},
	}

	ctx = i.getContext(ctx)
	api := datadogV2.NewLogsApi(i.apiClient)

	resp, _, err := api.ListLogs(ctx, *datadogV2.NewListLogsOptionalParameters().WithBody(body))
	if err != nil {
		return nil, err
	}

	return resp.Data, nil
}

// New returns a new Datadog instance for the given configuration.
func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	configuration := datadog.NewConfiguration()
	apiClient := datadog.NewAPIClient(configuration)

	instance := &instance{
		name:      name,
		config:    config,
		apiClient: apiClient,
	}

	return instance, nil
}
