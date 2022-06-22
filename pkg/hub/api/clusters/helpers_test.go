package clusters

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAppendIfMissing(t *testing.T) {
	t.Run("append", func(t *testing.T) {
		namespaces := appendIfMissing([]string{"test1"}, "test2")
		require.Equal(t, []string{"test1", "test2"}, namespaces)
	})

	t.Run("do not append", func(t *testing.T) {
		namespaces := appendIfMissing([]string{"test1"}, "test1")
		require.Equal(t, []string{"test1"}, namespaces)
	})
}
