package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/kobsio/kobs/pkg/utils/middleware/roundtripper"

	"github.com/mitchellh/mapstructure"
)

// Config is the structure of the configuration for a single Harbor instance.
type Config struct {
	Address  string `json:"address"`
	Username string `json:"username"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

type Instance interface {
	GetName() string
	GetProjects(ctx context.Context, page, pageSize string) (*ProjectsData, error)
	GetRepositories(ctx context.Context, projectName, query, page, pageSize string) (*RepositoriesData, error)
	GetArtifacts(ctx context.Context, projectName, repositoryName, query, page, pageSize string) (*ArtifactsData, error)
	GetArtifact(ctx context.Context, projectName, repositoryName, artifactReference string) (*Artifact, error)
	GetVulnerabilities(ctx context.Context, projectName, repositoryName, artifactReference string) (map[string]Vulnerability, error)
	GetBuildHistory(ctx context.Context, projectName, repositoryName, artifactReference string) ([]BuildHistoryItem, error)
}

type instance struct {
	name    string
	address string
	client  *http.Client
}

func (i *instance) GetName() string {
	return i.name
}

// GetProjects returns a list of projects from the Harbor instance.
func (i *instance) GetProjects(ctx context.Context, page, pageSize string) (*ProjectsData, error) {
	projects, total, err := doRequest[[]Project](ctx, i.client, fmt.Sprintf("%s/api/v2.0/projects?page=%s&page_size=%s", i.address, page, pageSize))
	if err != nil {
		return nil, err
	}

	return &ProjectsData{
		Projects: projects,
		Total:    total,
	}, nil
}

// GetRepositories returns a list of repositories from the Harbor instance.
func (i *instance) GetRepositories(ctx context.Context, projectName, query, page, pageSize string) (*RepositoriesData, error) {
	if query != "" {
		query = url.QueryEscape("name=~" + query)
	}

	repositories, total, err := doRequest[[]Repository](ctx, i.client, fmt.Sprintf("%s/api/v2.0/projects/%s/repositories?q=%s&page=%s&page_size=%s", i.address, projectName, query, page, pageSize))
	if err != nil {
		return nil, err
	}

	return &RepositoriesData{
		Repositories: repositories,
		Total:        total,
	}, nil
}

// GetArtifacts returns a list of artifacts for a repository from the Harbor instance.
func (i *instance) GetArtifacts(ctx context.Context, projectName, repositoryName, query, page, pageSize string) (*ArtifactsData, error) {
	if query != "" {
		query = url.QueryEscape("tags=~" + query)
	}

	repositoryName = url.PathEscape(repositoryName)

	artifacts, total, err := doRequest[[]Artifact](ctx, i.client, fmt.Sprintf("%s/api/v2.0/projects/%s/repositories/%s/artifacts?q=%s&page=%s&page_size=%s&with_tag=true&with_label=false&with_scan_overview=true&with_signature=false&with_immutable_status=false", i.address, projectName, repositoryName, query, page, pageSize))
	if err != nil {
		return nil, err
	}

	return &ArtifactsData{
		Artifacts: artifacts,
		Total:     total,
	}, nil
}

// GetArtifact returns a single artifact from the Harbor instance.
func (i *instance) GetArtifact(ctx context.Context, projectName, repositoryName, artifactReference string) (*Artifact, error) {
	repositoryName = url.PathEscape(repositoryName)

	artifact, _, err := doRequest[Artifact](ctx, i.client, fmt.Sprintf("%s/api/v2.0/projects/%s/repositories/%s/artifacts/%s", i.address, projectName, repositoryName, artifactReference))
	if err != nil {
		return nil, err
	}

	return &artifact, nil
}

// GetVulnerabilities returns a list of artifacts for a repository from the Harbor instance.
func (i *instance) GetVulnerabilities(ctx context.Context, projectName, repositoryName, artifactReference string) (map[string]Vulnerability, error) {
	repositoryName = url.PathEscape(repositoryName)

	vulnerabilities, _, err := doRequest[map[string]Vulnerability](ctx, i.client, fmt.Sprintf("%s/api/v2.0/projects/%s/repositories/%s/artifacts/%s/additions/vulnerabilities", i.address, projectName, repositoryName, artifactReference))
	if err != nil {
		return nil, err
	}

	return vulnerabilities, nil
}

// GetBuildHistory returns the build history for an artifact from the Harbor instance.
func (i *instance) GetBuildHistory(ctx context.Context, projectName, repositoryName, artifactReference string) ([]BuildHistoryItem, error) {
	repositoryName = url.PathEscape(repositoryName)

	buildHistory, _, err := doRequest[[]BuildHistoryItem](ctx, i.client, fmt.Sprintf("%s/api/v2.0/projects/%s/repositories/%s/artifacts/%s/additions/build_history", i.address, projectName, repositoryName, artifactReference))
	if err != nil {
		return nil, err
	}

	return buildHistory, nil
}

// New returns a new Harbor instance for the given configuration.
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

	return &instance{
		name:    name,
		address: config.Address,
		client: &http.Client{
			Timeout:   60 * time.Second,
			Transport: roundTripper,
		},
	}, nil
}
