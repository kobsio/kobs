package instance

import (
	"context"
	"database/sql"
	"fmt"
	"math"

	_ "github.com/ClickHouse/clickhouse-go"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	"github.com/mitchellh/mapstructure"
)

// Config is the structure of the configuration for a single SQL database instance.
type Config struct {
	Driver     string `json:"driver"`
	Connection string `json:"connection"`
}

type Instance interface {
	GetName() string
	GetQueryResults(ctx context.Context, query string) ([]map[string]any, []string, error)
}

type instance struct {
	name   string
	client *sql.DB
}

func (i *instance) GetName() string {
	return i.name
}

// GetQueryResults returns all rows for the user provided SQL query.
func (i *instance) GetQueryResults(ctx context.Context, query string) ([]map[string]any, []string, error) {
	rows, err := i.client.QueryContext(ctx, query)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, nil, err
	}

	var result []map[string]any

	for rows.Next() {
		values := make([]any, len(columns))
		pointers := make([]any, len(columns))

		for i := range values {
			pointers[i] = &values[i]
		}

		if err := rows.Scan(pointers...); err != nil {
			return nil, nil, err
		}

		// When we assign the correct value to an row, we also have to check if the returned value is of type float and
		// if the value is NaN or Inf, because then the json encoding would fail if we add the value.
		resultMap := make(map[string]any)
		for i, val := range values {
			switch v := val.(type) {
			case float64:
				if !math.IsNaN(v) && !math.IsInf(v, 0) {
					resultMap[columns[i]] = val
				}
			default:
				resultMap[columns[i]] = val
			}
		}

		result = append(result, resultMap)
	}

	if err := rows.Err(); err != nil {
		return nil, nil, err
	}

	return result, columns, nil
}

// New returns a new Elasticsearch instance for the given configuration.
func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	if config.Driver != "clickhouse" && config.Driver != "postgres" && config.Driver != "mysql" {
		return nil, fmt.Errorf("invalid driver")
	}

	client, err := sql.Open(config.Driver, config.Connection)
	if err != nil {
		return nil, err
	}

	return &instance{
		name:   name,
		client: client,
	}, nil
}
