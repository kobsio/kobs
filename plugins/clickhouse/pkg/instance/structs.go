package instance

import (
	"time"
)

// FieldString is the struct for the nested fields for all JSON fields of a log line, which are containing a string.
type FieldString struct {
	Key   []string
	Value []string
}

// FieldNumber is the struct for the nested fields for all JSON fields of a log line, which are containing a number.
type FieldNumber struct {
	Key   []string
	Value []float64
}

// Row is the struct which represents a single row in the logs table of ClickHouse.
type Row struct {
	Timestamp    time.Time
	Cluster      string
	Namespace    string
	App          string
	Pod          string
	Container    string
	Host         string
	FieldsString FieldString
	FieldsNumber FieldNumber
	Log          string
}
