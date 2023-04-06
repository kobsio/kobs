package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strings"

	_ "github.com/ClickHouse/clickhouse-go/v2"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	"github.com/mitchellh/mapstructure"
)

// Config is the structure of the configuration for a single SQL database instance.
type Config struct {
	Driver  string `json:"driver"`
	Address string `json:"address"`
}

type Instance interface {
	GetDialect() string
	GetName() string
	GetCompletions(ctx context.Context) (map[string][]string, error)
	GetQueryResults(ctx context.Context, query string) ([]map[string]any, []string, error)
}

type instance struct {
	querier
	dialect            string
	name               string
	completionProvider CompletionProvider
}

func (i *instance) GetName() string {
	return i.name
}

type querier struct {
	client *sql.DB
}

// GetQueryResults returns all rows for the user provided SQL query.
func (q *querier) GetQueryResults(ctx context.Context, query string) ([]map[string]any, []string, error) {
	rows, err := q.client.QueryContext(ctx, query)
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
			case []uint8:
				resultMap[columns[i]] = string(v)
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

func (i *instance) GetDialect() string {
	return i.dialect
}

func (i *instance) GetCompletions(ctx context.Context) (map[string][]string, error) {
	return i.completionProvider.GetCompletions(ctx)
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

	return "sql"
}

// New returns a new sql instance for the given configuration.
func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	if config.Driver != "clickhouse" && config.Driver != "postgres" && config.Driver != "mysql" {
		return nil, fmt.Errorf("invalid driver")
	}

	client, err := sql.Open(config.Driver, config.Address)
	if err != nil {
		return nil, err
	}
	q := querier{client}
	parts := strings.Split(config.Address, "/")
	databaseName := ""
	if len(parts) > 1 {
		databaseName = parts[len(parts)-1]
	}

	return &instance{
		querier:            q,
		name:               name,
		completionProvider: newCompletionProvider(q, config.Driver, databaseName),
		dialect:            dialectFromDriver(config.Driver),
	}, nil
}
