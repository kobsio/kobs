package instance

// Query is the structure of a query. Each query consists of the PromQL query and an optional label, which can be
// displayed in the legend of a chart.
type Query struct {
	Query string `json:"query"`
	Label string `json:"label"`
}

// Metric is the response format for a single metric. Each metric must have an ID and label. We also add the min, max
// and average for the returned data.
type Metric struct {
	ID    string  `json:"id"`
	Label string  `json:"label"`
	Min   float64 `json:"min"`
	Max   float64 `json:"max"`
	Avg   float64 `json:"avg"`
	Data  []Datum `json:"data"`
}

// Datum is the structure of a single data point of a metric. The y value must be a pointer, because when the value is
// NaN we can not set the value (NaN in the JSON representation will throw an error). For that NaN values will always be
// null.
type Datum struct {
	X int64    `json:"x"`
	Y *float64 `json:"y"`
}
