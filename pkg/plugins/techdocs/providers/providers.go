package providers

//go:generate mockgen -source=providers.go -destination=./providers_mock.go -package=providers Provider

import (
	"context"
	"fmt"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/techdocs/providers/azure"
	"github.com/kobsio/kobs/pkg/plugins/techdocs/providers/local"
	"github.com/kobsio/kobs/pkg/plugins/techdocs/providers/s3"
	"github.com/kobsio/kobs/pkg/plugins/techdocs/shared"

	"go.uber.org/zap"
)

// Type is the type for the different providers.
type Type string

const (
	// LOCAL is the type for the local file system provider, which returns TechDocs from the local file system.
	LOCAL Type = "local"
	// S3 is the type for the S3 provider, which returns TechDocs saved in a S3 bucket.
	S3 Type = "s3"
	// Azure is the type for the Azure provider, which returns TechDocs saved in a Azure container.
	Azure Type = "azure"
)

// Config is the structure of the provider config for a TechDocs instance.
type Config struct {
	Type  Type         `json:"type"`
	Local local.Config `json:"local"`
	S3    s3.Config    `json:"s3"`
	Azure azure.Config `json:"azure"`
}

// Provider is the interface, which must be implemented by each TechDocs provider.
type Provider interface {
	GetIndexes(ctx context.Context) ([]shared.Index, error)
	GetIndex(ctx context.Context, service string) (*shared.Index, error)
	GetMarkdown(ctx context.Context, service, path string) (string, error)
	GetFile(ctx context.Context, service, path string) ([]byte, error)
}

// New returns a new provider for the given configuration.
func New(config Config) (Provider, error) {
	switch config.Type {
	case LOCAL:
		return local.New(config.Local)
	case S3:
		return s3.New(config.S3)
	case Azure:
		return azure.New(config.Azure)
	default:
		log.Error(context.Background(), "Invalid provider", zap.String("provider", string(config.Type)))
		return nil, fmt.Errorf("invalid provider type")
	}
}
