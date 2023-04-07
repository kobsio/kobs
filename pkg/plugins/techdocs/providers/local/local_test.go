package local

import (
	"context"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/techdocs/shared"

	"github.com/stretchr/testify/require"
)

func TestGetIndexes(t *testing.T) {
	t.Run("should return error", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./invalid"})
		require.NoError(t, err)

		indexes, err := p.GetIndexes(context.Background())
		require.Error(t, err)
		require.Nil(t, indexes)
	})

	t.Run("should return indexes and ignore invalid folders", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		indexes, err := p.GetIndexes(context.Background())
		require.NoError(t, err)
		require.Equal(t, []shared.Index{
			{Key: "service1", Name: "Service 1", Description: "Service 1 Description", Home: "index.md", TOC: []map[string]any{{"Introduction": "index.md"}, {"Development": "development.md"}, {"Installation": []any{map[string]any{"Helm": "installation/helm.md"}, map[string]any{"Kustomize": "installation/kustomize.md"}, map[string]any{"Docker": "installation/docker.md"}}}}},
			{Key: "service2", Name: "Service 2", Description: "Service 2 Description", Home: "index.md", TOC: []map[string]any{{"Introduction": "index.md"}, {"Development": "development.md"}}},
		}, indexes)
	})
}

func TestGetIndex(t *testing.T) {
	t.Run("should return error for invalid service", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		indexes, err := p.GetIndex(context.Background(), "./")
		require.Error(t, err)
		require.Nil(t, indexes)
	})

	t.Run("should return error if index.yaml file does not exists", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		indexes, err := p.GetIndex(context.Background(), "service3")
		require.Error(t, err)
		require.Nil(t, indexes)
	})

	t.Run("should return error for invalid index.yaml file", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		indexes, err := p.GetIndex(context.Background(), "service4")
		require.Error(t, err)
		require.Nil(t, indexes)
	})

	t.Run("should return index", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		indexes, err := p.GetIndex(context.Background(), "service1")
		require.NoError(t, err)
		require.Equal(t, &shared.Index{Key: "service1", Name: "Service 1", Description: "Service 1 Description", Home: "index.md", TOC: []map[string]any{{"Introduction": "index.md"}, {"Development": "development.md"}, {"Installation": []any{map[string]any{"Helm": "installation/helm.md"}, map[string]any{"Kustomize": "installation/kustomize.md"}, map[string]any{"Docker": "installation/docker.md"}}}}}, indexes)
	})
}

func TestGetMarkdown(t *testing.T) {
	t.Run("should return error for invalid service", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		markdown, err := p.GetMarkdown(context.Background(), "./", "")
		require.Error(t, err)
		require.Equal(t, "", markdown)
	})

	t.Run("should return error for invalid path", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		markdown, err := p.GetMarkdown(context.Background(), "service1", "./")
		require.Error(t, err)
		require.Equal(t, "", markdown)
	})

	t.Run("should return error if file does not exists", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		markdown, err := p.GetMarkdown(context.Background(), "service3", "invalid.md")
		require.Error(t, err)
		require.Equal(t, "", markdown)
	})

	t.Run("should return index", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		markdown, err := p.GetMarkdown(context.Background(), "service1", "index.md")
		require.NoError(t, err)
		require.Equal(t, "# Home\n", markdown)
	})
}

func TestGetFile(t *testing.T) {
	t.Run("should return error for invalid service", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		markdown, err := p.GetFile(context.Background(), "./", "")
		require.Error(t, err)
		require.Equal(t, "", string(markdown))
	})

	t.Run("should return error for invalid path", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		markdown, err := p.GetFile(context.Background(), "service1", "./")
		require.Error(t, err)
		require.Equal(t, "", string(markdown))
	})

	t.Run("should return error if file does not exists", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		markdown, err := p.GetFile(context.Background(), "service3", "invalid.md")
		require.Error(t, err)
		require.Equal(t, "", string(markdown))
	})

	t.Run("should return index", func(t *testing.T) {
		p, err := New(Config{RootDirectory: "./testdata"})
		require.NoError(t, err)

		markdown, err := p.GetFile(context.Background(), "service1", "index.md")
		require.NoError(t, err)
		require.Equal(t, "# Home\n", string(markdown))
	})
}
