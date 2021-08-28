package instance

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestParseLogsQuery(t *testing.T) {
	for _, tc := range []struct {
		query     string
		where     string
		isInvalid bool
	}{
		{query: "cluster = 'foo' _and_ namespace = 'bar'", where: "cluster='foo' AND namespace='bar'", isInvalid: false},
		{query: "cluster = 'foo' _and_ (namespace='hello' _or_ namespace='world')", where: "cluster='foo' AND (namespace='hello' OR namespace='world')", isInvalid: false},
		{query: "kubernetes.label_foo = 'bar'", where: "fields_string.value[indexOf(fields_string.key, 'kubernetes.label_foo')] = 'bar'", isInvalid: false},
	} {
		t.Run(tc.query, func(t *testing.T) {
			parsedWhere, err := parseLogsQuery(tc.query)
			if tc.isInvalid {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tc.where, parsedWhere)
			}
		})
	}
}
