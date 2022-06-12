package resources

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
