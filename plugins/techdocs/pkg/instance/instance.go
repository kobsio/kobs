package instance

import (
	"context"

	"github.com/kobsio/kobs/plugins/techdocs/pkg/providers"
	"github.com/kobsio/kobs/plugins/techdocs/pkg/shared"
)

// Config is the structure of the configuration for a single TechDocs instance.
type Config struct {
	Name        string           `json:"name"`
	DisplayName string           `json:"displayName"`
	Description string           `json:"description"`
	Home        bool             `json:"home"`
	Provider    providers.Config `json:"provider"`
}

// Instance represents a single TechDocs instance, which can be added via the configuration file.
type Instance struct {
	Name     string
	provider providers.Provider
}

// GetIndexes returns a list of indexes.
func (i *Instance) GetIndexes(ctx context.Context) ([]shared.Index, error) {
	return i.provider.GetIndexes(ctx)
}

// GetIndex returns a single index for a service.
func (i *Instance) GetIndex(ctx context.Context, service string) (*shared.Index, error) {
	return i.provider.GetIndex(ctx, service)
}

// GetMarkdown returns the content of a markdown file.
func (i *Instance) GetMarkdown(ctx context.Context, service, path string) (*shared.Markdown, error) {
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
func (i *Instance) GetFile(ctx context.Context, service, path string) ([]byte, error) {
	return i.provider.GetFile(ctx, service, path)
}

// New returns a new Elasticsearch instance for the given configuration.
func New(config Config) (*Instance, error) {
	p, err := providers.New(config.Provider)
	if err != nil {
		return nil, err
	}

	return &Instance{
		Name:     config.Name,
		provider: p,
	}, nil
}
