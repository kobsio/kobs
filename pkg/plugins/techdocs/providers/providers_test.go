package providers

import (
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/techdocs/providers/azure"
	"github.com/kobsio/kobs/pkg/plugins/techdocs/providers/s3"

	"github.com/stretchr/testify/require"
)

func TestNew(t *testing.T) {
	t.Run("should return error for invalid type", func(t *testing.T) {
		p, err := New(Config{Type: "invalid"})
		require.Error(t, err)
		require.Nil(t, p)
	})

	t.Run("should return local provider", func(t *testing.T) {
		p, err := New(Config{Type: "local"})
		require.NoError(t, err)
		require.NotNil(t, p)
	})

	t.Run("should return s3 provider", func(t *testing.T) {
		p, err := New(Config{Type: "s3", S3: s3.Config{
			Bucket:          "test",
			Endpoint:        "ec2.eu-west-1.amazonaws.com",
			AccessKeyID:     "accesskeyid",
			SecretAccessKey: "secretaccesskey",
		}})
		require.NoError(t, err)
		require.NotNil(t, p)
	})

	t.Run("should return azure provider", func(t *testing.T) {
		p, err := New(Config{Type: "azure", Azure: azure.Config{
			AccountName: "test",
			AccountKey:  "test",
		}})
		require.NoError(t, err)
		require.NotNil(t, p)
	})
}
