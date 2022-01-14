package s3

import (
	"context"
	"fmt"

	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/techdocs/pkg/shared"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"go.uber.org/zap"
)

// Config is the structure of the configuration for the s3 provider.
type Config struct {
	Endpoint        string `json:"endpoint"`
	AccessKeyID     string `json:"accessKeyID"`
	SecretAccessKey string `json:"secretAccessKey"`
	Bucket          string `json:"bucket"`
	UseSSL          bool   `json:"useSSL"`
}

// Provider implements the Provider interface.
type Provider struct {
	client *minio.Client
	config Config
}

// GetIndexes returns a list indexes for all services.
func (p *Provider) GetIndexes(ctx context.Context) ([]shared.Index, error) {
	var indexes []shared.Index

	for object := range p.client.ListObjects(ctx, p.config.Bucket, minio.ListObjectsOptions{Recursive: false}) {
		if object.Err != nil {
			log.Error(ctx, "Could not read file", zap.Error(object.Err))
		} else {
			if object.Key[len(object.Key)-1:] == "/" {
				indexPath := fmt.Sprintf("%sindex.yaml", object.Key)
				obj, err := p.client.GetObject(ctx, p.config.Bucket, indexPath, minio.GetObjectOptions{})
				if err != nil {
					log.Error(ctx, "Could not read file", zap.Error(err), zap.String("file", indexPath))
				} else {
					defer obj.Close()
					fileInfo, _ := obj.Stat()

					if fileInfo.Size > 0 {
						buffer := make([]byte, fileInfo.Size)
						obj.Read(buffer)

						index, err := shared.ParseIndex(buffer)
						if err != nil {
							log.Error(ctx, "Could not parse index file", zap.Error(err), zap.String("file", indexPath))
						} else {
							indexes = append(indexes, index)
						}
					}
				}
			}
		}
	}

	return indexes, nil
}

// GetIndex returns a single index for a service.
func (p *Provider) GetIndex(ctx context.Context, service string) (*shared.Index, error) {
	obj, err := p.client.GetObject(ctx, p.config.Bucket, fmt.Sprintf("%s/index.yaml", service), minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	defer obj.Close()

	fileInfo, _ := obj.Stat()
	buffer := make([]byte, fileInfo.Size)
	obj.Read(buffer)

	index, err := shared.ParseIndex(buffer)
	if err != nil {
		return nil, err
	}

	return &index, nil
}

// GetMarkdown returns a single markdown file.
func (p *Provider) GetMarkdown(ctx context.Context, service, path string) (string, error) {
	if len(path) > 0 && string(path[0]) != "/" {
		path = "/" + path
	}

	obj, err := p.client.GetObject(ctx, p.config.Bucket, fmt.Sprintf("%s%s", service, path), minio.GetObjectOptions{})
	if err != nil {
		return "", err
	}
	defer obj.Close()

	fileInfo, _ := obj.Stat()
	buffer := make([]byte, fileInfo.Size)
	obj.Read(buffer)

	return string(buffer), nil
}

// GetFile returns a single file.
func (p *Provider) GetFile(ctx context.Context, service, path string) ([]byte, error) {
	if len(path) > 0 && string(path[0]) != "/" {
		path = "/" + path
	}

	obj, err := p.client.GetObject(ctx, p.config.Bucket, fmt.Sprintf("%s%s", service, path), minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	defer obj.Close()

	fileInfo, _ := obj.Stat()
	buffer := make([]byte, fileInfo.Size)
	obj.Read(buffer)

	return buffer, nil
}

// New returns a new local provider. The local provider can be used to access TechDocs from the local file system.
func New(config Config) (*Provider, error) {
	client, err := minio.New(config.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(config.AccessKeyID, config.SecretAccessKey, ""),
		Secure: config.UseSSL,
	})
	if err != nil {
		return nil, err
	}

	return &Provider{
		client: client,
		config: config,
	}, nil
}
