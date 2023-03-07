package instance

// Query is the structure of a query. Each query consists of the PromQL query and an optional label, which can be
// displayed in the legend of a chart.
type Query struct {
	Query string `json:"query"`
	Label string `json:"label"`
}

// Metrics is the structure for the returned metrics from the Prometheus metrics API endpoint. It contains a list of
// metrics, the start and end time for the query and the min and max value accross all time series.
type Metrics struct {
	StartTime int64    `json:"startTime"`
	EndTime   int64    `json:"endTime"`
	Min       float64  `json:"min"`
	Max       float64  `json:"max"`
	Metrics   []Metric `json:"metrics"`
}

// Metric is the response format for a single metric. Each metric must have an ID and label. We also add the min, max
// and average for the returned data.
type Metric struct {
	ID      string   `json:"id"`
	Label   string   `json:"label"`
	Min     float64  `json:"min"`
	Max     float64  `json:"max"`
	Avg     float64  `json:"avg"`
	Current *float64 `json:"current"`
	Data    []Datum  `json:"data"`
}

// Datum is the structure of a single data point of a metric. The y value must be a pointer, because when the value is
// NaN we can not set the value (NaN in the JSON representation will throw an error). For that NaN values will always be
// null.
type Datum struct {
	X int64    `json:"x"`
	Y *float64 `json:"y"`
}
