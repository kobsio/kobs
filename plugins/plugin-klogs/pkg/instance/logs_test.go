package instance

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestParseLogsQuery(t *testing.T) {
	for _, tt := range []struct {
		query     string
		where     string
		isInvalid bool
	}{
		{query: "cluster = 'foo' _and_ namespace = 'bar'", where: "cluster='foo' AND namespace='bar'", isInvalid: false},
		{query: "cluster = 'foo' _and_ (namespace='hello' _or_ namespace='world')", where: "cluster='foo' AND (namespace='hello' OR namespace='world')", isInvalid: false},
		{query: "kubernetes.label_foo = 'bar'", where: "fields_string.value[indexOf(fields_string.key, 'kubernetes.label_foo')] = 'bar'", isInvalid: false},
		{query: "kubernetes.label_foo_bar =~ '\\%hellow\\%world\\%'", where: "fields_string.value[indexOf(fields_string.key, 'kubernetes.label_foo_bar')] ILIKE '\\%hellow\\%world\\%'", isInvalid: false},
		{query: "kubernetes.label_foo_bar ~ 'hello.*'", where: "match(fields_string.value[indexOf(fields_string.key, 'kubernetes.label_foo_bar')], 'hello.*')", isInvalid: false},
		{query: "kubernetes.label_foo_bar / 'hello.*'", isInvalid: true},
	} {
		t.Run(tt.query, func(t *testing.T) {
			parsedWhere, err := parseLogsQuery(tt.query, nil)
			if tt.isInvalid {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tt.where, parsedWhere)
			}
		})
	}
}

func TestSplitOperator(t *testing.T) {
	for _, tt := range []struct {
		query             string
		expectedCondition string
		isInvalid         bool
	}{
		{query: "cluster >= 'foo'", expectedCondition: "cluster>='foo'", isInvalid: false},
		{query: "cluster > 'foo'", expectedCondition: "cluster>'foo'", isInvalid: false},
		{query: "cluster <= 'foo'", expectedCondition: "cluster<='foo'", isInvalid: false},
		{query: "cluster < 'foo'", expectedCondition: "cluster<'foo'", isInvalid: false},
		{query: "cluster =~ 'foo'", expectedCondition: "cluster ILIKE 'foo'", isInvalid: false},
		{query: "cluster != 'foo'", expectedCondition: "cluster!='foo'", isInvalid: false},
		{query: "cluster !~ 'foo'", expectedCondition: "cluster NOT ILIKE 'foo'", isInvalid: false},
		{query: "cluster ~ 'foo'", expectedCondition: "match(cluster, 'foo')", isInvalid: false},
		{query: "cluster = 'foo'", expectedCondition: "cluster='foo'", isInvalid: false},
		{query: "_exists_ cluster", expectedCondition: "cluster IS NOT NULL", isInvalid: false},
		{query: " ", expectedCondition: "", isInvalid: false},
		{query: "cluster / 'foo'", isInvalid: true},
	} {
		t.Run(tt.query, func(t *testing.T) {
			actualCondition, err := splitOperator(tt.query, nil)
			if tt.isInvalid {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tt.expectedCondition, actualCondition)
			}
		})
	}
}

func TestHandleConditionParts(t *testing.T) {
	for _, tt := range []struct {
		key               string
		value             string
		operator          string
		expectedCondition string
	}{
		{key: "cluster", value: "'foobar'", operator: "=~", expectedCondition: "cluster ILIKE 'foobar'"},
		{key: "cluster", value: "'foobar'", operator: "!~", expectedCondition: "cluster NOT ILIKE 'foobar'"},
		{key: "cluster", value: "'foobar'", operator: "~", expectedCondition: "match(cluster, 'foobar')"},
		{key: "cluster", value: "'foobar'", operator: "=", expectedCondition: "cluster='foobar'"},
		{key: "helloworld", value: "'foobar'", operator: "=~", expectedCondition: "fields_string.value[indexOf(fields_string.key, 'helloworld')] ILIKE 'foobar'"},
		{key: "helloworld", value: "'foobar'", operator: "!~", expectedCondition: "fields_string.value[indexOf(fields_string.key, 'helloworld')] NOT ILIKE 'foobar'"},
		{key: "helloworld", value: "'foobar'", operator: "~", expectedCondition: "match(fields_string.value[indexOf(fields_string.key, 'helloworld')], 'foobar')"},
		{key: "helloworld", value: "'foobar'", operator: "=", expectedCondition: "fields_string.value[indexOf(fields_string.key, 'helloworld')] = 'foobar'"},
		{key: "helloworld", value: "42", operator: "=~", expectedCondition: "fields_number.value[indexOf(fields_number.key, 'helloworld')] ILIKE 42"},
		{key: "helloworld", value: "42", operator: "!~", expectedCondition: "fields_number.value[indexOf(fields_number.key, 'helloworld')] NOT ILIKE 42"},
		{key: "helloworld", value: "42", operator: "~", expectedCondition: "match(fields_number.value[indexOf(fields_number.key, 'helloworld')], 42)"},
		{key: "helloworld", value: "42", operator: "=", expectedCondition: "fields_number.value[indexOf(fields_number.key, 'helloworld')] = 42"},
	} {
		t.Run(tt.key, func(t *testing.T) {
			actualCondition, _ := handleConditionParts(tt.key, tt.value, tt.operator, nil)
			require.Equal(t, tt.expectedCondition, actualCondition)
		})
	}
}

func TestHandleExistsCondition(t *testing.T) {
	for _, tt := range []struct {
		key               string
		expectedCondition string
	}{
		{key: "cluster", expectedCondition: "cluster IS NOT NULL"},
		{key: "foobar", expectedCondition: "(has(fields_string.key, 'foobar') = 1 OR has(fields_number.key, 'foobar') = 1)"},
	} {
		t.Run(tt.key, func(t *testing.T) {
			actualCondition := handleExistsCondition(tt.key, nil)
			require.Equal(t, tt.expectedCondition, actualCondition)
		})
	}
}

func TestParseOrder(t *testing.T) {
	for _, tt := range []struct {
		order             string
		orderBy           string
		expectedCondition string
	}{
		{order: "", orderBy: "", expectedCondition: "timestamp DESC"},
		{order: "ascending", orderBy: "cluster", expectedCondition: "cluster ASC"},
		{order: "descending", orderBy: "cluster", expectedCondition: "cluster DESC"},
		{order: "ascending", orderBy: "foobar", expectedCondition: "fields_string.value[indexOf(fields_string.key, 'foobar')] ASC, fields_number.value[indexOf(fields_number.key, 'foobar')] ASC"},
	} {
		t.Run(tt.order+tt.orderBy, func(t *testing.T) {
			actualCondition := parseOrder(tt.order, tt.orderBy, nil)
			require.Equal(t, tt.expectedCondition, actualCondition)
		})
	}
}

func TestGetInterval(t *testing.T) {
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
