package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"context"
	"fmt"
	"time"

	_ "github.com/ClickHouse/clickhouse-go/v2"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	"github.com/mitchellh/mapstructure"
	"go.uber.org/zap"

	"github.com/kobsio/kobs/pkg/instrument/log"
)

// Config is the structure of the configuration for a single SQL database instance.
type Config struct {
	Driver   string `json:"driver"`
	Address  string `json:"address"`
	Database string `json:"databse"`
}

type Instance interface {
	GetDialect() string
	GetName() string
	GetCompletions() map[string][]string
	GetQueryResults(ctx context.Context, query string) ([]map[string]any, []string, error)
}

type instance struct {
	querier            Querier
	dialect            string
	name               string
	completions        map[string][]string
	completionProvider CompletionProvider
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) GetDialect() string {
	return i.dialect
}

func (i *instance) GetCompletions() map[string][]string {
	return i.completions
}

func (i *instance) GetQueryResults(ctx context.Context, query string) ([]map[string]any, []string, error) {
	return i.querier.GetQueryResults(ctx, query)
}

func dialectFromDriver(driver string) string {
	if driver == "postgres" {
		return "postgres"
	}

	if driver == "mysql" {
		return "mysql"
	}

	if driver == "clickhouse" {
		return "clickhouse"
	}

	if driver == "bigquery" {
		return "bigquery"
	}

	return "sql"
}

func (i *instance) updateCompletions() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()
	if completions, err := i.completionProvider.GetCompletions(ctx); err != nil {
		log.Error(ctx, "could not fetch completions", zap.Error(err))
	} else {
		i.completions = completions
	}
}

// refreshCompletions fetches the completions for this instance in a regular interval
func (i *instance) refreshCompletions() {
	i.updateCompletions()
	for {
		<-time.After(1 * time.Hour)
		i.updateCompletions()
	}
}

// New returns a new sql instance for the given configuration.
func New(name string, options map[string]any) (*instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	if config.Driver != "clickhouse" && config.Driver != "postgres" && config.Driver != "mysql" && config.Driver != "bigquery" {
		return nil, fmt.Errorf("invalid driver")
	}

	if config.Driver == "bigquery" {
		bigqueryConfig, err := parseBigQueryConnectionString(config.Address, config.Database)
		if err != nil {
			return nil, fmt.Errorf("couldn't parse big query connection string %w", err)
		}

		querier, err := NewBigQueryQuerier(*bigqueryConfig)
		if err != nil {
			return nil, fmt.Errorf("unable to create querier %w", err)
		}

		instance := &instance{
			querier: querier,
			name:    name,
			completionProvider: newCompletionProvider(querier, completionConfig{
				driver:              config.Driver,
				bigqueryProjectName: bigqueryConfig.ProjectName,
				bigqueryDatasetName: config.Database,
			}),
			dialect: dialectFromDriver(config.Driver),
		}
		go instance.refreshCompletions()

		return instance, nil
	}

	address := fmt.Sprintf("%s/%s", config.Address, config.Database)
	querier, err := NewStandardQuerier(config.Driver, address)
	if err != nil {
		return nil, fmt.Errorf("unable to create querier %w", err)
	}
	instance := &instance{
		querier:            querier,
		name:               name,
		completionProvider: newCompletionProvider(querier, completionConfig{driver: config.Driver, databaseName: config.Database}),
		dialect:            dialectFromDriver(config.Driver),
	}

	go instance.refreshCompletions()
	return instance, nil
}
