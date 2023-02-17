package watcher

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
)

func TestInstrument(t *testing.T) {
	testInstrumentWithError := func() {
		ctx, span := otel.Tracer("watcher").Start(context.Background(), "watcher")
		instrument(ctx, span, "", "", fmt.Errorf("test error"), 0, time.Now())
	}
	require.NotPanics(t, testInstrumentWithError)

	testInstrumentWithoutError := func() {
		ctx, span := otel.Tracer("watcher").Start(context.Background(), "watcher")
		instrument(ctx, span, "", "", nil, 0, time.Now())
	}
	require.NotPanics(t, testInstrumentWithoutError)
}
