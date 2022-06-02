package providers

import (
	"context"
	"fmt"

	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/plugin-techdocs/pkg/providers/local"
	"github.com/kobsio/kobs/plugins/plugin-techdocs/pkg/providers/s3"
	"github.com/kobsio/kobs/plugins/plugin-techdocs/pkg/shared"

	"go.uber.org/zap"
)

// Type is the type for the different providers.
type Type string

const (
	// LOCAL is the type for the local file system provider, which returns TechDocs from the local file system.
	LOCAL Type = "local"
	// S3 is the type for the S3 provider, which returns TechDocs saved in a S3 bucket.
	S3 Type = "s3"
)

// Config is the structure of the provider config for a TechDocs instance.
type Config struct {
	Type  Type         `json:"type"`
	Local local.Config `json:"local"`
	S3    s3.Config    `json:"s3"`
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
	default:
		log.Error(nil, "Invalid provider", zap.String("provider", string(config.Type)))
		return nil, fmt.Errorf("invalid provider type")
	}
}
