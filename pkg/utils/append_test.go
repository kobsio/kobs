package utils

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAppendIf(t *testing.T) {
	t.Run("works with strings", func(t *testing.T) {
		strCmpr := func(a, b string) bool { return a == b }
		items := []string{"foo", "bar"}

		items = AppendIf(items, "foo", strCmpr)
		require.Equal(t, []string{"foo", "bar"}, items)

		items = AppendIf(items, "hello", strCmpr)
		items = AppendIf(items, "world", strCmpr)
		require.Equal(t, []string{"foo", "bar", "hello", "world"}, items)
	})

	t.Run("works with int's", func(t *testing.T) {
		appendIfGreater := func(items []int, item int) []int {
			return AppendIf(items, item, func(a, b int) bool { return a > b })
		}

		require.Equal(t, []int{1, 2, 3}, appendIfGreater([]int{1, 2, 3}, 0))
		require.Equal(t, []int{1, 2, 3, 100}, appendIfGreater([]int{1, 2, 3}, 100))
	})
}
