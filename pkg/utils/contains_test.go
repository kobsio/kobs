package utils

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSome(t *testing.T) {
	items := []int64{1, 2, 3}

	require.True(t, Some(items, func(x int64) bool {
		return x == 1
	}))

	require.True(t, Some(items, func(x int64) bool {
		return x%2 == 0
	}))

	require.False(t, Some(items, func(x int64) bool {
		return x > 5
	}))
}

func TestContains(t *testing.T) {
	items := []string{"foo", "bar"}
	require.Equal(t, true, Contains(items, "foo"))
	require.Equal(t, false, Contains(items, "hello world"))
}
