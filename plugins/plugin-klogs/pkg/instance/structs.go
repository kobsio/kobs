package instance

import (
	"time"
)

// Fields is the struct for cached fields, which can be of type number or string.
type Fields struct {
	String []string
	Number []string
}

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

// Bucket is the struct which is used to represent the distribution of the returned rows for a logs query for the given
// time range.
type Bucket struct {
	Interval int64 `json:"interval"`
	Count    int64 `json:"count"`
}

// VisualizationRow is the structure of a single row for a visualization.
type VisualizationRow struct {
	Label string  `json:"label"`
	Value float64 `json:"value"`
}
