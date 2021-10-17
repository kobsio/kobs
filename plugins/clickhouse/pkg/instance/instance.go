package instance

import (
	"context"
	"database/sql"
	"fmt"
	"sort"
	"time"

	_ "github.com/ClickHouse/clickhouse-go"
	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "clickhouse"})
)

// Config is the structure of the configuration for a single ClickHouse instance.
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

// Instance represents a single ClickHouse instance, which can be added via the configuration file.
type Instance struct {
	Name                string
	database            string
	client              *sql.DB
	materializedColumns []string
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
	sqlQueryBuckets := fmt.Sprintf(`SELECT toStartOfInterval(timestamp, INTERVAL %d second) AS interval_data , count(*) AS count_data FROM %s.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) %s GROUP BY interval_data ORDER BY interval_data WITH FILL FROM toStartOfInterval(FROM_UNIXTIME(%d), INTERVAL %d second) TO toStartOfInterval(FROM_UNIXTIME(%d), INTERVAL %d second) STEP %d SETTINGS skip_unavailable_shards = 1`, interval, i.database, timeStart, timeEnd, conditions, timeStart, interval, timeEnd, interval, interval)
	log.WithFields(logrus.Fields{"query": sqlQueryBuckets}).Tracef("sql query buckets")
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

	// We are only returning the first 1000 documents in buckets of the given limit, to speed up the following query
	// to get the documents. For that we are looping through the sorted buckets and using the timestamp from the
	// bucket where the sum of all newer buckets contains 1000 docuemnts.
	// This new start time is then also returned in the response and can be used for the "load more" call as the new
	// start date. In these follow up calls the start time isn't changed again, because we are skipping the count
	// and bucket queries.
	for i := len(buckets) - 1; i >= 0; i-- {
		if count < limit && buckets[i].Count > 0 {
			if timeConditions == "" {
				timeConditions = fmt.Sprintf("(timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d))", buckets[i].Interval, buckets[i].Interval+interval)
			} else {
				timeConditions = fmt.Sprintf("%s OR (timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d))", timeConditions, buckets[i].Interval, buckets[i].Interval+interval)
			}
		}

		count = count + buckets[i].Count
	}

	log.WithFields(logrus.Fields{"count": count, "buckets": buckets}).Tracef("sql result buckets")

	// If the count of documents is 0 we can already return the result, because the following query wouldn't return any
	// documents.
	if count == 0 {
		return documents, fields, count, time.Now().Sub(queryStartTime).Milliseconds(), buckets, nil
	}

	parsedOrder := parseOrder(order, orderBy, i.materializedColumns)

	// Now we are building and executing our sql query. We always return all fields from the logs table, where the
	// timestamp of a row is within the selected query range and the parsed query. We also order all the results by the
	// timestamp field and limiting the results / using a offset for pagination.
	sqlQueryRawLogs := fmt.Sprintf("SELECT %s FROM %s.logs WHERE (%s) %s ORDER BY %s LIMIT %d SETTINGS skip_unavailable_shards = 1", defaultColumns, i.database, timeConditions, conditions, parsedOrder, limit)
	log.WithFields(logrus.Fields{"query": sqlQueryRawLogs}).Tracef("sql query raw logs")
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
	log.WithFields(logrus.Fields{"documents": len(documents)}).Tracef("sql result raw logs")

	return documents, fields, count, time.Now().Sub(queryStartTime).Milliseconds(), buckets, nil
}

// GetAggregation build an aggregation query for the given parameters and returns the result as slice of label, value
// pairs.
func (i *Instance) GetAggregation(ctx context.Context, limit int64, groupBy, operation, operationField, order, query string, timeStart, timeEnd int64) ([]VisualizationRow, error) {
	var data []VisualizationRow

	// As we also do it for the logs query we have to build our where condition for the SQL query first.
	whereConditions := ""
	if query != "" {
		parsedQuery, err := parseLogsQuery(query, i.materializedColumns)
		if err != nil {
			return nil, err
		}

		whereConditions = fmt.Sprintf("timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) AND %s", timeStart, timeEnd, parsedQuery)
	}

	// Now we have to transform all the given fields / values into a format, which we can use in our SQL query. This
	// query is built in the following and then run against ClickHouse. All the returned rows are added to our data
	// slice and returned, so that we can used it later in the React UI.
	groupBy = formatField(groupBy, i.materializedColumns)
	operationField = formatField(operationField, i.materializedColumns)
	order = formatOrder(order)

	sql := fmt.Sprintf("SELECT %s as label, %s(%s) as value FROM %s.logs WHERE %s GROUP BY %s ORDER BY value %s LIMIT %d SETTINGS skip_unavailable_shards = 1", groupBy, operation, operationField, i.database, whereConditions, groupBy, order, limit)
	log.WithFields(logrus.Fields{"query": sql}).Tracef("sql query visualization")
	rows, err := i.client.QueryContext(ctx, sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var r VisualizationRow
		if err := rows.Scan(&r.Label, &r.Value); err != nil {
			return nil, err
		}

		data = append(data, r)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return data, nil
}

// GetRawQueryResults returns all rows for the user provided SQL query. This function should only be used by other
// plugins. If users should be able to directly access a Clickhouse instance you can expose the instance using the SQL
// plugin.
func (i *Instance) GetRawQueryResults(ctx context.Context, query string) ([][]interface{}, []string, error) {
	log.WithFields(logrus.Fields{"query": query}).Tracef("raw sql query")

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

// New returns a new ClickHouse instance for the given configuration.
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
		log.WithError(err).Errorf("could not initialize database connection")
		return nil, err
	}

	// We do not execute the Ping command anymore to increase the reliability of kobs. So that kobs also starts when
	// the ClickHouse instance isn't available during the start of kobs.
	// if err := client.Ping(); err != nil {
	// 	if exception, ok := err.(*clickhouse.Exception); ok {
	// 		log.WithError(err).WithFields(logrus.Fields{"code": exception.Code, "message": exception.Message, "stacktrace": exception.StackTrace}).Errorf("could not ping database")
	// 	} else {
	// 		log.WithError(err).Errorf("could not ping database")
	// 	}

	// 	return nil, err
	// }

	return &Instance{
		Name:                config.Name,
		database:            config.Database,
		client:              client,
		materializedColumns: config.MaterializedColumns,
	}, nil
}
