package log

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// ParseLevel parses the give string for the log level and returns the corresponding log level for zap.
func ParseLevel(level string) zap.AtomicLevel {
	switch level {
	case "debug":
		return zap.NewAtomicLevelAt(zapcore.DebugLevel)
	case "info":
		return zap.NewAtomicLevelAt(zapcore.InfoLevel)
	case "warn":
		return zap.NewAtomicLevelAt(zapcore.WarnLevel)
	case "error":
		return zap.NewAtomicLevelAt(zapcore.ErrorLevel)
	case "fatal":
		return zap.NewAtomicLevelAt(zapcore.FatalLevel)
	case "panic":
		return zap.NewAtomicLevelAt(zapcore.PanicLevel)
	default:
		return zap.NewAtomicLevelAt(zapcore.InfoLevel)
	}
}
