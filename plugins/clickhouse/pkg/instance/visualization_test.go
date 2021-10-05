package instance

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestFormatField(t *testing.T) {
	for _, tc := range []struct {
		field  string
		expect string
	}{
		{field: "namespace", expect: "namespace"},
		{field: "'namespace'", expect: "namespace"},
		{field: "'content.method'", expect: "fields_string.value[indexOf(fields_string.key, 'content.method')]"},
		{field: "content.duration", expect: "fields_number.value[indexOf(fields_number.key, 'content.duration')]"},
	} {
		t.Run(tc.field, func(t *testing.T) {
			actual := formatField(tc.field, nil)
			require.Equal(t, tc.expect, actual)
		})
	}
}

func TestFormatOrder(t *testing.T) {
	for _, tc := range []struct {
		order  string
		expect string
	}{
		{order: "descending", expect: "DESC"},
		{order: "ascending", expect: "ASC"},
		{order: "foo bar", expect: "ASC"},
	} {
		t.Run(tc.order, func(t *testing.T) {
			actual := formatOrder(tc.order)
			require.Equal(t, tc.expect, actual)
		})
	}
}
