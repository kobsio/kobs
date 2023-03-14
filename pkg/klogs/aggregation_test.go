package klogs

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/kobsio/kobs/pkg/klogs/parser"
	"github.com/stretchr/testify/require"
)

func TestGenerateFieldName(t *testing.T) {
	for _, tt := range []struct {
		field      string
		mustNumber bool
		expect     string
	}{
		{field: "namespace", mustNumber: false, expect: "namespace"},
		{field: "namespace", mustNumber: false, expect: "namespace"},
		{field: "content_method", mustNumber: false, expect: "fields_string['content_method']"},
		{field: "content_duration", mustNumber: true, expect: "fields_number['content_duration']"},
		{field: "content_duration", mustNumber: false, expect: "fields_number['content_duration']"},
	} {
		t.Run(tt.field, func(t *testing.T) {
			i := instance{
				defaultFields: []string{"namespace"},
			}
			actual := i.generateFieldName(tt.field, nil, Fields{String: nil, Number: []string{"content_duration"}}, tt.mustNumber)
			require.Equal(t, tt.expect, actual)
		})
	}
}

func TestGetOrderBy(t *testing.T) {
	for _, tt := range []struct {
		order  string
		expect string
	}{
		{order: "descending", expect: "DESC"},
		{order: "ascending", expect: "ASC"},
		{order: "foo bar", expect: "ASC"},
	} {
		t.Run(tt.order, func(t *testing.T) {
			actual := getOrderBy(tt.order)
			require.Equal(t, tt.expect, actual)
		})
	}
}

func TestGetAggregation(t *testing.T) {
	t.Run("should be able to aggregate logs when pie chart is selected", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		defaultFields := []string{"namespace", "container_name", "app"}
		instance := instance{
			database:      "logs",
			defaultFields: defaultFields,
			sqlParser:     parser.NewSQLParser(defaultFields, nil),
			querier:       querier,
		}
		aggregation := Aggregation{
			Query: "namespace = 'foo' _AND_ container_name = 'bar'",
			Chart: "pie",
			Times: AggregationTimes{
				TimeStart: time.Now().Add(-time.Hour).Unix(),
				TimeEnd:   time.Now().Unix(),
			},
			Options: AggregationOptions{
				SliceBy:         "app",
				SizeByOperation: "count",
			},
		}

		rows := NewMockRows(ctrl)
		rows.EXPECT().Close().Return(nil)
		rows.EXPECT().Columns().Return([]string{"col1", "col-2"}, nil)
		rows.EXPECT().Next().Return(true)
		rows.EXPECT().Scan(gomock.Any()).DoAndReturn(func(values ...*any) error {
			*values[0] = "col1-result"
			*values[1] = float64(1.24)
			return nil
		})
		rows.EXPECT().Next().Return(false)
		rows.EXPECT().Err().Return(nil)

		// TODO: fix whitespace in this query
		wantQuery := fmt.Sprintf("SELECT app, count(app) as count_data FROM logs.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) AND namespace = 'foo' AND container_name = 'bar' GROUP BY app   SETTINGS skip_unavailable_shards = 1", aggregation.Times.TimeStart, aggregation.Times.TimeEnd)
		querier.EXPECT().QueryContext(gomock.Any(), wantQuery).Return(rows, nil)

		results, cols, err := instance.GetAggregation(context.Background(), aggregation)
		require.NoError(t, err)
		require.Len(t, results, 1)
		require.Len(t, results[0], 2)
		require.Equal(t, "col1-result", results[0]["col1"])
		require.InDelta(t, 1.24, results[0]["col-2"], 1e-6)

		require.Len(t, cols, 2)
		require.Equal(t, "col1", cols[0])
		require.NotNil(t, cols)
	})

	t.Run("should handle invalid chart", func(t *testing.T) {
		instance := instance{}
		aggregation := Aggregation{
			Chart: "unknown",
		}
		_, _, err := instance.GetAggregation(context.Background(), aggregation)
		require.Error(t, err)
		require.Equal(t, "invalid chart type", err.Error())
	})

	t.Run("should handle no SliceBy when pie chart is selected", func(t *testing.T) {
		instance := instance{}
		aggregation := Aggregation{
			Chart: "pie",
		}
		_, _, err := instance.GetAggregation(context.Background(), aggregation)
		require.Error(t, err)
		require.Equal(t, "slice by field is required", err.Error())
	})

	t.Run("should handle no SizeByOperation when pie chart is selected", func(t *testing.T) {
		instance := instance{}
		aggregation := Aggregation{
			Chart: "pie",
			Options: AggregationOptions{
				SliceBy: "app",
			},
		}
		_, _, err := instance.GetAggregation(context.Background(), aggregation)
		require.Error(t, err)
		require.Equal(t, "invalid size by operation", err.Error())
	})

	t.Run("should be able to aggregate logs when bar chart is selected", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		defaultFields := []string{"namespace", "container_name", "app", "timestamp"}
		instance := instance{
			querier:   querier,
			database:  "logs",
			sqlParser: parser.NewSQLParser(defaultFields, nil),
		}
		aggregation := Aggregation{
			Query: "namespace = 'foo' _AND_ container_name = 'bar'",
			Chart: "bar",
			Times: AggregationTimes{
				TimeStart: time.Now().Add(-time.Hour).Unix(),
				TimeEnd:   time.Now().Unix(),
			},
			Options: AggregationOptions{
				HorizontalAxisOperation: "top",
				HorizontalAxisField:     "timestamp",
				VerticalAxisOperation:   "count",
			},
		}

		rows := NewMockRows(ctrl)
		rows.EXPECT().Close().Return(nil)
		rows.EXPECT().Columns().Return([]string{}, nil)
		rows.EXPECT().Next().Return(true)
		rows.EXPECT().Scan(gomock.Any()).Return(nil)
		rows.EXPECT().Next().Return(false)
		rows.EXPECT().Err().Return(nil)
		query := fmt.Sprintf("SELECT fields_string['timestamp'], count(fields_number['timestamp']) as count_data FROM logs.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) AND namespace = 'foo' AND container_name = 'bar' GROUP BY fields_string['timestamp'] ORDER BY count_data ASC  SETTINGS skip_unavailable_shards = 1", aggregation.Times.TimeStart, aggregation.Times.TimeEnd)
		querier.EXPECT().QueryContext(gomock.Any(), query).Return(rows, nil)

		_, _, err := instance.GetAggregation(context.Background(), aggregation)
		require.NoError(t, err)
	})

	t.Run("should handle no HorizontalAxisField when bar chart is selected", func(t *testing.T) {
		instance := instance{}
		aggregation := Aggregation{
			Chart: "bar",
			Options: AggregationOptions{
				HorizontalAxisOperation: "top",
			},
		}
		_, _, err := instance.GetAggregation(context.Background(), aggregation)
		require.Error(t, err)
		require.Equal(t, "horizontal axis field is required", err.Error())
	})

	t.Run("should handle invalid VerticalAxisOperation when bar chart is selected", func(t *testing.T) {
		instance := instance{}
		aggregation := Aggregation{
			Chart: "bar",
			Options: AggregationOptions{
				HorizontalAxisOperation: "top",
				HorizontalAxisField:     "timestamp",
				VerticalAxisOperation:   "unknown",
			},
		}
		_, _, err := instance.GetAggregation(context.Background(), aggregation)
		require.Error(t, err)
		require.Equal(t, "invalid vertical axis operation", err.Error())
	})

	t.Run("should be able to aggregate with bar chart with the option to break down by fields", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		defaultFields := []string{"namespace", "container_name", "app", "timestamp"}
		instance := instance{
			querier:       querier,
			database:      "logs",
			defaultFields: defaultFields,
			sqlParser:     parser.NewSQLParser(defaultFields, nil),
		}
		aggregation := Aggregation{
			Query: "namespace = 'foo' _AND_ container_name = 'bar'",
			Chart: "bar",
			Times: AggregationTimes{
				TimeStart: time.Now().Add(-time.Hour).Unix(),
				TimeEnd:   time.Now().Unix(),
			},
			Options: AggregationOptions{
				BreakDownByFields:       []string{"app"},
				HorizontalAxisOperation: "top",
				HorizontalAxisField:     "timestamp",
				VerticalAxisOperation:   "count",
			},
		}

		rows := NewMockRows(ctrl)
		rows.EXPECT().Close().Return(nil)
		rows.EXPECT().Columns().Return([]string{}, nil)
		rows.EXPECT().Next().Return(true)
		rows.EXPECT().Scan(gomock.Any()).Return(nil)
		rows.EXPECT().Next().Return(false)
		rows.EXPECT().Err().Return(nil)
		query := fmt.Sprintf("SELECT timestamp, app, count(timestamp) as count_data FROM logs.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) AND namespace = 'foo' AND container_name = 'bar' GROUP BY timestamp, app ORDER BY count_data ASC  SETTINGS skip_unavailable_shards = 1", aggregation.Times.TimeStart, aggregation.Times.TimeEnd)
		querier.EXPECT().QueryContext(gomock.Any(), query).Return(rows, nil)

		_, _, err := instance.GetAggregation(context.Background(), aggregation)
		require.NoError(t, err)
	})

	t.Run("should be able to aggregate with bar chart with the option to break down by filters", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		defaultFields := []string{"namespace", "container_name", "app", "timestamp"}
		instance := instance{
			querier:       querier,
			database:      "logs",
			defaultFields: defaultFields,
			sqlParser:     parser.NewSQLParser(defaultFields, nil),
		}
		aggregation := Aggregation{
			Query: "namespace = 'foo' _AND_ container_name = 'bar'",
			Chart: "bar",
			Times: AggregationTimes{
				TimeStart: time.Now().Add(-time.Hour).Unix(),
				TimeEnd:   time.Now().Unix(),
			},
			Options: AggregationOptions{
				BreakDownByFilters:      []string{"app =~ 'hello'"},
				BreakDownByFields:       []string{"app"},
				HorizontalAxisOperation: "top",
				HorizontalAxisField:     "timestamp",
				VerticalAxisOperation:   "count",
			},
		}

		rows := NewMockRows(ctrl)
		rows.EXPECT().Close().Return(nil)
		rows.EXPECT().Columns().Return([]string{}, nil)
		rows.EXPECT().Next().Return(true)
		rows.EXPECT().Scan(gomock.Any()).Return(nil)
		rows.EXPECT().Next().Return(false)
		rows.EXPECT().Err().Return(nil)
		query := fmt.Sprintf("SELECT timestamp, app, countIf(app ILIKE 'hello') as count_data_filter0 FROM logs.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) AND namespace = 'foo' AND container_name = 'bar' GROUP BY timestamp, app   SETTINGS skip_unavailable_shards = 1", aggregation.Times.TimeStart, aggregation.Times.TimeEnd)
		querier.EXPECT().QueryContext(gomock.Any(), query).Return(rows, nil)

		_, _, err := instance.GetAggregation(context.Background(), aggregation)
		require.NoError(t, err)
	})

	t.Run("should be able to aggregate as a timeseries", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		defaultFields := []string{"namespace", "container_name", "app", "timestamp"}
		instance := instance{
			querier:       querier,
			database:      "logs",
			defaultFields: defaultFields,
			sqlParser:     parser.NewSQLParser(defaultFields, nil),
		}
		aggregation := Aggregation{
			Query: "namespace = 'foo' _AND_ container_name = 'bar'",
			Chart: "area",
			Times: AggregationTimes{
				TimeStart: time.Now().Add(-time.Hour).Unix(),
				TimeEnd:   time.Now().Unix(),
			},
			Options: AggregationOptions{
				HorizontalAxisOperation: "time",
				VerticalAxisField:       "request_duration",
				VerticalAxisOperation:   "avg",
				BreakDownByFields:       []string{"app"},
				BreakDownByFilters:      []string{"app =~ 'prefix-%'"},
			},
		}

		rows := NewMockRows(ctrl)
		rows.EXPECT().Close().Return(nil)
		rows.EXPECT().Columns().Return([]string{}, nil)
		rows.EXPECT().Next().Return(true)
		rows.EXPECT().Scan(gomock.Any()).Return(nil)
		rows.EXPECT().Next().Return(false)
		rows.EXPECT().Err().Return(nil)
		query := fmt.Sprintf("SELECT toStartOfInterval(timestamp, INTERVAL 36 second) AS time, app, avgIf(fields_number['request_duration'], app ILIKE 'prefix-%%') as avg_data_filter0 FROM logs.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) AND namespace = 'foo' AND container_name = 'bar' GROUP BY time, app ORDER BY time  SETTINGS skip_unavailable_shards = 1", aggregation.Times.TimeStart, aggregation.Times.TimeEnd)
		querier.EXPECT().QueryContext(gomock.Any(), query).Return(rows, nil)

		_, _, err := instance.GetAggregation(context.Background(), aggregation)
		require.NoError(t, err)
	})
}
