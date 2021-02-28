package prometheus

import (
	"bytes"
	"text/template"
	"time"
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

// valueExists checks if an value exists in a slice. When the value exists the function returns true, if not it will
// return false.
func valueExists(items []string, item string) bool {
	for _, ele := range items {
		if ele == item {
			return true
		}
	}

	return false
}

// queryInterpolation is used to replace variables in a query.
func queryInterpolation(query string, variables map[string]string) (string, error) {
	tpl, err := template.New("query").Parse(query)
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

// getSteps returns the duration for the Prometheus resolution for a given start and end time.
func getSteps(start, end int64) time.Duration {
	switch seconds := end - start; {
	case seconds <= 6*3600:
		return time.Duration(30 * time.Second)
	case seconds <= 12*3600:
		return time.Duration(60 * time.Second)
	case seconds <= 24*3600:
		return time.Duration(120 * time.Second)
	case seconds <= 2*24*3600:
		return time.Duration(300 * time.Second)
	case seconds <= 7*24*3600:
		return time.Duration(1800 * time.Second)
	case seconds <= 30*24*3600:
		return time.Duration(3600 * time.Second)
	default:
		return time.Duration((end-start)/1000) * time.Second
	}
}
