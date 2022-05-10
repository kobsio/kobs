package watcher

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestInstrument(t *testing.T) {
	testInstrumentWithError := func() { instrument(context.Background(), "", "", fmt.Errorf("test error"), 0, time.Now()) }
	require.NotPanics(t, testInstrumentWithError)

	testInstrumentWithoutError := func() { instrument(context.Background(), "", "", nil, 0, time.Now()) }
	require.NotPanics(t, testInstrumentWithoutError)
}
