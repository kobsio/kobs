package virtualmachinescalesets

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNew(t *testing.T) {
	client, err := New("", nil)
	require.NoError(t, err)
	require.NotEmpty(t, client)
}
