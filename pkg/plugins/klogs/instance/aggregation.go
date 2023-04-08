package instance

import (
	"context"
	"fmt"
	"math"
	"strings"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils"

	"go.uber.org/zap"
)

// Aggregation is the structure of the data, which is required to run an aggregation.
type Aggregation struct {
	Query   string             `json:"query"`
	Chart   string             `json:"chart"`
	Times   AggregationTimes   `json:"times"`
	Options AggregationOptions `json:"options"`
}

// AggregationOptions is the structure of the options for an aggregation. It contains all the fields, which are required
// to build the query for the choosen chart type.
type AggregationOptions struct {
	SliceBy         string `json:"sliceBy"`
	SizeByOperation string `json:"sizeByOperation"`
	SizeByField     string `json:"sizeByField"`

	HorizontalAxisOperation string `json:"horizontalAxisOperation"`
	HorizontalAxisField     string `json:"horizontalAxisField"`
	HorizontalAxisOrder     string `json:"horizontalAxisOrder"`
	HorizontalAxisLimit     string `json:"horizontalAxisLimit"`

	VerticalAxisOperation string `json:"verticalAxisOperation"`
	VerticalAxisField     string `json:"verticalAxisField"`

	BreakDownByFields  []string `json:"breakDownByFields"`
	BreakDownByFilters []string `json:"breakDownByFilters"`
}

// AggregationTimes is the structure, which defines the time interval for the aggregation.
type AggregationTimes struct {
	TimeEnd   int64 `json:"timeEnd"`
	TimeStart int64 `json:"timeStart"`
}

// generateFieldName generates the field name for an aggregation. For that we are using the user defined field and we
// are checking if this field is a default field or a materialized column. If this is the case we can directly use the
// field name. If it is a custom field, we check against the array of the loaded fields to check if it is a string or
// number field.
// We can also directly say that the passed in field must be a number field, e.g. aggregation with the min, max, sum or
// avg operation can only run against number fields.
func (i *instance) generateFieldName(fieldName string, materializedColumns []string, customFields Fields, mustNumber bool) string {
	if utils.Contains(i.defaultFields, fieldName) || utils.Contains(materializedColumns, fieldName) {
		return fieldName
	}

	if mustNumber {
		return fmt.Sprintf("fields_number['%s']", fieldName)
	}

	for _, field := range customFields.Number {
		if field == fieldName {
			return fmt.Sprintf("fields_number['%s']", fieldName)
		}
	}

	return fmt.Sprintf("fields_string['%s']", fieldName)
}

// getOrderBy returns the SQL keyword for the user defined order in the aggregation.
func getOrderBy(order string) string {
	if order == "descending" {
		return "DESC"
	}

	return "ASC"
}

// buildAggregationQuery is our helper function to build the different parts of the SQL statement for the user defined
// chart and aggregation. The function returns the SELECT, GROUP BY, ORDER BY and LIMIT statement for the SQL query, to
// get the results of the aggregation.
func (i *instance) buildAggregationQuery(chart string, options AggregationOptions, customFields Fields, timeStart, timeEnd int64) (string, string, string, string, error) {
	var selectStatement, groupByStatement, orderByStatement, limitByStatement string

	if chart != "pie" && chart != "bar" && chart != "line" && chart != "area" {
		return "", "", "", "", fmt.Errorf("invalid chart type")
	}

	if chart == "pie" {
		if options.SliceBy == "" {
			return "", "", "", "", fmt.Errorf("slice by field is required")
		}

		if options.SizeByOperation != "count" && options.SizeByOperation != "min" && options.SizeByOperation != "max" && options.SizeByOperation != "sum" && options.SizeByOperation != "avg" {
			return "", "", "", "", fmt.Errorf("invalid size by operation")
		}

		if options.SizeByOperation == "count" {
			options.SizeByField = options.SliceBy
		}

		sliceBy := i.generateFieldName(options.SliceBy, i.materializedColumns, customFields, false)
		sizeBy := i.generateFieldName(options.SizeByField, i.materializedColumns, customFields, true)
		selectStatement = fmt.Sprintf("%s, %s(%s) as %s_data", sliceBy, options.SizeByOperation, sizeBy, options.SizeByOperation)
		groupByStatement = sliceBy
		return selectStatement, groupByStatement, "", "", nil
	}

	if chart == "bar" && options.HorizontalAxisOperation == "top" {
		if options.HorizontalAxisField == "" {
			return "", "", "", "", fmt.Errorf("horizontal axis field is required")
		}

		if options.VerticalAxisOperation != "count" && options.VerticalAxisOperation != "min" && options.VerticalAxisOperation != "max" && options.VerticalAxisOperation != "sum" && options.VerticalAxisOperation != "avg" {
			return "", "", "", "", fmt.Errorf("invalid vertical axis operation")
		}

		if len(options.BreakDownByFields) == 0 && len(options.BreakDownByFilters) == 0 {
			if options.VerticalAxisOperation == "count" {
				options.VerticalAxisField = options.HorizontalAxisField
			}

			horizontalAxisField := i.generateFieldName(options.HorizontalAxisField, i.materializedColumns, customFields, false)
			verticalAxisField := i.generateFieldName(options.VerticalAxisField, i.materializedColumns, customFields, true)
			selectStatement = fmt.Sprintf("%s, %s(%s) as %s_data", horizontalAxisField, options.VerticalAxisOperation, verticalAxisField, options.VerticalAxisOperation)
			groupByStatement = horizontalAxisField
			orderByStatement = fmt.Sprintf("%s_data %s", options.VerticalAxisOperation, getOrderBy(options.HorizontalAxisOrder))
			limitByStatement = strings.TrimSpace(options.HorizontalAxisLimit)

			return selectStatement, groupByStatement, orderByStatement, limitByStatement, nil
		} else if len(options.BreakDownByFields) > 0 && len(options.BreakDownByFilters) == 0 {
			if options.VerticalAxisOperation == "count" {
				options.VerticalAxisField = options.HorizontalAxisField
			}

			var breakDownByFields []string
			for _, breakDownByField := range options.BreakDownByFields {
				breakDownByFields = append(breakDownByFields, i.generateFieldName(breakDownByField, i.materializedColumns, customFields, false))
			}

			horizontalAxisField := i.generateFieldName(options.HorizontalAxisField, i.materializedColumns, customFields, false)
			verticalAxisField := i.generateFieldName(options.VerticalAxisField, i.materializedColumns, customFields, true)
			selectStatement = fmt.Sprintf("%s, %s, %s(%s) as %s_data", horizontalAxisField, strings.Join(breakDownByFields, ", "), options.VerticalAxisOperation, verticalAxisField, options.VerticalAxisOperation)
			groupByStatement = fmt.Sprintf("%s, %s", horizontalAxisField, strings.Join(breakDownByFields, ", "))
			orderByStatement = fmt.Sprintf("%s_data %s", options.VerticalAxisOperation, getOrderBy(options.HorizontalAxisOrder))
			limitByStatement = strings.TrimSpace(options.HorizontalAxisLimit)
			return selectStatement, groupByStatement, orderByStatement, limitByStatement, nil
		} else if len(options.BreakDownByFilters) > 0 {
			if options.VerticalAxisOperation == "count" {
				options.VerticalAxisField = options.HorizontalAxisField
			}

			var breakDownByFields []string
			for _, breakDownByField := range options.BreakDownByFields {
				breakDownByFields = append(breakDownByFields, i.generateFieldName(breakDownByField, i.materializedColumns, customFields, false))
			}

			var breakDownByFilters []string
			for _, breakDownByFilter := range options.BreakDownByFilters {
				f, err := i.sqlParser.Parse(breakDownByFilter)
				if err != nil {
					return "", "", "", "", fmt.Errorf("invalid break down filter")
				}

				breakDownByFilters = append(breakDownByFilters, f)
			}

			horizontalAxisField := i.generateFieldName(options.HorizontalAxisField, i.materializedColumns, customFields, false)
			verticalAxisField := i.generateFieldName(options.VerticalAxisField, i.materializedColumns, customFields, true)

			selectStatement = horizontalAxisField
			if len(breakDownByFields) > 0 {
				selectStatement = fmt.Sprintf("%s, %s", selectStatement, strings.Join(breakDownByFields, ", "))
			}

			for index, breakDownByFilter := range breakDownByFilters {
				if options.VerticalAxisOperation == "count" {
					selectStatement = fmt.Sprintf("%s, countIf(%s) as count_data_filter%d", selectStatement, breakDownByFilter, index)
				} else {
					selectStatement = fmt.Sprintf("%s, %sIf(%s, %s) as %s_data_filter%d", selectStatement, options.VerticalAxisOperation, verticalAxisField, breakDownByFilter, options.VerticalAxisOperation, index)
				}
			}

			groupByStatement = horizontalAxisField
			if len(breakDownByFields) > 0 {
				groupByStatement = fmt.Sprintf("%s, %s", groupByStatement, strings.Join(breakDownByFields, ", "))
			}

			limitByStatement = strings.TrimSpace(options.HorizontalAxisLimit)
			return selectStatement, groupByStatement, "", limitByStatement, nil
		}
	}

	if (chart == "bar" || chart == "line" || chart == "area") && options.HorizontalAxisOperation == "time" {
		if options.VerticalAxisField == "" && options.VerticalAxisOperation != "count" {
			return "", "", "", "", fmt.Errorf("vertical axis field is required")
		}

		if options.VerticalAxisOperation != "count" && options.VerticalAxisOperation != "min" && options.VerticalAxisOperation != "max" && options.VerticalAxisOperation != "sum" && options.VerticalAxisOperation != "avg" {
			return "", "", "", "", fmt.Errorf("invalid vertical axis operation")
		}

		var breakDownByFields []string
		for _, breakDownByField := range options.BreakDownByFields {
			breakDownByFields = append(breakDownByFields, i.generateFieldName(breakDownByField, i.materializedColumns, customFields, false))
		}

		var breakDownByFilters []string
		for _, breakDownByFilter := range options.BreakDownByFilters {
			f, err := i.sqlParser.Parse(breakDownByFilter)
			if err != nil {
				return "", "", "", "", fmt.Errorf("invalid break down filter")
			}

			breakDownByFilters = append(breakDownByFilters, f)
		}

		verticalAxisField := i.generateFieldName(options.VerticalAxisField, i.materializedColumns, customFields, true)

		// Create an interval for the selected start and end time, so that we always return the same amount of data
		// points, so that our charts are rendered in the same ways for each selected time range.
		var interval int64
		switch seconds := timeEnd - timeStart; {
		case seconds <= 2:
			interval = (timeEnd - timeStart) / 1
		case seconds <= 10:
			interval = (timeEnd - timeStart) / 5
		case seconds <= 30:
			interval = (timeEnd - timeStart) / 15
		case seconds <= 60:
			interval = (timeEnd - timeStart) / 30
		case seconds <= 120:
			interval = (timeEnd - timeStart) / 60
		default:
			interval = (timeEnd - timeStart) / 100
		}

		selectStatement = fmt.Sprintf("toStartOfInterval(timestamp, INTERVAL %d second) AS time", interval)
		if len(breakDownByFields) > 0 {
			selectStatement = fmt.Sprintf("%s, %s", selectStatement, strings.Join(breakDownByFields, ", "))
		}

		if len(breakDownByFilters) > 0 {
			for index, breakDownByFilter := range breakDownByFilters {
				if options.VerticalAxisOperation == "count" {
					selectStatement = fmt.Sprintf("%s, countIf(%s) as count_data_filter%d", selectStatement, breakDownByFilter, index)
				} else {
					selectStatement = fmt.Sprintf("%s, %sIf(%s, %s) as %s_data_filter%d", selectStatement, options.VerticalAxisOperation, verticalAxisField, breakDownByFilter, options.VerticalAxisOperation, index)
				}
			}
		} else {
			if options.VerticalAxisOperation == "count" {
				selectStatement = fmt.Sprintf("%s, count(*) as count_data", selectStatement)
			} else {
				selectStatement = fmt.Sprintf("%s, %s(%s) as %s_data", selectStatement, options.VerticalAxisOperation, verticalAxisField, options.VerticalAxisOperation)
			}
		}

		groupByStatement = "time"
		if len(breakDownByFields) > 0 {
			groupByStatement = fmt.Sprintf("%s, %s", groupByStatement, strings.Join(breakDownByFields, ", "))
		}

		orderByStatement = "time"

		return selectStatement, groupByStatement, orderByStatement, "", nil
	}

	return "", "", "", "", fmt.Errorf("invalid aggregation")
}

// GetAggregation returns the data for the given aggregation. To get the data we have to build the aggregation query.
// Then we can reuse the parseLogsQuery function from getting the logs, to build the WHERE statement. Finally we are
// running the query and parsing all rows into a map with the column names as keys and the value of each row.
func (i *instance) GetAggregation(ctx context.Context, aggregation Aggregation) ([]map[string]any, []string, error) {
	log.Debug(ctx, "Aggregation data", zap.String("aggregation", fmt.Sprintf("%#v", aggregation)))

	// Build the SELECT, GROUP BY, ORDER BY and LIMIT statement for the SQL query. When the function returns an error
	// the user provided an invalid aggregation. If the function doesn't return a ORDER BY or LIMIT statement we can
	// also omit it in the SQL query.
	selectStatement, groupByStatement, orderByStatement, limitByStatement, err := i.buildAggregationQuery(aggregation.Chart, aggregation.Options, i.cachedFields, aggregation.Times.TimeStart, aggregation.Times.TimeEnd)
	if err != nil {
		return nil, nil, err
	}

	if orderByStatement != "" {
		orderByStatement = "ORDER BY " + orderByStatement
	}

	if limitByStatement != "" {
		limitByStatement = "LIMIT " + limitByStatement
	}

	// To build the conditions (WHERE) we can reuse the logic from getting the logs, because we can use the same query
	// syntax to filter down the aggregation results.
	conditions := ""
	if aggregation.Query != "" {
		parsedQuery, err := i.sqlParser.Parse(aggregation.Query)
		if err != nil {
			return nil, nil, err
		}

		conditions = fmt.Sprintf("AND ( %s )", parsedQuery)
	}

	// Now we are building the final query and then we execute the query. We are saving all returned rows in the result
	// map with the column name as key.
	query := fmt.Sprintf("SELECT %s FROM %s.logs WHERE timestamp >= FROM_UNIXTIME(%d) AND timestamp <= FROM_UNIXTIME(%d) %s GROUP BY %s %s %s SETTINGS skip_unavailable_shards = 1", selectStatement, i.database, aggregation.Times.TimeStart, aggregation.Times.TimeEnd, conditions, groupByStatement, orderByStatement, limitByStatement)
	log.Debug(ctx, "Aggregation query", zap.String("query", query))

	rows, err := i.querier.QueryContext(ctx, query)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, nil, err
	}

	var result []map[string]any

	for rows.Next() {
		values := make([]any, len(columns))
		pointers := make([]any, len(columns))

		for i := range values {
			pointers[i] = &values[i]
		}

		if err := rows.Scan(pointers...); err != nil {
			return nil, nil, err
		}

		// When we assign the correct value to an row, we also have to check if the returned value is of type float and
		// if the value is NaN or Inf, because then the json encoding would fail if we add the value.
		resultMap := make(map[string]any)
		for i, val := range values {
			switch v := val.(type) {
			case float64:
				if !math.IsNaN(v) && !math.IsInf(v, 0) {
					resultMap[columns[i]] = val
				}
			default:
				resultMap[columns[i]] = val
			}
		}

		result = append(result, resultMap)
	}

	if err := rows.Err(); err != nil {
		return nil, nil, err
	}

	return result, columns, nil
}
