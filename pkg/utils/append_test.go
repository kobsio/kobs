package utils

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAppendIf(t *testing.T) {
	t.Run("should work with strings", func(t *testing.T) {
		strCmpr := func(a, b string) bool { return a != b }
		items := []string{"foo", "bar"}

		items = AppendIf(items, "foo", strCmpr)
		require.Equal(t, []string{"foo", "bar"}, items)

		items = AppendIf(items, "hello", strCmpr)
		items = AppendIf(items, "world", strCmpr)
		require.Equal(t, []string{"foo", "bar", "hello", "world"}, items)
	})

	t.Run("should work with int's", func(t *testing.T) {
		appendIfGreater := func(items []int, item int) []int {
			return AppendIf(items, item, func(iter, nw int) bool { return iter < nw })
		}

		require.Equal(t, []int{1, 2, 3}, appendIfGreater([]int{1, 2, 3}, 0))
		require.Equal(t, []int{1, 2, 3, 100}, appendIfGreater([]int{1, 2, 3}, 100))
	})
}

func TestAppendIfStringIsMissing(t *testing.T) {
	t.Run("should append value if it is missing in the slice", func(t *testing.T) {
		require.Equal(t, []string{"test1", "test2", "test3"}, AppendIfStringIsMissing([]string{"test1", "test2"}, "test3"))
	})

	t.Run("should not append value if if it already exists in the slice", func(t *testing.T) {
		require.Equal(t, []string{"test1", "test2"}, AppendIfStringIsMissing([]string{"test1", "test2"}, "test2"))
	})
}
