package local

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/techdocs/shared"

	"go.uber.org/zap"
)

type Config struct {
	RootDirectory string `json:"rootDirectory"`
}

type Provider struct {
	config Config
}

func (p *Provider) GetIndexes(ctx context.Context) ([]shared.Index, error) {
	files, err := os.ReadDir(p.config.RootDirectory)
	if err != nil {
		return nil, err
	}

	var indexes []shared.Index

	for _, file := range files {
		if file.IsDir() {
			indexPath := fmt.Sprintf("%s/%s/index.yaml", p.config.RootDirectory, file.Name())
			content, err := os.ReadFile(indexPath)
			if err != nil {
				log.Error(ctx, "Failed to read file", zap.Error(err), zap.String("file", indexPath))
			} else {
				index, err := shared.ParseIndex(content)
				if err != nil {
					log.Error(ctx, "Failed to parse index file", zap.Error(err), zap.String("file", indexPath))
				} else {
					indexes = append(indexes, index)
				}
			}
		}
	}

	return indexes, nil
}

func (p *Provider) GetIndex(ctx context.Context, service string) (*shared.Index, error) {
	if strings.Contains(service, "./") || strings.Contains(service, "../") {
		return nil, fmt.Errorf("service name can not contain \"./\" or \"./\"")
	}

	content, err := os.ReadFile(fmt.Sprintf("%s/%s/index.yaml", p.config.RootDirectory, service))
	if err != nil {
		return nil, err
	}

	index, err := shared.ParseIndex(content)
	if err != nil {
		return nil, err
	}

	return &index, nil
}

func (p *Provider) GetMarkdown(ctx context.Context, service, path string) (string, error) {
	if strings.Contains(service, "./") || strings.Contains(service, "../") {
		return "", fmt.Errorf("service name can not contain \"./\" or \"./\"")
	}

	if strings.Contains(path, "./") || strings.Contains(path, "../") {
		return "", fmt.Errorf("path name can not contain \"./\" or \"./\"")
	}

	content, err := os.ReadFile(fmt.Sprintf("%s/%s/%s", p.config.RootDirectory, service, path))
	if err != nil {
		return "", err
	}

	return string(content), nil
}

func (p *Provider) GetFile(ctx context.Context, service, path string) ([]byte, error) {
	if strings.Contains(service, "./") || strings.Contains(service, "../") {
		return nil, fmt.Errorf("service name can not contain \"./\" or \"./\"")
	}

	if strings.Contains(path, "./") || strings.Contains(path, "../") {
		return nil, fmt.Errorf("path name can not contain \"./\" or \"./\"")
	}

	return os.ReadFile(fmt.Sprintf("%s/%s/%s", p.config.RootDirectory, service, path))
}

func New(config Config) (*Provider, error) {
	return &Provider{
		config: config,
	}, nil
}
