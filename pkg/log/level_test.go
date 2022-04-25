package log

import (
	"testing"

	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func TestPrint(t *testing.T) {
	debugLevel := parseLevel("debug")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.DebugLevel), debugLevel)

	infoLevel := parseLevel("info")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.InfoLevel), infoLevel)

	warnLevel := parseLevel("warn")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.WarnLevel), warnLevel)

	errorLevel := parseLevel("error")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.ErrorLevel), errorLevel)

	fatalLevel := parseLevel("fatal")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.FatalLevel), fatalLevel)

	panicLevel := parseLevel("panic")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.PanicLevel), panicLevel)

	defaultLevel := parseLevel("default")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.InfoLevel), defaultLevel)
}
