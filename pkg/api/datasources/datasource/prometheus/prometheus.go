package prometheus

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/generated/proto"

	"github.com/prometheus/client_golang/api"
	v1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"github.com/prometheus/common/model"
	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "prometheus"})
)

// Config contains all required fields to create a new Prometheus datasource.
type Config struct {
	Address  string `yaml:"address"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
	Token    string `yaml:"token"`
}

type basicAuthTransport struct {
	Transport http.RoundTripper
	username  string
	password  string
}

type tokenAuthTransporter struct {
	Transport http.RoundTripper
	token     string
}

func (bat basicAuthTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.SetBasicAuth(bat.username, bat.password)
	return bat.Transport.RoundTrip(req)
}

func (tat tokenAuthTransporter) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", "Bearer "+tat.token)
	return tat.Transport.RoundTrip(req)
}

// Prometheus implements the Prometheus datasource.
type Prometheus struct {
	name  string
	v1api v1.API
}

// GetDatasource returns the details for the datasource. Currently this is only the name and the type of the datasource.
func (p *Prometheus) GetDatasource() (string, string) {
	return p.name, "prometheus"
}

// GetVariables returns all variable values. The values are label values for a Prometheus time series. The labels are
// retrieved via a PromQL query.
// To get the values we are looping over all queries and pre selecting the first value or all values, when the option
// is set. So we can use a variable in a following query.
func (p *Prometheus) GetVariables(ctx context.Context, options *proto.DatasourceOptions, variables []*proto.ApplicationMetricsVariable) ([]*proto.ApplicationMetricsVariable, error) {
	if options == nil {
		return nil, fmt.Errorf("datasource options are missing")
	}

	var selectedValues map[string]string
	selectedValues = make(map[string]string, len(variables))

	for i := 0; i < len(variables); i++ {
		query, err := queryInterpolation(variables[i].Query, selectedValues)
		if err != nil {
			return nil, err
		}

		log.WithFields(logrus.Fields{"query": query}).Tracef("Query variables.")

		labelSets, _, err := p.v1api.Series(ctx, []string{query}, time.Unix(options.TimeStart, 0), time.Unix(options.TimeEnd, 0))
		if err != nil {
			return nil, err
		}

		var values []string
		for _, labelSet := range labelSets {
			if value, ok := labelSet[model.LabelName(variables[i].Label)]; ok {
				values = appendIfMissing(values, string(value))
			}
		}

		variables[i].Values = values

		if variables[i].AllowAll {
			variables[i].Values = append([]string{"All"}, variables[i].Values...)
		}

		if variables[i].Value == "" && len(variables[i].Values) > 0 {
			variables[i].Value = variables[i].Values[0]
		} else {
			if !valueExists(variables[i].Values, variables[i].Value) && len(variables[i].Values) > 0 {
				variables[i].Value = variables[i].Values[0]
			}
		}

		if variables[i].Value == "All" {
			selectedValues[variables[i].Name] = strings.Join(variables[i].Values[1:], "|")
		} else {
			selectedValues[variables[i].Name] = variables[i].Value
		}
	}

	return variables, nil
}

// GetMetrics returns all metrics for all given queries. For that we are creating a map of with the selected values for
// all variables. Then we are looping through the list of variables, replacing the variables with the selected value and
// run the PromQL against the configured Prometheus instance. In the last step we transform the result, so that it can
// be used in the React UI.
func (p *Prometheus) GetMetrics(ctx context.Context, options *proto.DatasourceOptions, variables []*proto.ApplicationMetricsVariable, queries []*proto.ApplicationMetricsQuery) ([]*proto.DatasourceMetrics, error) {
	var selectedVariableValues map[string]string
	selectedVariableValues = make(map[string]string, len(variables))

	for _, variable := range variables {
		if variable.Value == "All" {
			selectedVariableValues[variable.Name] = strings.Join(variable.Values[1:], "|")
		} else {
			selectedVariableValues[variable.Name] = variable.Value
		}
	}

	if options == nil {
		return nil, fmt.Errorf("options are missing")
	}

	steps := getSteps(options.TimeStart, options.TimeEnd)
	if options.Resolution != "" {
		parsedDuration, err := time.ParseDuration(options.Resolution)
		if err == nil {
			steps = parsedDuration
		}
	}

	r := v1.Range{
		Start: time.Unix(options.TimeStart, 0),
		End:   time.Unix(options.TimeEnd, 0),
		Step:  steps,
	}

	var metrics []*proto.DatasourceMetrics

	for _, query := range queries {
		interpolatedQuery, err := queryInterpolation(query.Query, selectedVariableValues)
		if err != nil {
			return nil, err
		}

		log.WithFields(logrus.Fields{"query": interpolatedQuery, "start": r.Start, "end": r.End}).Tracef("Query time series.")

		result, _, err := p.v1api.QueryRange(ctx, interpolatedQuery, r)
		if err != nil {
			return nil, err
		}

		streams, ok := result.(model.Matrix)
		if !ok {
			return nil, err
		}

		for _, stream := range streams {
			var min float64
			var max float64

			var data []*proto.DatasourceMetricsData
			for index, value := range stream.Values {
				val := float64(value.Value)

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

				data = append(data, &proto.DatasourceMetricsData{
					X: value.Timestamp.Unix() * 1000,
					Y: val,
				})
			}

			var labels map[string]string
			labels = make(map[string]string)

			for key, value := range stream.Metric {
				labels[string(key)] = string(value)
			}

			label, err := queryInterpolation(query.Label, labels)
			if err != nil {
				metrics = append(metrics, &proto.DatasourceMetrics{
					Label: query.Label,
					Min:   min,
					Max:   max,
					Data:  data,
				})
			} else {
				metrics = append(metrics, &proto.DatasourceMetrics{
					Label: label,
					Min:   min,
					Max:   max,
					Data:  data,
				})
			}
		}
	}

	return metrics, nil
}

// GetLogs is not implemented for Prometheus.
func (p *Prometheus) GetLogs(ctx context.Context, options *proto.DatasourceOptions) error {
	return fmt.Errorf("logs interface isn't implemented for prometheus")
}

// GetTraces is not implemented for Prometheus.
func (p *Prometheus) GetTraces(ctx context.Context, options *proto.DatasourceOptions) error {
	return fmt.Errorf("traces interface isn't implemented for prometheus")
}

// New returns a new Prometheus datasource, which implements the datasource interface. A Prometheus datasource, contains
// a Prometheus API client. We also set the round tripper for basic or token authentication, when the settings are
// provided.
func New(name string, config Config) (*Prometheus, error) {
	roundTripper := api.DefaultRoundTripper

	if config.Username != "" && config.Password != "" {
		roundTripper = basicAuthTransport{
			Transport: roundTripper,
			username:  config.Username,
			password:  config.Password,
		}
	}

	if config.Token != "" {
		roundTripper = tokenAuthTransporter{
			Transport: roundTripper,
			token:     config.Token,
		}
	}

	client, err := api.NewClient(api.Config{
		Address:      config.Address,
		RoundTripper: roundTripper,
	})
	if err != nil {
		return nil, err
	}

	return &Prometheus{
		name:  name,
		v1api: v1.NewAPI(client),
	}, nil
}
