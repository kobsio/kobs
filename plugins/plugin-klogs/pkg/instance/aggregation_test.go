package instance

import (
	"testing"

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
		{field: "content.method", mustNumber: false, expect: "fields_string.value[indexOf(fields_string.key, 'content.method')]"},
		{field: "content.duration", mustNumber: true, expect: "fields_number.value[indexOf(fields_number.key, 'content.duration')]"},
		{field: "content.duration", mustNumber: false, expect: "fields_number.value[indexOf(fields_number.key, 'content.duration')]"},
	} {
		t.Run(tt.field, func(t *testing.T) {
			actual := generateFieldName(tt.field, nil, Fields{String: nil, Number: []string{"content.duration"}}, tt.mustNumber)
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
