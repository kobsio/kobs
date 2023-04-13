package instance

import (
	"context"
	"database/sql"
	"encoding/base64"
	"fmt"
	"math"
	"net/url"
	"strings"

	"cloud.google.com/go/bigquery"
	"github.com/kobsio/kobs/pkg/utils"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

// Querier abstracts the GetQueryResults interface for different kind of drivers
type Querier interface {
	// GetQueryResults returns all rows for the user provided SQL query.
	GetQueryResults(ctx context.Context, query string) ([]map[string]any, []string, error)
}

// NewStandardQuerier returns a Querier for databases that support database/sql interface
func NewStandardQuerier(driver, address string) (Querier, error) {
	client, err := sql.Open(driver, address)
	if err != nil {
		return nil, err
	}
	return &querier{client}, nil
}

// NewBigQueryQuerier returns a Querier for google bigquery database
func NewBigQueryQuerier(bc bigQueryConfig) (Querier, error) {
	client, err := bigquery.NewClient(context.Background(), bc.ProjectName, option.WithCredentialsJSON(bc.CredentialsJSON))
	if err != nil {
		return nil, err
	}
	return &bigqueryQuerier{client: client, defaultDataset: bc.DefaultDataset}, nil
}

type querier struct {
	client *sql.DB
}

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

type bigqueryQuerier struct {
	client         *bigquery.Client
	defaultDataset string
}

func (bq *bigqueryQuerier) GetQueryResults(ctx context.Context, query string) ([]map[string]any, []string, error) {
	q := bq.client.Query(query)
	q.DefaultDatasetID = bq.defaultDataset
	it, err := q.Read(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("unexpected error when running query %w", err)
	}

	columns := make([]string, 0)
	rows := make([]map[string]any, 0)
	for {
		row := make(map[string]any)
		var values []bigquery.Value
		err := it.Next(&values)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, nil, fmt.Errorf("unexpected error when reading next value %w", err)
		}

		schema := it.Schema
		for i, val := range values {
			col := schema[i].Name
			row[col] = val
			columns = utils.AppendIfStringIsMissing(columns, col)
		}

		rows = append(rows, row)
	}

	return rows, columns, nil
}

type bigQueryConfig struct {
	ProjectName     string
	DefaultDataset  string
	CredentialsJSON []byte
}

// parseBigQueryConnectionString parses the bigquery connection string
func parseBigQueryConnectionString(connectionString, database string) (*bigQueryConfig, error) {
	config := bigQueryConfig{}
	if !strings.HasPrefix(connectionString, "bigquery://") {
		return nil, fmt.Errorf("expected prefix \"bigquery://\" got: \"%s\"", connectionString)
	}

	u, err := url.Parse(connectionString)
	if err != nil {
		return nil, fmt.Errorf("unable to parse connection string, reason: %w", err)
	}
	query, err := url.ParseQuery(u.RawQuery)
	if err != nil {
		return nil, fmt.Errorf("unable to parse query params string, reason: %w", err)
	}
	config.ProjectName = u.Host
	credentials, err := base64.StdEncoding.DecodeString(query.Get("credentials"))
	if err != nil {
		return nil, fmt.Errorf("couldn't decode credentials")
	}
	config.CredentialsJSON = credentials
	config.DefaultDataset = database

	return &config, nil
}
