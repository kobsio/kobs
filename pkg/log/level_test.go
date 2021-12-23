package log

import (
	"testing"

	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func TestPrint(t *testing.T) {
	debugLevel := ParseLevel("debug")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.DebugLevel), debugLevel)

	infoLevel := ParseLevel("info")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.InfoLevel), infoLevel)

	warnLevel := ParseLevel("warn")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.WarnLevel), warnLevel)

	errorLevel := ParseLevel("error")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.ErrorLevel), errorLevel)

	fatalLevel := ParseLevel("fatal")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.FatalLevel), fatalLevel)

	panicLevel := ParseLevel("panic")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.PanicLevel), panicLevel)

	defaultLevel := ParseLevel("default")
	require.Equal(t, zap.NewAtomicLevelAt(zapcore.InfoLevel), defaultLevel)
}
