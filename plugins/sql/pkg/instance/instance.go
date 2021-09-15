package instance

import (
	"context"
	"database/sql"
	"fmt"

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
func (i *Instance) GetQueryResults(ctx context.Context, query string) ([][]interface{}, []string, error) {
	rows, err := i.client.QueryContext(ctx, query)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var columns []string
	columns, err = rows.Columns()
	if err != nil {
		return nil, nil, err
	}
	columnsLen := len(columns)

	var result [][]interface{}

	for rows.Next() {
		var r []interface{}
		r = make([]interface{}, columnsLen)

		for i := 0; i < columnsLen; i++ {
			r[i] = new(interface{})
		}

		if err := rows.Scan(r...); err != nil {
			return nil, nil, err
		}

		result = append(result, r)
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
