package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance, Querier, Rows

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/klogs/instance/parser"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/mitchellh/mapstructure"
	"go.uber.org/zap"
)

var defaultFields = []string{"timestamp", "cluster", "namespace", "app", "pod_name", "container_name", "host", "log"}
var defaultFieldsSQL = []string{"timestamp", "cluster", "namespace", "app", "pod_name", "container_name", "host", "fields_string", "fields_number", "log"}

// Config is the structure of the configuration for a single klogs instance.
type Config struct {
	Address             string         `json:"address"`
	Database            string         `json:"database"`
	Username            string         `json:"username"`
	Password            string         `json:"password"`
	DialTimeout         string         `json:"dialTimeout"`
	ConnMaxLifetime     string         `json:"connMaxLifetime"`
	MaxIdleConns        int            `json:"maxIdleConns"`
	MaxOpenConns        int            `json:"maxOpenConns"`
	MaterializedColumns []string       `json:"materializedColumns"`
	Settings            map[string]any `json:"settings"`
}

type Instance interface {
	GetName() string
	getFields() (Fields, error)
	refreshCachedFields() []string
	GetFields(filter string, fieldType string) []string
	GetLogs(ctx context.Context, query, order, orderBy string, limit, timeStart, timeEnd int64) ([]map[string]any, []Field, int64, int64, []Bucket, error)
	GetAggregation(ctx context.Context, aggregation Aggregation) ([]map[string]any, []string, error)
}

// Rows is an interface closely related to the sql.Rows interface
// we define our own, to be able to create a mock implementation in our tests
type Rows interface {
	Close() error
	Columns() ([]string, error)
	Err() error
	Next() bool
	Scan(dest ...any) error
}

// Rows is an interface closely related to the sql.DB struct
// Defining this interface here allows us to replace the database implementation with a mock in the tests.
type Querier interface {
	QueryContext(ctx context.Context, query string, args ...any) (Rows, error)
}

// Instance represents a single klogs instance, which can be added via the configuration file.
type instance struct {
	name                string
	database            string
	querier             Querier
	materializedColumns []string
	cachedFields        Fields
	defaultFields       []string
	sqlParser           parser.SQLParser
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) getFields() (Fields, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	fields := Fields{}
	now := time.Now().Unix()

	for _, fieldType := range []string{"string", "number"} {
		rowsFieldKeys, err := i.querier.QueryContext(ctx, fmt.Sprintf("SELECT DISTINCT arrayJoin(mapKeys(fields_%s)) FROM %s.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) SETTINGS skip_unavailable_shards = 1", fieldType, i.database, now-3600, now))
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
	ctx := context.Background()

	fields, err := i.getFields()
	if err != nil {
		log.Error(ctx, "Failed to refresh cached fields", zap.Error(err))
	} else {
		log.Info(ctx, "Refreshed fields", zap.Int("stringFieldsCount", len(fields.String)), zap.Int("numberFieldsCount", len(fields.Number)))
		i.cachedFields = fields
	}

	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for {
		<-ticker.C

		fields, err := i.getFields()
		if err != nil {
			log.Error(ctx, "Failed to refresh cached fields", zap.Error(err))
		} else {
			log.Info(ctx, "Refreshed fields", zap.Int("stringFieldsCount", len(fields.String)), zap.Int("numberFieldsCount", len(fields.Number)))

			for _, field := range fields.String {
				i.cachedFields.String = utils.AppendIfStringIsMissing(i.cachedFields.String, field)
			}

			for _, field := range fields.Number {
				i.cachedFields.Number = utils.AppendIfStringIsMissing(i.cachedFields.Number, field)
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

		fields = append(fields, i.defaultFields...)
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

type sqlQuerier struct {
	client *sql.DB
}

// QueryContext is a small wrapper around sql.DB's QueryContext.
// This wrapper is introduced to be able to mock the func Querier.QueryContext and the Rows interface in tests.
func (s *sqlQuerier) QueryContext(ctx context.Context, query string, args ...any) (Rows, error) {
	rows, err := s.client.QueryContext(ctx, query, args)
	if err != nil {
		return nil, err
	}

	return Rows(rows), nil
}

func newQuerierFromConfig(config Config) Querier {
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
		Settings:    config.Settings,
	})
	client.SetMaxIdleConns(config.MaxIdleConns)
	client.SetMaxOpenConns(config.MaxOpenConns)
	client.SetConnMaxLifetime(parsedConnMaxLifetime)

	return &sqlQuerier{client}
}

// New returns a new klogs instance for the given configuration.
func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	instance := &instance{
		name:                name,
		database:            config.Database,
		querier:             newQuerierFromConfig(config),
		defaultFields:       defaultFields,
		materializedColumns: config.MaterializedColumns,
		sqlParser:           parser.NewSQLParser(defaultFields, nil),
	}

	go instance.refreshCachedFields()
	return instance, nil
}
