package instance

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/kobsio/kobs/pkg/middleware/roundtripper"

	"github.com/mitchellh/mapstructure"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

// Config is the structure of the configuration for a single SonarQube instance.
type Config struct {
	Address      string   `json:"address"`
	Username     string   `json:"username"`
	Password     string   `json:"password"`
	Organization string   `json:"organization"`
	MetricKeys   []string `json:"metricKeys"`
}

// Instance is the interface which must be implemented by a single SonarQube instance.
type Instance interface {
	GetName() string
	GetProjects(ctx context.Context, query, pageSize, pageNumber string) (*ResponseProjects, error)
	GetProjectMeasures(ctx context.Context, project string, metricKeys []string) (*ResponseProjectMeasures, error)
}

type instance struct {
	name         string
	address      string
	organization string
	client       *http.Client
	metricKeys   []string
}

func (i *instance) GetName() string {
	return i.name
}

// GetProjects returns a list of projects from SonarQube.
func (i *instance) GetProjects(ctx context.Context, query, pageSize, pageNumber string) (*ResponseProjects, error) {
	projects, err := doRequest[ResponseProjects](ctx, i.client, fmt.Sprintf("%s/api/projects/search?organization=%s&p=%s&ps=%s&q=%s", i.address, i.organization, pageNumber, pageSize, query))
	if err != nil {
		return nil, err
	}

	return &projects, nil
}

// GetProjectMeasures returns a list of measures for the specified project from SonarQube.
func (i *instance) GetProjectMeasures(ctx context.Context, project string, metricKeys []string) (*ResponseProjectMeasures, error) {
	if metricKeys == nil {
		metricKeys = i.metricKeys
	}

	projectMeasures, err := doRequest[ResponseProjectMeasures](ctx, i.client, fmt.Sprintf("%s/api/measures/component?organization=%s&component=%s&additionalFields=metrics&metricKeys=%s", i.address, i.organization, project, strings.Join(metricKeys, ",")))
	if err != nil {
		return nil, err
	}

	return &projectMeasures, nil
}

// New returns a new Elasticsearch instance for the given configuration.
func New(name string, options map[string]interface{}) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	roundTripper := roundtripper.DefaultRoundTripper

	roundTripper = roundtripper.BasicAuthTransport{
		Transport: roundTripper,
		Username:  config.Username,
		Password:  config.Password,
	}

	metricKeys := config.MetricKeys
	if metricKeys == nil {
		metricKeys = []string{"alert_status", "bugs", "reliability_rating", "vulnerabilities", "security_rating", "security_hotspots_reviewed", "security_review_rating", "code_smells", "sqale_rating", "coverage", "duplicated_lines_density"}
	}

	return &instance{
		name:         name,
		address:      config.Address,
		organization: config.Organization,
		client: &http.Client{
			Transport: otelhttp.NewTransport(roundTripper),
		},
		metricKeys: metricKeys,
	}, nil
}
