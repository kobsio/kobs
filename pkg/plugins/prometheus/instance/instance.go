package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"context"
	"fmt"
	"math"
	"net/http"
	"net/http/httputil"
	"net/url"
	"sort"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/utils/middleware/roundtripper"

	"github.com/mitchellh/mapstructure"
	"github.com/prometheus/client_golang/api"
	v1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"github.com/prometheus/common/model"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
	"go.uber.org/zap"
)

// Config is the structure of the configuration for a single Prometheus instance.
type Config struct {
	Address  string `json:"address"`
	Username string `json:"username"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

// Instance is the interface for a single Prometheus instance, which can be added via the configuration file.
type Instance interface {
	GetName() string
	GetVariable(ctx context.Context, label, query, queryType string, timeStart, timeEnd int64) ([]string, error)
	GetRange(ctx context.Context, queries []Query, resolution string, timeStart, timeEnd int64) (*Metrics, error)
	GetInstant(ctx context.Context, queries []Query, timeEnd int64) (map[string]map[string]string, error)
	Proxy(w http.ResponseWriter, r *http.Request)
}

type instance struct {
	name   string
	config Config
	v1api  v1.API
}

// GetName returns the name of the current Prometheus instance.
func (i *instance) GetName() string {
	return i.name
}

// GetVariable returns all values for a label from the given query. For that we have to retrive the label sets from the
// Prometheus instance and so that we can add the values for the specified label to the values slice.
func (i *instance) GetVariable(ctx context.Context, label, query, queryType string, timeStart, timeEnd int64) ([]string, error) {
	log.Debug(ctx, "Query variable values", zap.String("query", query), zap.String("queryType", queryType))

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

// GetRange returns the metrics for all provided queries in the provided time range. For each given query we have to
// make one call to the Prometheus API. Then we have to loop through the returned time series and transform them into a
// format, which can be processed by out React app.
func (i *instance) GetRange(ctx context.Context, queries []Query, resolution string, timeStart, timeEnd int64) (*Metrics, error) {
	steps := time.Duration((timeEnd-timeStart)/50) * time.Second
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

	globalTimeStart := timeStart * 1000
	globalTimeEnd := timeEnd * 1000

	var globalMin float64
	var globalMax float64
	var metrics []Metric

	for queryIndex, query := range queries {
		log.Debug(ctx, "Query time series", zap.String("query", query.Query), zap.String("label", query.Label), zap.String("resolution", resolution), zap.Time("start", r.Start), zap.Time("end", r.End))

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

				// Determine the start and end time accross all series. In the React UI this is used to define the min
				// and max value for x axis of the chart.
				if timestamp < globalTimeStart {
					globalTimeStart = timestamp
				} else if timestamp > globalTimeEnd {
					globalTimeEnd = timestamp
				}

				if math.IsNaN(val) || math.IsInf(val, 0) {
					data = append(data, Datum{
						X: timestamp,
					})
				} else {
					// Determine the min and max value accross all series. In the React UI this is used to define the
					// min and max value for the y axis of the chart.
					if queryIndex == 0 && streamIndex == 0 && index == 0 {
						globalMin = val
						globalMax = val
					} else {
						if val < globalMin {
							globalMin = val
						} else if val > globalMax {
							globalMax = val
						}
					}

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

			labels := make(map[string]string)

			for key, value := range stream.Metric {
				labels[string(key)] = string(value)
			}

			label, err := queryInterpolation(query.Label, labels)
			if err != nil {
				metrics = append(metrics, Metric{
					ID:      fmt.Sprintf("%d-%d", queryIndex, streamIndex),
					Name:    query.Label,
					Min:     min,
					Max:     max,
					Avg:     avg,
					Current: data[len(data)-1].Y,
					Data:    data,
				})
			} else {
				if label == "" {
					label = stream.Metric.String()
				}

				metrics = append(metrics, Metric{
					ID:      fmt.Sprintf("%d-%d", queryIndex, streamIndex),
					Name:    label,
					Min:     min,
					Max:     max,
					Avg:     avg,
					Current: data[len(data)-1].Y,
					Data:    data,
				})
			}
		}
	}

	return &Metrics{
		StartTime: globalTimeStart,
		EndTime:   globalTimeEnd,
		Min:       globalMin,
		Max:       globalMax,
		Metrics:   metrics,
	}, nil
}

// GetInstant returns the metrics for the provided queries at the given timestamp. The returned data from the Prometheus
// API is joined by the value for a label of a query. The value for a query is added as value-N column. We are also
// adding all other labels as fields to a single row.
func (i *instance) GetInstant(ctx context.Context, queries []Query, timeEnd int64) (map[string]map[string]string, error) {
	queryTime := time.Unix(timeEnd, 0)

	rows := make(map[string]map[string]string)

	for queryIndex, query := range queries {
		log.Debug(ctx, "Query table data", zap.String("query", query.Query), zap.String("label", query.Label), zap.Time("time", queryTime))

		result, _, err := i.v1api.Query(ctx, query.Query, queryTime)
		if err != nil {
			return nil, err
		}

		streams, ok := result.(model.Vector)
		if !ok {
			return nil, err
		}

		for _, stream := range streams {
			labels := make(map[string]string)
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

func (i *instance) Proxy(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	proxyURL, err := url.Parse(i.config.Address)
	if err != nil {
		return
	}
	proxy := httputil.NewSingleHostReverseProxy(proxyURL)
	proxy.FlushInterval = -1

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))

		req.Host = req.URL.Host
		req.URL.Path = strings.ReplaceAll(req.URL.Path, "/api/plugins/prometheus/proxy", "")

		if i.config.Token != "" {
			req.Header.Set("Authorization", "Bearer "+i.config.Token)
		}
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Error(r.Context(), "client request failed", zap.Error(err), zap.String("clientName", i.name))
		errresponse.Render(w, r, http.StatusBadGateway)
	}

	proxy.ServeHTTP(w, r)
}

// New returns a new Prometheus instance for the given configuration.
func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

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

	return &instance{
		name:   name,
		config: config,
		v1api:  v1.NewAPI(client),
	}, nil
}
