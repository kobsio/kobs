package instance

import (
	"fmt"
	"strings"
)

// formatField returns the SQL syntax for the given field. If the field is of type string and not in the default fields
// or materialized columns list it must be wrapped in single quotes.
func formatField(field string, materializedColumns []string) string {
	field = strings.TrimSpace(field)

	if contains(defaultFields, field) || contains(materializedColumns, field) {
		return field
	}

	if string(field[0]) == "'" && string(field[len(field)-1]) == "'" {
		field = field[1 : len(field)-1]

		if contains(defaultFields, field) || contains(materializedColumns, field) {
			return field
		}

		return fmt.Sprintf("fields_string.value[indexOf(fields_string.key, '%s')]", field)
	}

	return fmt.Sprintf("fields_number.value[indexOf(fields_number.key, '%s')]", field)
}

// formatOrder returns the order key word which can be used in the SQL query for the given input.
func formatOrder(order string) string {
	if order == "descending" {
		return "DESC"
	}

	return "ASC"
}
