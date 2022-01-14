package instance

import (
	"context"
	"database/sql"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/log"

	_ "github.com/ClickHouse/clickhouse-go"
	"go.uber.org/zap"
)

// Config is the structure of the configuration for a single klogs instance.
type Config struct {
	Name                string   `json:"name"`
	DisplayName         string   `json:"displayName"`
	Description         string   `json:"description"`
	Address             string   `json:"address"`
	Database            string   `json:"database"`
	Username            string   `json:"username"`
	Password            string   `json:"password"`
	WriteTimeout        string   `json:"writeTimeout"`
	ReadTimeout         string   `json:"readTimeout"`
	MaterializedColumns []string `json:"materializedColumns"`
}

// Instance represents a single klogs instance, which can be added via the configuration file.
type Instance struct {
	Name                string
	database            string
	client              *sql.DB
	materializedColumns []string
	cachedFields        Fields
}

func (i *Instance) getFields(ctx context.Context) (Fields, error) {
	fields := Fields{}
	now := time.Now().Unix()

	for _, fieldType := range []string{"string", "number"} {
		rowsFieldsString, err := i.client.QueryContext(ctx, fmt.Sprintf("SELECT DISTINCT arrayJoin(fields_%s.key) FROM %s.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) SETTINGS skip_unavailable_shards = 1", fieldType, i.database, now-3600, now))
		if err != nil {
			return fields, err
		}
		defer rowsFieldsString.Close()

		for rowsFieldsString.Next() {
			var field string

			if err := rowsFieldsString.Scan(&field); err != nil {
				return fields, err
			}

			if fieldType == "string" {
				fields.String = append(fields.String, field)
			} else if fieldType == "number" {
				fields.Number = append(fields.Number, field)
			}
		}

		if err := rowsFieldsString.Err(); err != nil {
			return fields, err
		}
	}

	return fields, nil
}

// refreshCachedFields retrieves all fields for the last 24 hours and merges them with the already cached fields. To get
// the initial list of cached fields we are running the query before starting the ticker.
func (i *Instance) refreshCachedFields() []string {
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

// GetFields returns all cahced fields which are containing the filter term. The cached fields are refreshed every 24.
func (i *Instance) GetFields(filter string, fieldType string) []string {
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

// GetLogs parses the given query into the sql syntax, which is then run against the ClickHouse instance. The returned
// rows are converted into a document schema which can be used by our UI.
func (i *Instance) GetLogs(ctx context.Context, query, order, orderBy string, limit, timeStart, timeEnd int64) ([]map[string]interface{}, []string, int64, int64, []Bucket, error) {
	var count int64
	var buckets []Bucket
	var documents []map[string]interface{}
	var timeConditions string
	var interval int64

	fields := defaultFields
	queryStartTime := time.Now()

	// When the user provides a query, we have to build the additional conditions for the sql query. This is done via
	// the parseLogsQuery which is responsible for parsing our simple query language and returning the corresponding
	// where statement. These conditions are the added as additional AND to our sql query.
	conditions := ""
	if query != "" {
		parsedQuery, err := parseLogsQuery(query, i.materializedColumns)
		if err != nil {
			return nil, nil, 0, 0, nil, err
		}

		conditions = fmt.Sprintf("AND %s", parsedQuery)
	}

	parsedOrder := parseOrder(order, orderBy, i.materializedColumns)

	// We check that the time range if not 0 or lower then 0, because this would mean that the end time is equal to the
	// start time or before the start time, which results in an error for the following SQL queries.
	if timeEnd-timeStart <= 0 {
		return nil, nil, 0, 0, nil, fmt.Errorf("invalid time range")
	}

	// We have to define the interval for the selected time range. By default we are creating 30 buckets in the
	// following SQL query, but for time ranges with less then 30 seconds we have to create less buckets.
	switch seconds := timeEnd - timeStart; {
	case seconds <= 2:
		interval = (timeEnd - timeStart) / 1
	case seconds <= 10:
		interval = (timeEnd - timeStart) / 5
	case seconds <= 30:
		interval = (timeEnd - timeStart) / 10
	default:
		interval = (timeEnd - timeStart) / 30
	}

	// Now we are creating 30 buckets for the selected time range and count the documents in each bucket. This is used
	// to render the distribution chart, which shows how many documents/rows are available within a bucket.
	sqlQueryBuckets := fmt.Sprintf(`SELECT toStartOfInterval(timestamp, INTERVAL %d second) AS interval_data, count(*) AS count_data FROM %s.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) %s GROUP BY interval_data ORDER BY interval_data WITH FILL FROM toStartOfInterval(FROM_UNIXTIME(%d), INTERVAL %d second) TO toStartOfInterval(FROM_UNIXTIME(%d), INTERVAL %d second) STEP %d SETTINGS skip_unavailable_shards = 1`, interval, i.database, timeStart, timeEnd, conditions, timeStart, interval, timeEnd, interval, interval)
	log.Debug(ctx, "SQL query buckets", zap.String("query", sqlQueryBuckets))
	rowsBuckets, err := i.client.QueryContext(ctx, sqlQueryBuckets)
	if err != nil {
		return nil, nil, 0, 0, nil, err
	}
	defer rowsBuckets.Close()

	for rowsBuckets.Next() {
		var intervalData time.Time
		var countData int64

		if err := rowsBuckets.Scan(&intervalData, &countData); err != nil {
			return nil, nil, 0, 0, nil, err
		}

		buckets = append(buckets, Bucket{
			Interval: intervalData.Unix(),
			Count:    countData,
		})
	}

	if err := rowsBuckets.Err(); err != nil {
		return nil, nil, 0, 0, nil, err
	}

	sort.Slice(buckets, func(i, j int) bool {
		return buckets[i].Interval < buckets[j].Interval
	})

	// To optimize the query to get the raw logs we are creating a new time condition for the where statement. In that
	// way we only have to look into the buckets which are containing some documents only have to include the first N
	// buckets until the limit is reached.
	// When provided a custom order (not "timestamp DESC") we can also optimize the search based on the limit when the
	// user wants to sort the returned documents via "timestamp ASC". For all other order conditions we can only check
	// if the bucket contains some documents, but we can not optimize the results based on the limit.
	if parsedOrder == "timestamp DESC" {
		for i := len(buckets) - 1; i >= 0; i-- {
			if count < limit && buckets[i].Count > 0 {
				bucketTimeStart, bucketTimeEnd := getBucketTimes(interval, buckets[i].Interval, timeStart, timeEnd)

				if timeConditions == "" {
					timeConditions = fmt.Sprintf("(timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d))", bucketTimeStart, bucketTimeEnd)
				} else {
					timeConditions = fmt.Sprintf("%s OR (timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d))", timeConditions, bucketTimeStart, bucketTimeEnd)
				}
			}

			count = count + buckets[i].Count
		}
	} else if parsedOrder == "timestamp ASC" {
		for i := 0; i < len(buckets); i++ {
			if count < limit && buckets[i].Count > 0 {
				bucketTimeStart, bucketTimeEnd := getBucketTimes(interval, buckets[i].Interval, timeStart, timeEnd)

				if timeConditions == "" {
					timeConditions = fmt.Sprintf("(timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d))", bucketTimeStart, bucketTimeEnd)
				} else {
					timeConditions = fmt.Sprintf("%s OR (timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d))", timeConditions, bucketTimeStart, bucketTimeEnd)
				}
			}

			count = count + buckets[i].Count
		}
	} else {
		for i := 0; i < len(buckets); i++ {
			if buckets[i].Count > 0 {
				bucketTimeStart, bucketTimeEnd := getBucketTimes(interval, buckets[i].Interval, timeStart, timeEnd)

				if timeConditions == "" {
					timeConditions = fmt.Sprintf("(timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d))", bucketTimeStart, bucketTimeEnd)
				} else {
					timeConditions = fmt.Sprintf("%s OR (timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d))", timeConditions, bucketTimeStart, bucketTimeEnd)
				}
			}

			count = count + buckets[i].Count
		}
	}

	log.Debug(ctx, "SQL result buckets", zap.Int64("count", count), zap.Any("buckets", buckets))

	// If the count of documents is 0 we can already return the result, because the following query wouldn't return any
	// documents.
	if count == 0 {
		return documents, fields, count, time.Now().Sub(queryStartTime).Milliseconds(), buckets, nil
	}

	// Now we are building and executing our sql query. We always return all fields from the logs table, where the
	// timestamp of a row is within the selected query range and the parsed query. We also order all the results by the
	// timestamp field and limiting the results / using a offset for pagination.
	sqlQueryRawLogs := fmt.Sprintf("SELECT %s FROM %s.logs WHERE (%s) %s ORDER BY %s LIMIT %d SETTINGS skip_unavailable_shards = 1", defaultColumns, i.database, timeConditions, conditions, parsedOrder, limit)
	log.Debug(ctx, "SQL query raw logs", zap.String("query", sqlQueryRawLogs))
	rowsRawLogs, err := i.client.QueryContext(ctx, sqlQueryRawLogs)
	if err != nil {
		return nil, nil, 0, 0, nil, err
	}
	defer rowsRawLogs.Close()

	// Now we are going throw all the returned rows and passing them to the Row struct. After that we are converting
	// each row to a JSON document for the React UI, which contains all the default fields and all the items from the
	// fields_string / fields_number array.
	// When the offset is 0 (user starts a new query) we are also checking all the fields from the nested fields_string
	// and fields_number array and adding them to the fields slice. This slice can then be used by the user in our React
	// UI to show only a list of selected fields in the table.
	for rowsRawLogs.Next() {
		var r Row
		if err := rowsRawLogs.Scan(&r.Timestamp, &r.Cluster, &r.Namespace, &r.App, &r.Pod, &r.Container, &r.Host, &r.FieldsString.Key, &r.FieldsString.Value, &r.FieldsNumber.Key, &r.FieldsNumber.Value, &r.Log); err != nil {
			return nil, nil, 0, 0, nil, err
		}

		var document map[string]interface{}
		document = make(map[string]interface{})
		document["timestamp"] = r.Timestamp
		document["cluster"] = r.Cluster
		document["namespace"] = r.Namespace
		document["app"] = r.App
		document["pod_name"] = r.Pod
		document["container_name"] = r.Container
		document["host"] = r.Host
		document["log"] = r.Log

		for index, field := range r.FieldsNumber.Key {
			document[field] = r.FieldsNumber.Value[index]
			fields = appendIfMissing(fields, field)
		}

		for index, field := range r.FieldsString.Key {
			document[field] = r.FieldsString.Value[index]
			fields = appendIfMissing(fields, field)
		}

		documents = append(documents, document)
	}

	if err := rowsRawLogs.Err(); err != nil {
		return nil, nil, 0, 0, nil, err
	}

	sort.Strings(fields)
	log.Debug(ctx, "SQL result raw logs", zap.Int("documentsCount", len(documents)))

	return documents, fields, count, time.Now().Sub(queryStartTime).Milliseconds(), buckets, nil
}

// GetRawQueryResults returns all rows for the user provided SQL query. This function should only be used by other
// plugins. If users should be able to directly access a Clickhouse instance you can expose the instance using the SQL
// plugin.
func (i *Instance) GetRawQueryResults(ctx context.Context, query string) ([][]interface{}, []string, error) {
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

// New returns a new klogs instance for the given configuration.
func New(config Config) (*Instance, error) {
	if config.WriteTimeout == "" {
		config.WriteTimeout = "30"
	}

	if config.ReadTimeout == "" {
		config.ReadTimeout = "30"
	}

	dns := "tcp://" + config.Address + "?username=" + config.Username + "&password=" + config.Password + "&database=" + config.Database + "&write_timeout=" + config.WriteTimeout + "&read_timeout=" + config.ReadTimeout

	client, err := sql.Open("clickhouse", dns)
	if err != nil {
		log.Error(nil, "Could not initialize database connection", zap.Error(err))
		return nil, err
	}

	instance := &Instance{
		Name:                config.Name,
		database:            config.Database,
		client:              client,
		materializedColumns: config.MaterializedColumns,
	}

	go instance.refreshCachedFields()
	return instance, nil
}
