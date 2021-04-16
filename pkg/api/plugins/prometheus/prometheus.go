package prometheus

import (
	"context"
	"fmt"
	"strings"
	"time"

	pluginsProto "github.com/kobsio/kobs/pkg/api/plugins/plugins/proto"
	"github.com/kobsio/kobs/pkg/api/plugins/plugins/shared"
	prometheusProto "github.com/kobsio/kobs/pkg/api/plugins/prometheus/proto"

	"github.com/prometheus/client_golang/api"
	v1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"github.com/prometheus/common/model"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "prometheus"})
)

type Config struct {
	Name        string `yaml:"name"`
	Description string `yaml:"description"`
	Address     string `yaml:"address"`
	Username    string `yaml:"username"`
	Password    string `yaml:"password"`
	Token       string `yaml:"token"`
}

type Prometheus struct {
	prometheusProto.UnimplementedPrometheusServer
	instances []*Instance
}

type Instance struct {
	name                 string
	metricNames          model.LabelValues
	lastMetricNamesFetch time.Time
	v1api                v1.API
}

func (p *Prometheus) getInstace(name string) *Instance {
	for _, i := range p.instances {
		if i.name == name {
			return i
		}
	}

	return nil
}

// GetVariables returns all variable values. The values are label values for a Prometheus time series. The labels are
// retrieved via a PromQL query.
// To get the values we are looping over all queries and pre selecting the first value or all values, when the option
// is set. So we can use a variable in a following query.
func (p *Prometheus) GetVariables(ctx context.Context, getVariablesRequest *prometheusProto.GetVariablesRequest) (*prometheusProto.GetVariablesResponse, error) {
	if getVariablesRequest == nil {
		return nil, fmt.Errorf("request data is missing")
	}

	instance := p.getInstace(getVariablesRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Prometheus plugin")
	}

	var selectedValues map[string]string
	selectedValues = make(map[string]string, len(getVariablesRequest.Variables))

	for i := 0; i < len(getVariablesRequest.Variables); i++ {
		query, err := queryInterpolation(getVariablesRequest.Variables[i].Query, selectedValues)
		if err != nil {
			return nil, err
		}

		log.WithFields(logrus.Fields{"query": query}).Tracef("Query variables.")

		labelSets, _, err := instance.v1api.Series(ctx, []string{query}, time.Unix(getVariablesRequest.TimeStart, 0), time.Unix(getVariablesRequest.TimeEnd, 0))
		if err != nil {
			return nil, err
		}

		var values []string
		for _, labelSet := range labelSets {
			if value, ok := labelSet[model.LabelName(getVariablesRequest.Variables[i].Label)]; ok {
				values = appendIfMissing(values, string(value))
			}
		}

		getVariablesRequest.Variables[i].Values = values

		if getVariablesRequest.Variables[i].AllowAll {
			getVariablesRequest.Variables[i].Values = append([]string{"All"}, getVariablesRequest.Variables[i].Values...)
		}

		if getVariablesRequest.Variables[i].Value == "" && len(getVariablesRequest.Variables[i].Values) > 0 {
			getVariablesRequest.Variables[i].Value = getVariablesRequest.Variables[i].Values[0]
		} else {
			if !valueExists(getVariablesRequest.Variables[i].Values, getVariablesRequest.Variables[i].Value) && len(getVariablesRequest.Variables[i].Values) > 0 {
				getVariablesRequest.Variables[i].Value = getVariablesRequest.Variables[i].Values[0]
			}
		}

		if getVariablesRequest.Variables[i].Value == "All" {
			selectedValues[getVariablesRequest.Variables[i].Name] = strings.Join(getVariablesRequest.Variables[i].Values[1:], "|")
		} else {
			selectedValues[getVariablesRequest.Variables[i].Name] = getVariablesRequest.Variables[i].Value
		}
	}

	return &prometheusProto.GetVariablesResponse{
		Variables: getVariablesRequest.Variables,
	}, nil
}

// GetMetrics returns all metrics for all given queries. For that we are creating a map of with the selected values for
// all variables. Then we are looping through the list of variables, replacing the variables with the selected value and
// run the PromQL against the configured Prometheus instance. In the last step we transform the result, so that it can
// be used in the React UI.
func (p *Prometheus) GetMetrics(ctx context.Context, getMetricsRequest *prometheusProto.GetMetricsRequest) (*prometheusProto.GetMetricsResponse, error) {
	if getMetricsRequest == nil {
		return nil, fmt.Errorf("request data is missing")
	}

	instance := p.getInstace(getMetricsRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Prometheus plugin")
	}

	var selectedVariableValues map[string]string
	selectedVariableValues = make(map[string]string, len(getMetricsRequest.Variables))

	for _, variable := range getMetricsRequest.Variables {
		if variable.Value == "All" {
			selectedVariableValues[variable.Name] = strings.Join(variable.Values[1:], "|")
		} else {
			selectedVariableValues[variable.Name] = variable.Value
		}
	}

	steps := getSteps(getMetricsRequest.TimeStart, getMetricsRequest.TimeEnd)
	if getMetricsRequest.Resolution != "" {
		parsedDuration, err := time.ParseDuration(getMetricsRequest.Resolution)
		if err == nil {
			steps = parsedDuration
		}
	}

	r := v1.Range{
		Start: time.Unix(getMetricsRequest.TimeStart, 0),
		End:   time.Unix(getMetricsRequest.TimeEnd, 0),
		Step:  steps,
	}

	var metrics []*prometheusProto.Metrics
	var interpolatedQueries []string

	for _, query := range getMetricsRequest.Queries {
		interpolatedQuery, err := queryInterpolation(query.Query, selectedVariableValues)
		if err != nil {
			return nil, err
		}

		interpolatedQueries = append(interpolatedQueries, interpolatedQuery)

		log.WithFields(logrus.Fields{"query": interpolatedQuery, "start": r.Start, "end": r.End}).Tracef("Query time series.")

		result, _, err := instance.v1api.QueryRange(ctx, interpolatedQuery, r)
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

			var data []*prometheusProto.Data
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

				data = append(data, &prometheusProto.Data{
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
				metrics = append(metrics, &prometheusProto.Metrics{
					Label: query.Label,
					Min:   min,
					Max:   max,
					Data:  data,
				})
			} else {
				if label == "" {
					label = stream.Metric.String()
				}

				metrics = append(metrics, &prometheusProto.Metrics{
					Label: label,
					Min:   min,
					Max:   max,
					Data:  data,
				})
			}
		}
	}

	return &prometheusProto.GetMetricsResponse{
		Metrics:             metrics,
		InterpolatedQueries: interpolatedQueries,
	}, nil
}

func (p *Prometheus) MetricLookup(ctx context.Context, metricsLookupRequest *prometheusProto.MetricLookupRequest) (*prometheusProto.MetricLookupResponse, error) {
	instance := p.getInstace(metricsLookupRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Prometheus plugin")
	}

	// Fetch metric names if last fetch was more then a minute ago
	if instance.lastMetricNamesFetch.Add(time.Minute).Before(time.Now()) {
		var err error
		instance.metricNames, _, err = instance.v1api.LabelValues(ctx, model.MetricNameLabel, nil, time.Unix(0, 0), time.Now())
		if err != nil {
			return nil, err
		}
		instance.lastMetricNamesFetch = time.Now()
		log.Debugf("Refreshed metricNames.")
	} else {
		log.Debugf("Using cached metricNames.")
	}

	var names []string
	for _, name := range instance.metricNames {
		if strings.Contains(string(name), metricsLookupRequest.Matcher) {
			names = append(names, string(name))
		}
	}

	return &prometheusProto.MetricLookupResponse{
		Names: names,
	}, nil
}

func Register(cfg []Config, grpcServer *grpc.Server) ([]*pluginsProto.PluginShort, error) {
	log.Tracef("Register Prometheus Plugin.")

	var pluginDetails []*pluginsProto.PluginShort
	var instances []*Instance

	for _, config := range cfg {
		roundTripper := shared.DefaultRoundTripper

		if config.Username != "" && config.Password != "" {
			roundTripper = shared.BasicAuthTransport{
				Transport: roundTripper,
				Username:  config.Username,
				Password:  config.Password,
			}
		}

		if config.Token != "" {
			roundTripper = shared.TokenAuthTransporter{
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

		pluginDetails = append(pluginDetails, &pluginsProto.PluginShort{
			Name:        config.Name,
			Description: config.Description,
			Type:        "prometheus",
		})
		instances = append(instances, &Instance{
			name:  config.Name,
			v1api: v1.NewAPI(client),
		})
	}

	prometheusProto.RegisterPrometheusServer(grpcServer, &Prometheus{
		instances: instances,
	})

	return pluginDetails, nil
}
