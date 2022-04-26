package router

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNewRouter(t *testing.T) {
	router := NewRouter(Config{}, nil)
	require.NotNil(t, router)
}
