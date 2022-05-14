package log

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Setup our logging library. The logs can be written in console format (the console format is compatible with
// logfmt) or in json format. The default is console, because it is better to read during development. In a
// production environment you should consider to use json, so that the logs can be parsed by a logging system like
// Elasticsearch.
// Next to the log format it is also possible to configure the log leven. The accepted values are "debug", "info",
// "warn", "error", "fatal" and "panic". The default log level is "info".
func Setup(level, format string) {
	zapEncoderCfg := zap.NewProductionEncoderConfig()
	zapEncoderCfg.TimeKey = "timestamp"
	zapEncoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder

	isDevelopment := false
	if level == "debug" {
		isDevelopment = true
	}

	zapConfig := zap.Config{
		Level:            parseLevel(level),
		Development:      isDevelopment,
		Encoding:         format,
		EncoderConfig:    zapEncoderCfg,
		OutputPaths:      []string{"stderr"},
		ErrorOutputPaths: []string{"stderr"},
		Sampling: &zap.SamplingConfig{
			Initial:    100,
			Thereafter: 100,
		},
	}

	logger, err := zapConfig.Build(zap.AddCaller(), zap.AddCallerSkip(1))
	if err != nil {
		panic(err)
	}
	defer logger.Sync()

	zap.ReplaceGlobals(logger)
}
