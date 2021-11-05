package instance

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/kobsio/kobs/pkg/api/middleware/roundtripper"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "sonarqube"})
)

// Config is the structure of the configuration for a single Opsgenie instance.
type Config struct {
	Name        string   `json:"name"`
	DisplayName string   `json:"displayName"`
	Description string   `json:"description"`
	Address     string   `json:"address"`
	Username    string   `json:"username"`
	Password    string   `json:"password"`
	MetricKeys  []string `json:"metricKeys"`
}

// Instance represents a single Jaeger instance, which can be added via the configuration file.
type Instance struct {
	Name       string
	address    string
	client     *http.Client
	metricKeys []string
}

// doRequest is a helper function to run a request against a SonarQube instance for the given path. It returns the body
// or if the request failed the error message.
func (i *Instance) doRequest(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s%s", i.address, url), nil)
	if err != nil {
		return nil, err
	}

	resp, err := i.client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return ioutil.ReadAll(resp.Body)
	}

	var res ResponseError

	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return nil, err
	}

	if len(res.Errors) > 0 {
		return nil, fmt.Errorf(res.Errors[0].Msg)
	}

	return nil, fmt.Errorf("%v", res)
}

// GetProjects returns a list of projects from SonarQube.
func (i *Instance) GetProjects(ctx context.Context, query, pageSize, pageNumber string) (*ResponseProjects, error) {
	body, err := i.doRequest(ctx, fmt.Sprintf("/api/projects/search?p=%s&ps=%s&q=%s", pageNumber, pageSize, query))
	if err != nil {
		return nil, err
	}

	var projects ResponseProjects
	if err := json.Unmarshal(body, &projects); err != nil {
		return nil, err
	}

	return &projects, nil
}

// GetProjectMeasures returns a list of measures for the specified project from SonarQube.
func (i *Instance) GetProjectMeasures(ctx context.Context, project string, metricKeys []string) (*ResponseProjectMeasures, error) {
	if metricKeys == nil {
		metricKeys = i.metricKeys
	}

	body, err := i.doRequest(ctx, fmt.Sprintf("/api/measures/component?component=%s&additionalFields=metrics&metricKeys=%s", project, strings.Join(metricKeys, ",")))
	if err != nil {
		return nil, err
	}

	var projectMeasures ResponseProjectMeasures
	if err := json.Unmarshal(body, &projectMeasures); err != nil {
		return nil, err
	}

	return &projectMeasures, nil
}

// New returns a new Elasticsearch instance for the given configuration.
func New(config Config) (*Instance, error) {
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

	return &Instance{
		Name:    config.Name,
		address: config.Address,
		client: &http.Client{
			Transport: roundTripper,
		},
		metricKeys: metricKeys,
	}, nil
}
