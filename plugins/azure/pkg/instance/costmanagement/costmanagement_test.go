package costmanagement

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNew(t *testing.T) {
	client := New("", nil)
	require.NotEmpty(t, client)
}
