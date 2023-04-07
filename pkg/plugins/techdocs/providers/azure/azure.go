package azure

// TODO: Add tests based on gnomock when https://github.com/orlangure/gnomock/pull/837 is merged.

import (
	"bytes"
	"context"
	"fmt"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/techdocs/shared"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
	"go.uber.org/zap"
)

type Config struct {
	AccountName string `json:"accountName"`
	AccountKey  string `json:"accountKey"`
}

type Provider struct {
	client *azblob.Client
}

func (p *Provider) GetIndexes(ctx context.Context) ([]shared.Index, error) {
	var indexes []shared.Index

	pager := p.client.NewListContainersPager(nil)
	for pager.More() {
		resp, err := pager.NextPage(ctx)
		if err != nil {
			return nil, err
		}

		for _, container := range resp.ContainerItems {
			get, err := p.client.DownloadStream(ctx, *container.Name, "index.yaml", nil)
			if err != nil {
				log.Error(ctx, "Failed to read file", zap.Error(err), zap.Stringp("container", container.Name))
			} else {
				data := bytes.Buffer{}
				retryReader := get.NewRetryReader(ctx, &azblob.RetryReaderOptions{})
				defer retryReader.Close()
				_, err = data.ReadFrom(retryReader)
				if err != nil {
					log.Error(ctx, "Failed to read data", zap.Error(err), zap.Stringp("container", container.Name))
				} else {
					index, err := shared.ParseIndex(data.Bytes())
					if err != nil {
						log.Error(ctx, "Failed to parse index file", zap.Error(err), zap.Stringp("container", container.Name))
					} else {
						indexes = append(indexes, index)
					}
				}
			}
		}
	}

	return indexes, nil
}

func (p *Provider) GetIndex(ctx context.Context, service string) (*shared.Index, error) {
	get, err := p.client.DownloadStream(ctx, service, "index.yaml", nil)
	if err != nil {
		return nil, err
	}

	data := bytes.Buffer{}
	retryReader := get.NewRetryReader(ctx, &azblob.RetryReaderOptions{})
	defer retryReader.Close()
	_, err = data.ReadFrom(retryReader)
	if err != nil {
		return nil, err
	}

	index, err := shared.ParseIndex(data.Bytes())
	if err != nil {
		return nil, err
	}

	return &index, nil
}

func (p *Provider) GetMarkdown(ctx context.Context, service, path string) (string, error) {
	get, err := p.client.DownloadStream(ctx, service, path, nil)
	if err != nil {
		return "", err
	}

	data := bytes.Buffer{}
	retryReader := get.NewRetryReader(ctx, &azblob.RetryReaderOptions{})
	defer retryReader.Close()
	_, err = data.ReadFrom(retryReader)
	if err != nil {
		return "", err
	}

	return data.String(), nil
}

func (p *Provider) GetFile(ctx context.Context, service, path string) ([]byte, error) {
	get, err := p.client.DownloadStream(ctx, service, path, nil)
	if err != nil {
		return nil, err
	}

	data := bytes.Buffer{}
	retryReader := get.NewRetryReader(ctx, &azblob.RetryReaderOptions{})
	defer retryReader.Close()
	_, err = data.ReadFrom(retryReader)
	if err != nil {
		return nil, err
	}

	return data.Bytes(), nil
}

func New(config Config) (*Provider, error) {
	credential, err := azblob.NewSharedKeyCredential(config.AccountName, config.AccountKey)
	if err != nil {
		return nil, err
	}

	client, err := azblob.NewClientWithSharedKeyCredential(fmt.Sprintf("https://%s.blob.core.windows.net/", config.AccountName), credential, nil)
	if err != nil {
		return nil, err
	}

	return &Provider{
		client: client,
	}, nil
}
