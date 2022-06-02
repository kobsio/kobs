package local

import (
	"context"
	"fmt"
	"io/ioutil"

	"github.com/kobsio/kobs/packages/plugin-techdocs/pkg/shared"
	"github.com/kobsio/kobs/pkg/log"

	"go.uber.org/zap"
)

// Config is the structure of the configuration for the local file system provider.
type Config struct {
	RootDirectory string `json:"rootDirectory"`
}

// Provider implements the Provider interface.
type Provider struct {
	config Config
}

// GetIndexes returns a list indexes for all services.
func (p *Provider) GetIndexes(ctx context.Context) ([]shared.Index, error) {
	files, err := ioutil.ReadDir(p.config.RootDirectory)
	if err != nil {
		return nil, err
	}

	var indexes []shared.Index

	for _, file := range files {
		if file.IsDir() {
			indexPath := fmt.Sprintf("%s/%s/index.yaml", p.config.RootDirectory, file.Name())
			content, err := ioutil.ReadFile(indexPath)
			if err != nil {
				log.Error(ctx, "Could not read file", zap.Error(err), zap.String("file", indexPath))
			} else {
				index, err := shared.ParseIndex(content)
				if err != nil {
					log.Error(ctx, "Could not parse index file", zap.Error(err), zap.String("file", indexPath))
				} else {
					indexes = append(indexes, index)
				}
			}
		}
	}

	return indexes, nil
}

// GetIndex returns a single index for a service.
func (p *Provider) GetIndex(ctx context.Context, service string) (*shared.Index, error) {
	content, err := ioutil.ReadFile(fmt.Sprintf("%s/%s/index.yaml", p.config.RootDirectory, service))
	if err != nil {
		return nil, err
	}

	index, err := shared.ParseIndex(content)
	if err != nil {
		return nil, err
	}

	return &index, nil
}

// GetMarkdown returns a single markdown file.
func (p *Provider) GetMarkdown(ctx context.Context, service, path string) (string, error) {
	content, err := ioutil.ReadFile(fmt.Sprintf("%s/%s/%s", p.config.RootDirectory, service, path))
	if err != nil {
		return "", err
	}

	return string(content), nil
}

// GetFile returns a single file.
func (p *Provider) GetFile(ctx context.Context, service, path string) ([]byte, error) {
	return ioutil.ReadFile(fmt.Sprintf("%s/%s/%s", p.config.RootDirectory, service, path))
}

// New returns a new local provider. The local provider can be used to access TechDocs from the local file system.
func New(config Config) (*Provider, error) {
	return &Provider{
		config: config,
	}, nil
}
