package klogs

import (
	"fmt"
	"strings"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	defaultColumns = "timestamp, cluster, namespace, app, pod_name, container_name, host, fields_string, fields_number, log"
	fieldsMetric   = promauto.NewCounterVec(prometheus.CounterOpts{
		Namespace: "kobs",
		Name:      "klogs_fields_total",
		Help:      "Number how often a field was used in a query.",
	}, []string{"field"})
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
	if contains(i.defaultFields, orderBy) || contains(i.materializedColumns, orderBy) {
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

// appendIfMissing appends a value to a slice, when this values doesn't exist in the slice already.
func appendIfMissing(items []string, item string) []string {
	for _, ele := range items {
		if ele == item {
			return items
		}
	}

	return append(items, item)
}

// contains checks if the given slice of string contains the given item. It returns true when the slice contains the
// given item.
func contains(items []string, item string) bool {
	for _, ele := range items {
		if ele == item {
			return true
		}
	}

	return false
}
