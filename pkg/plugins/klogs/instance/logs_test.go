package instance

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/kobsio/kobs/pkg/plugins/klogs/instance/parser"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestParseOrder(t *testing.T) {
	i := instance{
		defaultFields:       defaultFields,
		materializedColumns: []string{"faster"},
	}

	for _, tt := range []struct {
		order             string
		orderBy           string
		expectedCondition string
	}{
		{order: "", orderBy: "", expectedCondition: "timestamp DESC"},
		{order: "ascending", orderBy: "cluster", expectedCondition: "cluster ASC"},
		{order: "descending", orderBy: "cluster", expectedCondition: "cluster DESC"},
		{order: "descending", orderBy: "faster", expectedCondition: "faster DESC"},
		{order: "ascending", orderBy: "foobar", expectedCondition: "fields_string['foobar'] ASC, fields_number['foobar'] ASC"},
	} {
		t.Run(tt.order+tt.orderBy, func(t *testing.T) {
			actualCondition := i.parseOrder(tt.order, tt.orderBy)
			require.Equal(t, tt.expectedCondition, actualCondition)
		})
	}
}

func TestGetBucketTimes(t *testing.T) {
	for _, tt := range []struct {
		interval          int64
		bucketTime        int64
		timeStart         int64
		timeEnd           int64
		expectedTimeStart int64
		expectedTimeEnd   int64
	}{
		{interval: 124, bucketTime: 1640188920, timeStart: 1640189016, timeEnd: 1640192745, expectedTimeStart: 1640189016, expectedTimeEnd: 1640189044},
		{interval: 124, bucketTime: 1640190780, timeStart: 1640189016, timeEnd: 1640192745, expectedTimeStart: 1640190780, expectedTimeEnd: 1640190904},
		{interval: 124, bucketTime: 1640192640, timeStart: 1640189016, timeEnd: 1640192745, expectedTimeStart: 1640192640, expectedTimeEnd: 1640192745},
	} {
		t.Run(fmt.Sprintf("%d", tt.bucketTime), func(t *testing.T) {
			actualTimeStart, actualTimeEnd := getBucketTimes(tt.interval, tt.bucketTime, tt.timeStart, tt.timeEnd)
			require.Equal(t, tt.expectedTimeStart, actualTimeStart)
			require.Equal(t, tt.expectedTimeEnd, actualTimeEnd)
		})
	}
}

func TestGetLogs(t *testing.T) {
	t.Run("should return log results", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		instance := instance{
			database:      "logs",
			defaultFields: defaultFields,
			sqlParser:     parser.NewSQLParser(defaultFields, nil),
			querier:       querier,
		}
		timeStart := time.Now().Add(-time.Hour)
		timeEnd := time.Now()

		bucketRows := NewMockRows(ctrl)
		bucketRows.EXPECT().Close().Return(nil)
		bucketRows.EXPECT().Next().Return(true)
		bucketRows.EXPECT().Scan(gomock.Any()).DoAndReturn(func(dest ...any) error {
			intervalData := dest[0].(*time.Time)
			*intervalData = timeStart
			countData := dest[1].(*int64)
			*countData = 16
			return nil
		})
		bucketRows.EXPECT().Next().Return(false)
		bucketRows.EXPECT().Err().Return(nil)
		// TODO: match query
		querier.EXPECT().QueryContext(gomock.Any(), gomock.Any()).Return(bucketRows, nil)

		rowsRawLogs := NewMockRows(ctrl)
		rowsRawLogs.EXPECT().Close().Return(nil)
		rowsRawLogs.EXPECT().Next().Return(true)

		wantRow := Row{
			Timestamp: time.Now(),
			Cluster:   "cluster",
			Namespace: "namespace",
			App:       "app",
			Pod:       "pod",
			Container: "container",
			Host:      "host",
			FieldsString: map[string]string{
				"foo": "bar",
			},
			FieldsNumber: map[string]float64{
				"foo": 1.24,
			},
			Log: "log",
		}
		rowsRawLogs.EXPECT().Scan(gomock.Any()).DoAndReturn(func(dest ...any) error {
			timestamp := dest[0].(*time.Time)
			*timestamp = wantRow.Timestamp

			cluster := dest[1].(*string)
			*cluster = wantRow.Cluster

			namespace := dest[2].(*string)
			*namespace = wantRow.Namespace

			app := dest[3].(*string)
			*app = wantRow.App

			pod := dest[4].(*string)
			*pod = wantRow.Pod

			container := dest[5].(*string)
			*container = wantRow.Container

			host := dest[6].(*string)
			*host = wantRow.Host

			fieldsString := dest[7].(*map[string]string)
			*fieldsString = wantRow.FieldsString

			fieldsNumber := dest[8].(*map[string]float64)
			*fieldsNumber = wantRow.FieldsNumber

			log := dest[9].(*string)
			*log = wantRow.Log

			return nil
		})
		rowsRawLogs.EXPECT().Next().Return(false)
		rowsRawLogs.EXPECT().Err().Return(nil)
		// TODO: match query
		querier.EXPECT().QueryContext(gomock.Any(), gomock.Any()).Return(rowsRawLogs, nil)

		documents, fields, count, took, buckets, err := instance.GetLogs(context.Background(), "namespace = 'foo'", "asc", "namespace", 128, timeStart.Unix(), timeEnd.Unix())
		require.NoError(t, err)
		require.Equal(t, []map[string]interface{}{{
			"timestamp":      wantRow.Timestamp,
			"namespace":      wantRow.Namespace,
			"pod_name":       wantRow.Pod,
			"container_name": wantRow.Container,
			"log":            wantRow.Log,
			"cluster":        wantRow.Cluster,
			"app":            wantRow.App,
			"host":           wantRow.Host,
			"foo":            "bar",
		}}, documents)

		require.Equal(t, []Field{
			{Name: "app", Type: "string"},
			{Name: "cluster", Type: "string"},
			{Name: "container_name", Type: "string"},
			{Name: "foo", Type: "number"},
			{Name: "host", Type: "string"},
			{Name: "log", Type: "string"},
			{Name: "namespace", Type: "string"},
			{Name: "pod_name", Type: "string"},
			{Name: "timestamp", Type: "string"},
		}, fields)
		require.Equal(t, int64(16), count)
		require.Equal(t, int64(0), took) // really 0?
		require.NotNil(t, []Bucket{{Interval: timeStart.Unix(), Count: 16}}, buckets)
	})

	t.Run("should optimize query when order is timestamp DESC", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		instance := instance{
			database:      "logs",
			defaultFields: defaultFields,
			sqlParser:     parser.NewSQLParser(defaultFields, nil),
			querier:       querier,
		}
		timeStart := time.Now().Add(-time.Hour)
		timeEnd := time.Now()

		bucketRows := NewMockRows(ctrl)
		bucketRows.EXPECT().Close().Return(nil)
		bucketRows.EXPECT().Next().Return(true)
		bucketRows.EXPECT().Scan(gomock.Any()).DoAndReturn(func(dest ...any) error {
			intervalData := dest[0].(*time.Time)
			*intervalData = timeStart
			countData := dest[1].(*int64)
			*countData = 16
			return nil
		})
		bucketRows.EXPECT().Next().Return(true)
		bucketRows.EXPECT().Scan(gomock.Any()).DoAndReturn(func(dest ...any) error {
			intervalData := dest[0].(*time.Time)
			*intervalData = timeStart.Add(15 * time.Minute)
			countData := dest[1].(*int64)
			*countData = 0
			return nil
		})
		bucketRows.EXPECT().Next().Return(true)
		bucketRows.EXPECT().Scan(gomock.Any()).DoAndReturn(func(dest ...any) error {
			intervalData := dest[0].(*time.Time)
			*intervalData = timeStart.Add(30 * time.Minute)
			countData := dest[1].(*int64)
			*countData = 16
			return nil
		})
		bucketRows.EXPECT().Next().Return(false)
		bucketRows.EXPECT().Err().Return(nil)
		querier.EXPECT().QueryContext(gomock.Any(), gomock.Any()).Return(bucketRows, nil)

		rowsRawLogs := NewMockRows(ctrl)
		rowsRawLogs.EXPECT().Close().Return(nil)
		rowsRawLogs.EXPECT().Next().Return(false)
		rowsRawLogs.EXPECT().Err().Return(nil)

		interval := time.Duration((timeEnd.Unix()-timeStart.Unix())/30) * time.Second
		firstBucketLeft := timeStart.Unix()
		firstBucketRight := timeStart.Add(interval).Unix()
		secondBucketLeft := timeStart.Add(30 * time.Minute).Unix()
		secondBucketRight := timeStart.Add(30 * time.Minute).Add(interval).Unix()
		wantQuery := fmt.Sprintf("SELECT timestamp, cluster, namespace, app, pod_name, container_name, host, fields_string, fields_number, log FROM logs.logs WHERE ((timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d)) OR (timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d))) AND ( namespace = 'foo' ) ORDER BY timestamp DESC LIMIT 128 SETTINGS skip_unavailable_shards = 1", secondBucketLeft, secondBucketRight, firstBucketLeft, firstBucketRight)
		querier.EXPECT().QueryContext(gomock.Any(), wantQuery).Return(rowsRawLogs, nil)

		_, _, _, _, _, err := instance.GetLogs(context.Background(), "namespace = 'foo'", "desc", "timestamp", 128, timeStart.Unix(), timeEnd.Unix())
		require.NoError(t, err)
	})

	t.Run("should optimize query when order is timestamp ASC", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		instance := instance{
			database:      "logs",
			defaultFields: defaultFields,
			sqlParser:     parser.NewSQLParser(defaultFields, nil),
			querier:       querier,
		}
		timeStart := time.Now().Add(-time.Hour)
		timeEnd := time.Now()

		bucketRows := NewMockRows(ctrl)
		bucketRows.EXPECT().Close().Return(nil)
		bucketRows.EXPECT().Next().Return(true)
		bucketRows.EXPECT().Scan(gomock.Any()).DoAndReturn(func(dest ...any) error {
			intervalData := dest[0].(*time.Time)
			*intervalData = timeStart
			countData := dest[1].(*int64)
			*countData = 16
			return nil
		})
		bucketRows.EXPECT().Next().Return(true)
		bucketRows.EXPECT().Scan(gomock.Any()).DoAndReturn(func(dest ...any) error {
			intervalData := dest[0].(*time.Time)
			*intervalData = timeStart.Add(15 * time.Minute)
			countData := dest[1].(*int64)
			*countData = 0
			return nil
		})
		bucketRows.EXPECT().Next().Return(true)
		bucketRows.EXPECT().Scan(gomock.Any()).DoAndReturn(func(dest ...any) error {
			intervalData := dest[0].(*time.Time)
			*intervalData = timeStart.Add(30 * time.Minute)
			countData := dest[1].(*int64)
			*countData = 16
			return nil
		})
		bucketRows.EXPECT().Next().Return(false)
		bucketRows.EXPECT().Err().Return(nil)
		querier.EXPECT().QueryContext(gomock.Any(), gomock.Any()).Return(bucketRows, nil)

		rowsRawLogs := NewMockRows(ctrl)
		rowsRawLogs.EXPECT().Close().Return(nil)
		rowsRawLogs.EXPECT().Next().Return(false)
		rowsRawLogs.EXPECT().Err().Return(nil)

		interval := time.Duration((timeEnd.Unix()-timeStart.Unix())/30) * time.Second
		firstBucketLeft := timeStart.Unix()
		firstBucketRight := timeStart.Add(interval).Unix()
		secondBucketLeft := timeStart.Add(30 * time.Minute).Unix()
		secondBucketRight := timeStart.Add(30 * time.Minute).Add(interval).Unix()
		wantQuery := fmt.Sprintf("SELECT timestamp, cluster, namespace, app, pod_name, container_name, host, fields_string, fields_number, log FROM logs.logs WHERE ((timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d)) OR (timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d))) AND ( namespace = 'foo' ) ORDER BY timestamp ASC LIMIT 128 SETTINGS skip_unavailable_shards = 1", firstBucketLeft, firstBucketRight, secondBucketLeft, secondBucketRight)
		querier.EXPECT().QueryContext(gomock.Any(), wantQuery).Return(rowsRawLogs, nil)

		_, _, _, _, _, err := instance.GetLogs(context.Background(), "namespace = 'foo'", "ascending", "timestamp", 128, timeStart.Unix(), timeEnd.Unix())
		require.NoError(t, err)
	})
}
