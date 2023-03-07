package instance

import (
	"bytes"
	"text/template"
)

// appendIfMissing appends a value to a slice, when this values doesn't exist in the slice already.
func appendIfMissing(items []string, item string) []string {
	for _, ele := range items {
		if ele == item {
			return items
		}
	}

	return append(items, item)
}

// queryInterpolation is used to replace variables in a query.
func queryInterpolation(query string, variables map[string]string) (string, error) {
	tpl, err := template.New("query").Delims("{%", "%}").Parse(query)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	err = tpl.Execute(&buf, variables)
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}
