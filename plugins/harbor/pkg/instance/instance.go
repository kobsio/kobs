package instance

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/middleware/roundtripper"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "harbor"})
)

// Config is the structure of the configuration for a single Harbor instance.
type Config struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Description string `json:"description"`
	Address     string `json:"address"`
	Username    string `json:"username"`
	Password    string `json:"password"`
	Token       string `json:"token"`
}

// Instance represents a single Harbor instance, which can be added via the configuration file.
type Instance struct {
	Name    string
	address string
	client  *http.Client
}

func (i *Instance) doRequest(ctx context.Context, url string) ([]byte, int64, error) {
	fmt.Println(url)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/v2.0/%s", i.address, url), nil)
	if err != nil {
		return nil, 0, err
	}

	resp, err := i.client.Do(req)
	if err != nil {
		return nil, 0, err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, 0, err
		}

		// Harbor returns the total number of projects, repositories, etc. for pagination via the "x-total-count"
		// header.
		total := resp.Header.Get("x-total-count")
		if total == "" {
			return body, 0, nil
		}

		totalParsed, err := strconv.ParseInt(total, 10, 64)
		if err != nil {
			return nil, 0, err
		}

		return body, totalParsed, nil
	}

	var res ResponseError

	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return nil, 0, err
	}

	if len(res.Errors) > 0 {
		return nil, 0, fmt.Errorf(res.Errors[0].Message)
	}

	return nil, 0, fmt.Errorf("%v", res)
}

// GetProjects returns a list of projects from the Harbor instance.
func (i *Instance) GetProjects(ctx context.Context, page, pageSize string) (*ProjectsData, error) {
	body, total, err := i.doRequest(ctx, fmt.Sprintf("projects?page=%s&page_size=%s", page, pageSize))
	if err != nil {
		return nil, err
	}

	var projects []Project
	if err := json.Unmarshal(body, &projects); err != nil {
		return nil, err
	}

	return &ProjectsData{
		Projects: projects,
		Total:    total,
	}, nil
}

// GetRepositories returns a list of repositories from the Harbor instance.
func (i *Instance) GetRepositories(ctx context.Context, projectName, query, page, pageSize string) (*RepositoriesData, error) {
	if query != "" {
		query = url.QueryEscape("name=~" + query)
	}

	body, total, err := i.doRequest(ctx, fmt.Sprintf("projects/%s/repositories?q=%s&page=%s&page_size=%s", projectName, query, page, pageSize))
	if err != nil {
		return nil, err
	}

	var repositories []Repository
	if err := json.Unmarshal(body, &repositories); err != nil {
		return nil, err
	}

	return &RepositoriesData{
		Repositories: repositories,
		Total:        total,
	}, nil
}

// GetArtifacts returns a list of artifacts for a repository from the Harbor instance.
func (i *Instance) GetArtifacts(ctx context.Context, projectName, repositoryName, query, page, pageSize string) (*ArtifactsData, error) {
	if query != "" {
		query = url.QueryEscape("tags=~" + query)
	}

	repositoryName = url.PathEscape(repositoryName)

	body, total, err := i.doRequest(ctx, fmt.Sprintf("projects/%s/repositories/%s/artifacts?q=%s&page=%s&page_size=%s&with_tag=true&with_label=false&with_scan_overview=true&with_signature=false&with_immutable_status=false", projectName, repositoryName, query, page, pageSize))
	if err != nil {
		return nil, err
	}

	var artifacts []Artifact
	if err := json.Unmarshal(body, &artifacts); err != nil {
		return nil, err
	}

	return &ArtifactsData{
		Artifacts: artifacts,
		Total:     total,
	}, nil
}

// GetVulnerabilities returns a list of artifacts for a repository from the Harbor instance.
func (i *Instance) GetVulnerabilities(ctx context.Context, projectName, repositoryName, artifactReference string) (map[string]Vulnerability, error) {
	repositoryName = url.PathEscape(repositoryName)

	body, _, err := i.doRequest(ctx, fmt.Sprintf("projects/%s/repositories/%s/artifacts/%s/additions/vulnerabilities", projectName, repositoryName, artifactReference))
	if err != nil {
		return nil, err
	}

	var vulnerabilities map[string]Vulnerability
	vulnerabilities = make(map[string]Vulnerability)
	if err := json.Unmarshal(body, &vulnerabilities); err != nil {
		return nil, err
	}

	return vulnerabilities, nil
}

// GetBuildHistory returns the build history for an artifact from the Harbor instance.
func (i *Instance) GetBuildHistory(ctx context.Context, projectName, repositoryName, artifactReference string) ([]BuildHistoryItem, error) {
	repositoryName = url.PathEscape(repositoryName)

	body, _, err := i.doRequest(ctx, fmt.Sprintf("projects/%s/repositories/%s/artifacts/%s/additions/build_history", projectName, repositoryName, artifactReference))
	if err != nil {
		return nil, err
	}

	var buildHistory []BuildHistoryItem
	if err := json.Unmarshal(body, &buildHistory); err != nil {
		return nil, err
	}

	return buildHistory, nil
}

// New returns a new Harbor instance for the given configuration.
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

	return &Instance{
		Name:    config.Name,
		address: config.Address,
		client: &http.Client{
			Transport: roundTripper,
		},
	}, nil
}
