package instance

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils"

	"go.uber.org/zap"
)

func (i *instance) parseOrder(order, orderBy string) string {
	if order == "" || orderBy == "" {
		return "timestamp DESC"
	}

	if order == "ascending" {
		order = "ASC"
	} else {
		order = "DESC"
	}

	orderBy = strings.TrimSpace(orderBy)
	if utils.Contains(i.defaultFields, orderBy) || utils.Contains(i.materializedColumns, orderBy) {
		return fmt.Sprintf("%s %s", orderBy, order)
	}

	return fmt.Sprintf("fields_string['%s'] %s, fields_number['%s'] %s", orderBy, order, orderBy, order)
}

// getBucketTimes determines the start and end time of an bucket. This is necessary, because the first and last bucket
// time can be outside of the user defined time range.
func getBucketTimes(interval, bucketTime, timeStart, timeEnd int64) (int64, int64) {
	if bucketTime < timeStart {
		return timeStart, timeStart + interval - (timeStart - bucketTime)
	}

	if bucketTime+interval > timeEnd {
		return bucketTime, bucketTime + timeEnd - bucketTime
	}

	return bucketTime, bucketTime + interval
}

// GetLogs parses the given query into the sql syntax, which is then run against the ClickHouse instance. The returned
// rows are converted into a document schema which can be used by our UI.
func (i *instance) GetLogs(ctx context.Context, query, order, orderBy string, limit, timeStart, timeEnd int64) ([]map[string]any, []string, int64, int64, []Bucket, error) {
	var count int64
	var buckets []Bucket
	var documents []map[string]any
	var timeConditions string

	fields := i.defaultFields
	queryStartTime := time.Now()

	// When the user provides a query, we have to build the additional conditions for the sql query. This is done via
	// the parseLogsQuery which is responsible for parsing our simple query language and returning the corresponding
	// where statement. These conditions are the added as additional AND to our sql query.
	conditions := ""
	if query != "" {
		parsedQuery, err := i.sqlParser.Parse(query)
		if err != nil {
			return nil, nil, 0, 0, nil, err
		}

		conditions = fmt.Sprintf("AND ( %s )", parsedQuery)
	}

	parsedOrder := i.parseOrder(order, orderBy)

	// We check that the time range if not 0 or lower then 0, because this would mean that the end time is equal to the
	// start time or before the start time, which results in an error for the following SQL queries.
	if timeEnd-timeStart <= 0 {
		return nil, nil, 0, 0, nil, fmt.Errorf("invalid time range")
	}

	var interval int64 = 1
	if seconds := timeEnd - timeStart; seconds >= 30 {
		interval = seconds / 30
	}

	// Now we are creating 30 buckets for the selected time range and count the documents in each bucket. This is used
	// to render the distribution chart, which shows how many documents/rows are available within a bucket.
	sqlQueryBuckets := fmt.Sprintf(`SELECT toStartOfInterval(timestamp, INTERVAL %d second) AS interval_data, count(*) AS count_data FROM %s.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) %s GROUP BY interval_data ORDER BY interval_data WITH FILL FROM toStartOfInterval(FROM_UNIXTIME(%d), INTERVAL %d second) TO toStartOfInterval(FROM_UNIXTIME(%d), INTERVAL %d second) STEP %d SETTINGS skip_unavailable_shards = 1`, interval, i.database, timeStart, timeEnd, conditions, timeStart, interval, timeEnd, interval, interval)
	log.Debug(ctx, "SQL query buckets", zap.String("query", sqlQueryBuckets))
	rowsBuckets, err := i.querier.QueryContext(ctx, sqlQueryBuckets)
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
				// To optimize the query to get the raw logs we are creating a new time condition for
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
	sqlQueryRawLogs := fmt.Sprintf("SELECT %s FROM %s.logs WHERE (%s) %s ORDER BY %s LIMIT %d SETTINGS skip_unavailable_shards = 1", strings.Join(defaultFieldsSQL, ", "), i.database, timeConditions, conditions, parsedOrder, limit)
	log.Debug(ctx, "SQL query raw logs", zap.String("query", sqlQueryRawLogs))
	rowsRawLogs, err := i.querier.QueryContext(ctx, sqlQueryRawLogs)
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
		if err := rowsRawLogs.Scan(&r.Timestamp, &r.Cluster, &r.Namespace, &r.App, &r.Pod, &r.Container, &r.Host, &r.FieldsString, &r.FieldsNumber, &r.Log); err != nil {
			return nil, nil, 0, 0, nil, err
		}

		var document map[string]any
		document = make(map[string]any)
		document["timestamp"] = r.Timestamp
		document["cluster"] = r.Cluster
		document["namespace"] = r.Namespace
		document["app"] = r.App
		document["pod_name"] = r.Pod
		document["container_name"] = r.Container
		document["host"] = r.Host
		document["log"] = r.Log

		for k, v := range r.FieldsNumber {
			document[k] = v
			fields = utils.AppendIfStringIsMissing(fields, k)
		}

		for k, v := range r.FieldsString {
			document[k] = v
			fields = utils.AppendIfStringIsMissing(fields, k)
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
