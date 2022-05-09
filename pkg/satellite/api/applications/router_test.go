package applications

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNewRouter(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
