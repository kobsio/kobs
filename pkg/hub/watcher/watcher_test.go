package watcher

import (
	"testing"
	"time"

	"github.com/kobsio/kobs/pkg/hub/watcher/satellite"
	"github.com/stretchr/testify/require"
)

func TestDoTask(t *testing.T) {
	testTask := task(func() {
		return
	})

	require.NotPanics(t, testTask.Do)
}

func TestNewClient(t *testing.T) {
	t.Run("create new client fails", func(t *testing.T) {
		_, err := NewClient(10*time.Second, -1, []satellite.Config{}, nil)
		require.Error(t, err)
	})

	t.Run("create new client succeeds", func(t *testing.T) {
		client, err := NewClient(10*time.Second, 1, []satellite.Config{}, nil)
		require.NoError(t, err)
		require.NotEmpty(t, client)
	})
}
