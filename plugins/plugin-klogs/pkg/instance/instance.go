package instance

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/log"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/mitchellh/mapstructure"
	"go.uber.org/zap"
)

// Config is the structure of the configuration for a single klogs instance.
type Config struct {
	Address             string   `json:"address"`
	Database            string   `json:"database"`
	Username            string   `json:"username"`
	Password            string   `json:"password"`
	DialTimeout         string   `json:"dialTimeout"`
	ConnMaxLifetime     string   `json:"connMaxLifetime"`
	MaxIdleConns        int      `json:"maxIdleConns"`
	MaxOpenConns        int      `json:"maxOpenConns"`
	MaterializedColumns []string `json:"materializedColumns"`
}

type Instance interface {
	GetName() string
	getFields(ctx context.Context) (Fields, error)
	refreshCachedFields() []string
	GetFields(filter string, fieldType string) []string
	GetLogs(ctx context.Context, query, order, orderBy string, limit, timeStart, timeEnd int64) ([]map[string]any, []string, int64, int64, []Bucket, error)
	GetRawQueryResults(ctx context.Context, query string) ([][]any, []string, error)
	GetAggregation(ctx context.Context, aggregation Aggregation) ([]map[string]any, []string, error)
}

// Instance represents a single klogs instance, which can be added via the configuration file.
type instance struct {
	name                string
	database            string
	client              *sql.DB
	materializedColumns []string
	cachedFields        Fields
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) getFields(ctx context.Context) (Fields, error) {
	fields := Fields{}
	now := time.Now().Unix()

	for _, fieldType := range []string{"string", "number"} {
		rowsFieldKeys, err := i.client.QueryContext(ctx, fmt.Sprintf("SELECT DISTINCT arrayJoin(mapKeys(fields_%s)) FROM %s.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) SETTINGS skip_unavailable_shards = 1", fieldType, i.database, now-3600, now))
		if err != nil {
			return fields, err
		}
		defer rowsFieldKeys.Close()

		for rowsFieldKeys.Next() {
			var field string

			if err := rowsFieldKeys.Scan(&field); err != nil {
				return fields, err
			}

			if fieldType == "string" {
				fields.String = append(fields.String, field)
			} else if fieldType == "number" {
				fields.Number = append(fields.Number, field)
			}
		}

		if err := rowsFieldKeys.Err(); err != nil {
			return fields, err
		}
	}

	return fields, nil
}

// refreshCachedFields retrieves all fields for the last 24 hours and merges them with the already cached fields. To get
// the initial list of cached fields we are running the query before starting the ticker.
func (i *instance) refreshCachedFields() []string {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	fields, err := i.getFields(ctx)
	if err != nil {
		log.Error(ctx, "Could not refresh cached fields", zap.Error(err))
	} else {
		log.Info(ctx, "Refreshed fields", zap.Int("stringFieldsCount", len(fields.String)), zap.Int("numberFieldsCount", len(fields.Number)))
		i.cachedFields = fields
	}

	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
			defer cancel()

			fields, err := i.getFields(ctx)
			if err != nil {
				log.Error(ctx, "Could not refresh cached fields", zap.Error(err))
			} else {
				log.Info(ctx, "Refreshed fields", zap.Int("stringFieldsCount", len(fields.String)), zap.Int("numberFieldsCount", len(fields.Number)))

				for _, field := range fields.String {
					i.cachedFields.String = appendIfMissing(i.cachedFields.String, field)
				}

				for _, field := range fields.Number {
					i.cachedFields.Number = appendIfMissing(i.cachedFields.Number, field)
				}
			}
		}
	}
}

// GetFields returns all cached fields which are containing the filter term. The cached fields are refreshed every 24.
func (i *instance) GetFields(filter string, fieldType string) []string {
	var fields []string

	if fieldType == "string" || fieldType == "" {
		for _, field := range i.cachedFields.String {
			if strings.Contains(field, filter) {
				fields = append(fields, field)
			}
		}

		fields = append(fields, defaultFields...)
	}

	if fieldType == "number" || fieldType == "" {
		for _, field := range i.cachedFields.Number {
			if strings.Contains(field, filter) {
				fields = append(fields, field)
			}
		}
	}

	return fields
}

// GetRawQueryResults returns all rows for the user provided SQL query. This function should only be used by other
// plugins. If users should be able to directly access a Clickhouse instance you can expose the instance using the SQL
// plugin.
func (i *instance) GetRawQueryResults(ctx context.Context, query string) ([][]any, []string, error) {
	log.Debug(ctx, "Raw SQL query", zap.String("query", query))

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

	var result [][]any

	for rows.Next() {
		var r []any
		r = make([]any, columnsLen)

		for i := 0; i < columnsLen; i++ {
			r[i] = new(any)
		}

		if err := rows.Scan(r...); err != nil {
			return nil, nil, err
		}

		result = append(result, r)
	}

	return result, columns, nil
}

// New returns a new klogs instance for the given configuration.
func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	parsedDialTimeout := 10 * time.Second
	if config.DialTimeout != "" {
		tmpParsedDialTimeout, err := time.ParseDuration(config.DialTimeout)
		if err != nil {
			parsedDialTimeout = tmpParsedDialTimeout
		}
	}

	parsedConnMaxLifetime := 1 * time.Hour
	if config.ConnMaxLifetime != "" {
		tmpParsedConnMaxLifetime, err := time.ParseDuration(config.ConnMaxLifetime)
		if err != nil {
			parsedConnMaxLifetime = tmpParsedConnMaxLifetime
		}
	}

	if config.MaxIdleConns == 0 {
		config.MaxIdleConns = 5
	}

	if config.MaxOpenConns == 0 {
		config.MaxOpenConns = 10
	}

	client := clickhouse.OpenDB(&clickhouse.Options{
		Addr: strings.Split(config.Address, ","),
		Auth: clickhouse.Auth{
			Database: config.Database,
			Username: config.Username,
			Password: config.Password,
		},
		DialTimeout: parsedDialTimeout,
	})
	client.SetMaxIdleConns(config.MaxIdleConns)
	client.SetMaxOpenConns(config.MaxOpenConns)
	client.SetConnMaxLifetime(parsedConnMaxLifetime)

	instance := &instance{
		name:                name,
		database:            config.Database,
		client:              client,
		materializedColumns: config.MaterializedColumns,
	}

	go instance.refreshCachedFields()
	return instance, nil
}
