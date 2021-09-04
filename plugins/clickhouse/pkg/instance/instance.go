package instance

import (
	"context"
	"database/sql"
	"fmt"
	"sort"
	"time"

	"github.com/ClickHouse/clickhouse-go"
	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "clickhouse"})
)

// Config is the structure of the configuration for a single ClickHouse instance.
type Config struct {
	Name         string `json:"name"`
	DisplayName  string `json:"displayName"`
	Description  string `json:"description"`
	Address      string `json:"address"`
	Database     string `json:"database"`
	Username     string `json:"username"`
	Password     string `json:"password"`
	WriteTimeout string `json:"writeTimeout"`
	ReadTimeout  string `json:"readTimeout"`
	Type         string `json:"type"`
}

// Instance represents a single ClickHouse instance, which can be added via the configuration file.
type Instance struct {
	Name     string
	database string
	client   *sql.DB
}

// GetSQL returns all rows for the user provided SQL query.
func (i *Instance) GetSQL(ctx context.Context, query string) ([][]interface{}, []string, error) {
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

// GetLogs parses the given query into the sql syntax, which is then run against the ClickHouse instance. The returned
// rows are converted into a document schema which can be used by our UI.
func (i *Instance) GetLogs(ctx context.Context, query string, limit, offset, timeStart, timeEnd int64) ([]map[string]interface{}, []string, int64, int64, []Bucket, int64, int64, error) {
	var count int64
	var buckets []Bucket
	var documents []map[string]interface{}
	fields := defaultFields
	queryStartTime := time.Now()

	// When the user provides a query, we have to build the additional conditions for the sql query. This is done via
	// the parseLogsQuery which is responsible for parsing our simple query language and returning the corresponding
	// where statement. These conditions are the added as additional AND to our sql query.
	conditions := ""
	if query != "" {
		parsedQuery, err := parseLogsQuery(query)
		if err != nil {
			return nil, nil, 0, 0, nil, offset, timeStart, err
		}

		conditions = fmt.Sprintf("AND %s", parsedQuery)
	}

	// The count of documents and the buckets are only needed for the first query where the offset is 0. For the
	// following queries we can reuse the data returned by the first query, because the number of documents shouldn't
	// change in the selected time range.
	if offset == 0 {
		// Determine the number of documents, which are available in the users selected time range. We are using the same
		// query as to get the documents, but we are skipping the limit and offset parameters.
		sqlQueryCount := fmt.Sprintf("SELECT count(*) FROM %s.logs WHERE timestamp >= ? AND timestamp <= ? %s SETTINGS skip_unavailable_shards = 1", i.database, conditions)
		log.WithFields(logrus.Fields{"query": sqlQueryCount, "timeStart": timeStart, "timeEnd": timeEnd}).Tracef("sql count query")
		rowsCount, err := i.client.QueryContext(ctx, sqlQueryCount, time.Unix(timeStart, 0), time.Unix(timeEnd, 0))
		if err != nil {
			return nil, nil, 0, 0, nil, offset, timeStart, err
		}
		defer rowsCount.Close()

		for rowsCount.Next() {
			if err := rowsCount.Scan(&count); err != nil {
				return nil, nil, 0, 0, nil, offset, timeStart, err
			}
		}

		// If the document count returns zero documents we can skip the other database calls and immediately return the
		// result of the API request.
		if count == 0 {
			return nil, nil, count, time.Now().Sub(queryStartTime).Milliseconds(), nil, offset, timeStart, nil
		}

		// Now we are creating 30 buckets for the selected time range and count the documents in each bucket. This is used
		// to render the distribution chart, which shows how many documents/rows are available within a bucket.
		interval := (timeEnd - timeStart) / 30
		sqlQueryBuckets := fmt.Sprintf("SELECT toStartOfInterval(timestamp, INTERVAL %d second) AS interval_data , count(*) AS count_data FROM %s.logs WHERE timestamp >= ? AND timestamp <= ? %s GROUP BY interval_data SETTINGS skip_unavailable_shards = 1", interval, i.database, conditions)
		log.WithFields(logrus.Fields{"query": sqlQueryBuckets, "timeStart": timeStart, "timeEnd": timeEnd}).Tracef("sql buckets query")
		rowsBuckets, err := i.client.QueryContext(ctx, sqlQueryBuckets, time.Unix(timeStart, 0), time.Unix(timeEnd, 0))
		if err != nil {
			return nil, nil, 0, 0, nil, offset, timeStart, err
		}
		defer rowsBuckets.Close()

		for rowsBuckets.Next() {
			var intervalData time.Time
			var countData int64

			if err := rowsBuckets.Scan(&intervalData, &countData); err != nil {
				return nil, nil, 0, 0, nil, offset, timeStart, err
			}

			buckets = append(buckets, Bucket{
				Interval:          intervalData.Unix(),
				IntervalFormatted: "",
				Count:             countData,
				// Formatting is handled on the client side.
				// IntervalFormatted: intervalData.Format("01-02 15:04:05"),
			})
		}

		sort.Slice(buckets, func(i, j int) bool {
			return buckets[i].Interval < buckets[j].Interval
		})

		// We are only returning the first 10000 documents in buckets of the given limit, to speed up the following
		// query to get the documents. For that we are looping through the sorted buckets and using the timestamp from
		// the bucket where the sum of all newer buckets contains 10000 docuemnts.
		// This new start time is then also returned in the response and can be used for the "load more" call as the new
		// start date. In these follow up calls the start time isn't changed again, because we are skipping the count
		// and bucket queries.
		// NOTE: If a user has problems with this limit in the future, we can provide an option for this via the
		// config.yaml file or maybe even better via an additional field in the Options component in the React UI.
		var bucketCount int64
		for i := len(buckets) - 1; i >= 0; i-- {
			bucketCount = bucketCount + buckets[i].Count
			if bucketCount > 10000 {
				timeStart = buckets[i].Interval
				break
			}
		}
	}

	// Now we are building and executing our sql query. We always return all fields from the logs table, where the
	// timestamp of a row is within the selected query range and the parsed query. We also order all the results by the
	// timestamp field and limiting the results / using a offset for pagination.
	sqlQuery := fmt.Sprintf("SELECT %s FROM %s.logs WHERE timestamp >= ? AND timestamp <= ? %s ORDER BY timestamp DESC LIMIT %d OFFSET %d SETTINGS skip_unavailable_shards = 1", defaultColumns, i.database, conditions, limit, offset)
	log.WithFields(logrus.Fields{"query": sqlQuery, "timeStart": timeStart, "timeEnd": timeEnd}).Tracef("sql query")
	rows, err := i.client.QueryContext(ctx, sqlQuery, time.Unix(timeStart, 0), time.Unix(timeEnd, 0))
	if err != nil {
		return nil, nil, 0, 0, nil, offset, timeStart, err
	}
	defer rows.Close()

	// Now we are going throw all the returned rows and passing them to the Row struct. After that we are converting
	// each row to a JSON document for the React UI, which contains all the default fields and all the items from the
	// fields_string / fields_number array.
	// When the offset is 0 (user starts a new query) we are also checking all the fields from the nested fields_string
	// and fields_number array and adding them to the fields slice. This slice can then be used by the user in our React
	// UI to show only a list of selected fields in the table.
	for rows.Next() {
		var r Row
		if err := rows.Scan(&r.Timestamp, &r.Cluster, &r.Namespace, &r.App, &r.Pod, &r.Container, &r.Host, &r.FieldsString.Key, &r.FieldsString.Value, &r.FieldsNumber.Key, &r.FieldsNumber.Value, &r.Log); err != nil {
			return nil, nil, 0, 0, nil, offset, timeStart, err
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

			if offset == 0 {
				fields = appendIfMissing(fields, field)
			}
		}

		for index, field := range r.FieldsString.Key {
			document[field] = r.FieldsString.Value[index]

			if offset == 0 {
				fields = appendIfMissing(fields, field)
			}
		}

		documents = append(documents, document)
	}

	if err := rows.Err(); err != nil {
		return nil, nil, 0, 0, nil, offset, timeStart, err
	}

	sort.Strings(fields)
	return documents, fields, count, time.Now().Sub(queryStartTime).Milliseconds(), buckets, offset + limit, timeStart, nil
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

	if err := client.Ping(); err != nil {
		if exception, ok := err.(*clickhouse.Exception); ok {
			log.WithError(err).WithFields(logrus.Fields{"code": exception.Code, "message": exception.Message, "stacktrace": exception.StackTrace}).Errorf("could not ping database")
		} else {
			log.WithError(err).Errorf("could not ping database")
		}

		return nil, err
	}

	return &Instance{
		Name:     config.Name,
		database: config.Database,
		client:   client,
	}, nil
}
