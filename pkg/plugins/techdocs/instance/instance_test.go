package instance

import (
	"context"
	"fmt"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/techdocs/providers"
	"github.com/kobsio/kobs/pkg/plugins/techdocs/shared"

	gomock "github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetName(t *testing.T) {
	instance := &instance{
		name: "techdocs",
	}

	require.Equal(t, "techdocs", instance.GetName())
}

func TestGetIndexes(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockProvider := providers.NewMockProvider(ctrl)
	mockProvider.EXPECT().GetIndexes(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

	i := &instance{provider: mockProvider}
	_, err := i.GetIndexes(context.Background())
	require.Error(t, err)
}

func TestGetIndex(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockProvider := providers.NewMockProvider(ctrl)
	mockProvider.EXPECT().GetIndex(gomock.Any(), "service1").Return(nil, fmt.Errorf("unexpected error"))

	i := &instance{provider: mockProvider}
	_, err := i.GetIndex(context.Background(), "service1")
	require.Error(t, err)
}

func TestGetMarkdown(t *testing.T) {
	t.Run("should return error from instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockProvider := providers.NewMockProvider(ctrl)
		mockProvider.EXPECT().GetMarkdown(gomock.Any(), "service1", "path1").Return("", fmt.Errorf("unexpected error"))

		i := &instance{provider: mockProvider}
		_, err := i.GetMarkdown(context.Background(), "service1", "path1")
		require.Error(t, err)
	})

	t.Run("should return markdown", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockProvider := providers.NewMockProvider(ctrl)
		mockProvider.EXPECT().GetMarkdown(gomock.Any(), "service1", "path1").Return("## Home", nil)

		i := &instance{provider: mockProvider}
		markdown, err := i.GetMarkdown(context.Background(), "service1", "path1")
		require.NoError(t, err)
		require.Equal(t, &shared.Markdown{Markdown: "## Home", TOC: "- [Home](#home)\n"}, markdown)
	})
}

func TestGetFile(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockProvider := providers.NewMockProvider(ctrl)
	mockProvider.EXPECT().GetFile(gomock.Any(), "service1", "path1").Return(nil, fmt.Errorf("unexpected error"))

	i := &instance{provider: mockProvider}
	_, err := i.GetFile(context.Background(), "service1", "path1")
	require.Error(t, err)
}

func TestNew(t *testing.T) {
	t.Run("should return error for invalid options", func(t *testing.T) {
		instance, err := New("techdocs", map[string]any{"provider": []string{"local"}})
		require.Error(t, err)
		require.Nil(t, instance)
	})

	t.Run("should return error for invalid options", func(t *testing.T) {
		instance, err := New("techdocs", map[string]any{"provider": map[string]any{"type": "invalid"}})
		require.Error(t, err)
		require.Nil(t, instance)
	})

	t.Run("should return instance for local provider", func(t *testing.T) {
		instance, err := New("techdocs", map[string]any{"provider": map[string]any{"type": "local", "local": map[string]any{"rootDirectory": "./testdata"}}})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})
}
