package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"context"

	"github.com/kobsio/kobs/pkg/plugins/techdocs/providers"
	"github.com/kobsio/kobs/pkg/plugins/techdocs/shared"
	"github.com/mitchellh/mapstructure"
)

type Config struct {
	Provider providers.Config `json:"provider"`
}

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

func New(name string, options map[string]any) (Instance, error) {
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
