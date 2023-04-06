package instance

import (
	"context"
	"fmt"
)

type CompletionProvider interface {
	// GetCompletions returns a map
	// the keys are table-names, which map to a slice of table columns
	GetCompletions(ctx context.Context) (map[string][]string, error)
}

func newCompletionProvider(q querier, driver, databaseName string) CompletionProvider {
	if driver == "clickhouse" {
		return clickhouseCompletionProvider{q, databaseName}
	}

	if driver == "postgres" {
		return postgresCompletionProvider{q}
	}

	if driver == "mysql" {
		return mysqlCompletionProvider{q, databaseName}
	}

	panic(fmt.Sprintf("got unknown driver: %s", driver))
}

type postgresCompletionProvider struct {
	q querier
}

func (p postgresCompletionProvider) GetCompletions(ctx context.Context) (map[string][]string, error) {
	columnResults, _, err := p.q.GetQueryResults(ctx, "SELECT column_name::text, table_name::text FROM information_schema.columns WHERE table_schema = 'public'")
	if err != nil {
		return nil, err
	}

	result := make(map[string][]string)
	for _, row := range columnResults {
		tableName := row["table_name"].(string)
		if _, exists := result[tableName]; !exists {
			result[tableName] = make([]string, 0)
		}

		columnName := row["column_name"].(string)
		result[tableName] = append(result[tableName], columnName)
	}

	return result, nil
}

type clickhouseCompletionProvider struct {
	q            querier
	databaseName string
}

func (p clickhouseCompletionProvider) GetCompletions(ctx context.Context) (map[string][]string, error) {
	query := fmt.Sprintf("SELECT table AS table_name, name AS column_name FROM system.columns WHERE database = '%s'", p.databaseName)
	columnResults, _, err := p.q.GetQueryResults(ctx, query)
	if err != nil {
		return nil, err
	}

	result := make(map[string][]string)
	for _, row := range columnResults {
		tableName := row["table_name"].(string)
		if _, exists := result[tableName]; !exists {
			result[tableName] = make([]string, 0)
		}

		columnName := row["column_name"].(string)
		result[tableName] = append(result[tableName], columnName)
	}

	return result, nil
}

type mysqlCompletionProvider struct {
	q            querier
	databaseName string
}

func (p mysqlCompletionProvider) GetCompletions(ctx context.Context) (map[string][]string, error) {
	query := fmt.Sprintf("SELECT column_name AS column_name, table_name AS table_name FROM information_schema.columns WHERE table_schema = '%s'", p.databaseName)
	columnResults, _, err := p.q.GetQueryResults(ctx, query)
	if err != nil {
		return nil, err
	}

	result := make(map[string][]string)
	for _, row := range columnResults {
		tableName := row["table_name"].(string)
		if _, exists := result[tableName]; !exists {
			result[tableName] = make([]string, 0)
		}

		columnName := row["column_name"].(string)
		result[tableName] = append(result[tableName], columnName)
	}

	return result, nil
}
