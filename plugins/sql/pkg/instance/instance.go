package instance

import (
	"context"
	"database/sql"
	"fmt"
	"math"

	_ "github.com/ClickHouse/clickhouse-go"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "sql"})
)

// Config is the structure of the configuration for a single SQL database instance.
type Config struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Description string `json:"description"`
	Driver      string `json:"driver"`
	Connection  string `json:"connection"`
}

// Instance represents a single SQL database instance, which can be added via the configuration file.
type Instance struct {
	Name   string
	client *sql.DB
}

// GetQueryResults returns all rows for the user provided SQL query.
func (i *Instance) GetQueryResults(ctx context.Context, query string) ([]map[string]interface{}, []string, error) {
	rows, err := i.client.QueryContext(ctx, query)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, nil, err
	}

	var result []map[string]interface{}

	for rows.Next() {
		values := make([]interface{}, len(columns))
		pointers := make([]interface{}, len(columns))

		for i := range values {
			pointers[i] = &values[i]
		}

		if err := rows.Scan(pointers...); err != nil {
			return nil, nil, err
		}

		// When we assign the correct value to an row, we also have to check if the returned value is of type float and
		// if the value is NaN or Inf, because then the json encoding would fail if we add the value.
		resultMap := make(map[string]interface{})
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

// New returns a new SQL database instance for the given configuration.
func New(config Config) (*Instance, error) {
	if config.Driver != "clickhouse" && config.Driver != "postgres" && config.Driver != "mysql" {
		return nil, fmt.Errorf("invalid driver")
	}

	client, err := sql.Open(config.Driver, config.Connection)
	if err != nil {
		log.WithError(err).Errorf("could not initialize database connection")
		return nil, err
	}

	return &Instance{
		Name:   config.Name,
		client: client,
	}, nil
}
