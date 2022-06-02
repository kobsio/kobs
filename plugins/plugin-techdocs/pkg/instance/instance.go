package instance

import (
	"context"

	"github.com/kobsio/kobs/plugins/plugin-techdocs/pkg/providers"
	"github.com/kobsio/kobs/plugins/plugin-techdocs/pkg/shared"
	"github.com/mitchellh/mapstructure"
)

// Config is the structure of the configuration for a single TechDocs instance.
type Config struct {
	Provider providers.Config `json:"provider"`
}

// Instance is the interface which must be implemented by each TechDocs instance.
type Instance interface {
	GetName() string
	GetIndexes(ctx context.Context) ([]shared.Index, error)
	GetIndex(ctx context.Context, service string) (*shared.Index, error)
	GetMarkdown(ctx context.Context, service, path string) (*shared.Markdown, error)
	GetFile(ctx context.Context, service, path string) ([]byte, error)
}

type instance struct {
	name     string
	provider providers.Provider
}

// GetName returns the name of the instance.
func (i *instance) GetName() string {
	return i.name
}

// GetIndexes returns a list of indexes.
func (i *instance) GetIndexes(ctx context.Context) ([]shared.Index, error) {
	return i.provider.GetIndexes(ctx)
}

// GetIndex returns a single index for a service.
func (i *instance) GetIndex(ctx context.Context, service string) (*shared.Index, error) {
	return i.provider.GetIndex(ctx, service)
}

// GetMarkdown returns the content of a markdown file.
func (i *instance) GetMarkdown(ctx context.Context, service, path string) (*shared.Markdown, error) {
	markdown, err := i.provider.GetMarkdown(ctx, service, path)
	if err != nil {
		return nil, err
	}

	toc := shared.GenerateTOC(markdown)

	return &shared.Markdown{
		Markdown: markdown,
		TOC:      toc,
	}, nil
}

// GetFile returns the content of a file.
func (i *instance) GetFile(ctx context.Context, service, path string) ([]byte, error) {
	return i.provider.GetFile(ctx, service, path)
}

// New returns a new TechDocs instance for the given configuration.
func New(name string, options map[string]interface{}) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	p, err := providers.New(config.Provider)
	if err != nil {
		return nil, err
	}

	return &instance{
		name:     name,
		provider: p,
	}, nil
}
