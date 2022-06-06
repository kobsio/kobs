package instance

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAppendIfMissing(t *testing.T) {
	items := []string{"foo", "bar"}

	items = appendIfMissing(items, "foo")
	require.Equal(t, []string{"foo", "bar"}, items)

	items = appendIfMissing(items, "hello")
	items = appendIfMissing(items, "world")
	require.Equal(t, []string{"foo", "bar", "hello", "world"}, items)
}

func TestContains(t *testing.T) {
	items := []string{"foo", "bar"}

	require.Equal(t, true, contains(items, "foo"))
	require.Equal(t, false, contains(items, "hello world"))
}
