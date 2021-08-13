package instance

import (
	"context"
	"fmt"
	"math"
	"sort"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/api/middleware/roundtripper"

	"github.com/prometheus/client_golang/api"
	v1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"github.com/prometheus/common/model"
	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "prometheus"})
)

// Config is the structure of the configuration for a single Prometheus instance.
type Config struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Description string `json:"description"`
	Address     string `json:"address"`
	Username    string `json:"username"`
	Password    string `json:"password"`
	Token       string `json:"token"`
}

// Instance represents a single Prometheus instance, which can be added via the configuration file.
type Instance struct {
	Name                 string
	labelValues          model.LabelValues
	labelValuesLastFetch time.Time
	v1api                v1.API
}

// GetVariable returns all values for a label from the given query. For that we have to retrive the label sets from the
// Prometheus instance and so that we can add the values for the specified label to the values slice.
func (i *Instance) GetVariable(ctx context.Context, label, query, queryType string, timeStart, timeEnd int64) ([]string, error) {
	log.WithFields(logrus.Fields{"query": query}).Tracef("Query variable values")

	labelSets, _, err := i.v1api.Series(ctx, []string{query}, time.Unix(timeStart, 0), time.Unix(timeEnd, 0))
	if err != nil {
		return nil, err
	}

	var values []string
	for _, labelSet := range labelSets {
		if value, ok := labelSet[model.LabelName(label)]; ok {
			values = appendIfMissing(values, string(value))
		}
	}

	sort.Strings(values)

	return values, nil
}

// GetMetrics returns all metrics for all given queries. For each given query we have to make one call to the Prometheus
// API. Then we have to loop through the returned time series and transform them into a format, which can be processed
// by out React UI.
func (i *Instance) GetMetrics(ctx context.Context, queries []Query, resolution string, timeStart, timeEnd int64) ([]Metric, error) {
	steps := getSteps(timeStart, timeEnd)
	if resolution != "" {
		parsedDuration, err := time.ParseDuration(resolution)
		if err == nil {
			steps = parsedDuration
		}
	}

	r := v1.Range{
		Start: time.Unix(timeStart, 0),
		End:   time.Unix(timeEnd, 0),
		Step:  steps,
	}

	var metrics []Metric

	for queryIndex, query := range queries {
		log.WithFields(logrus.Fields{"query": query.Query, "label": query.Label, "resolution": resolution, "start": r.Start, "end": r.End}).Tracef("Query time series")

		result, _, err := i.v1api.QueryRange(ctx, query.Query, r)
		if err != nil {
			return nil, err
		}

		streams, ok := result.(model.Matrix)
		if !ok {
			return nil, err
		}

		for streamIndex, stream := range streams {
			var min float64
			var max float64
			var avg float64
			var count float64

			var data []Datum
			for index, value := range stream.Values {
				timestamp := value.Timestamp.Unix() * 1000
				val := float64(value.Value)

				if math.IsNaN(val) {
					data = append(data, Datum{
						X: timestamp,
					})
				} else {
					avg = avg + val
					count = count + 1

					if index == 0 {
						min = val
						max = val
					} else {
						if val < min {
							min = val
						} else if val > max {
							max = val
						}
					}

					data = append(data, Datum{
						X: timestamp,
						Y: &val,
					})
				}
			}

			if avg != 0 && count != 0 {
				avg = avg / count
			}

			var labels map[string]string
			labels = make(map[string]string)

			for key, value := range stream.Metric {
				labels[string(key)] = string(value)
			}

			label, err := queryInterpolation(query.Label, labels)
			if err != nil {
				metrics = append(metrics, Metric{
					ID:    fmt.Sprintf("%d-%d", queryIndex, streamIndex),
					Label: query.Label,
					Min:   min,
					Max:   max,
					Avg:   avg,
					Data:  data,
				})
			} else {
				if label == "" {
					label = stream.Metric.String()
				}

				metrics = append(metrics, Metric{
					ID:    fmt.Sprintf("%d-%d", queryIndex, streamIndex),
					Label: label,
					Min:   min,
					Max:   max,
					Avg:   avg,
					Data:  data,
				})
			}
		}
	}

	return metrics, nil
}

// GetTableData returns the data, when the user selected the table view for the Prometheus plugin. To get the data we
// are running all prodived queries and join the results by the value for a label of a query. The value for a query is
// added as value-N column. We are also adding all other labels as fields to a single row.
func (i *Instance) GetTableData(ctx context.Context, queries []Query, timeEnd int64) (map[string]map[string]string, error) {
	queryTime := time.Unix(timeEnd, 0)

	var rows map[string]map[string]string
	rows = make(map[string]map[string]string)

	for queryIndex, query := range queries {
		log.WithFields(logrus.Fields{"query": query, "time": queryTime}).Tracef("Query table data")

		result, _, err := i.v1api.Query(ctx, query.Query, queryTime)
		if err != nil {
			return nil, err
		}

		streams, ok := result.(model.Vector)
		if !ok {
			return nil, err
		}

		for _, stream := range streams {
			var labels map[string]string
			labels = make(map[string]string)
			labels[fmt.Sprintf("value-%d", queryIndex+1)] = stream.Value.String()

			for key, value := range stream.Metric {
				labels[string(key)] = string(value)
			}

			label, err := queryInterpolation(query.Label, labels)
			if err != nil {
				return nil, err
			}

			for key, value := range labels {
				if _, ok := rows[label]; !ok {
					rows[label] = make(map[string]string)
				}

				if _, ok := rows[label][key]; !ok {
					rows[label][key] = value
				}

				rows[label][fmt.Sprintf("value-%d", queryIndex+1)] = stream.Value.String()
			}
		}
	}

	return rows, nil
}

// GetLabelValues returns all label values for a configured Prometheus instance. These labels are used to show the user
// a list of suggestions for his entered query. The returned label values from the Prometheus API are cached for one
// hour.
func (i *Instance) GetLabelValues(ctx context.Context, searchTerm string) ([]string, error) {
	now := time.Now()

	// Fetch metric names if last fetch was more then a minute ago
	if i.labelValuesLastFetch.Add(1 * time.Hour).Before(now) {
		labelValues, _, err := i.v1api.LabelValues(ctx, model.MetricNameLabel, nil, now.Add(-1*time.Hour), now)
		if err != nil {
			return nil, err
		}

		i.labelValues = labelValues
		i.labelValuesLastFetch = now
		log.WithFields(logrus.Fields{"instance": i.Name}).Tracef("Get metric names.")
	} else {
		log.WithFields(logrus.Fields{"instance": i.Name}).Tracef("Use cached metric names.")
	}

	var names []string
	for _, name := range i.labelValues {
		if strings.Contains(string(name), searchTerm) {
			names = append(names, string(name))
		}
	}

	return names, nil
}

// New returns a new Prometheus instance for the given configuration.
func New(config Config) (*Instance, error) {
	roundTripper := roundtripper.DefaultRoundTripper

	if config.Username != "" && config.Password != "" {
		roundTripper = roundtripper.BasicAuthTransport{
			Transport: roundTripper,
			Username:  config.Username,
			Password:  config.Password,
		}
	}

	if config.Token != "" {
		roundTripper = roundtripper.TokenAuthTransporter{
			Transport: roundTripper,
			Token:     config.Token,
		}
	}

	client, err := api.NewClient(api.Config{
		Address:      config.Address,
		RoundTripper: roundTripper,
	})
	if err != nil {
		return nil, err
	}

	return &Instance{
		Name:  config.Name,
		v1api: v1.NewAPI(client),
	}, nil
}
