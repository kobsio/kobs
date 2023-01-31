package log

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Config is the configuration for the log package. Within the configuration it is possible to set the log level and
// log format for our logging package.
type Config struct {
	Format string `env:"FORMAT" enum:"console,json" default:"console" help:"Set the output format of the logs. Must be \"console\" or \"json\"."`
	Level  string `env:"LEVEL" enum:"debug,info,warn,error,fatal,panic" default:"info" help:"Set the log level. Must be \"debug\", \"info\", \"warn\", \"error\", \"fatal\" or \"panic\"."`
}

// Setup our logging library. The logs can be written in console format (the console format is compatible with
// logfmt) or in json format. The default is console, because it is better to read during development. In a
// production environment you should consider to use json, so that the logs can be parsed by a logging system like
// Elasticsearch.
// Next to the log format it is also possible to configure the log leven. The accepted values are "debug", "info",
// "warn", "error", "fatal" and "panic". The default log level is "info".
func Setup(config Config) (*zap.Logger, error) {
	zapEncoderCfg := zap.NewProductionEncoderConfig()
	zapEncoderCfg.TimeKey = "timestamp"
	zapEncoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder

	isDevelopment := false
	if config.Level == "debug" {
		isDevelopment = true
	}

	zapConfig := zap.Config{
		Level:            parseLevel(config.Level),
		Development:      isDevelopment,
		Encoding:         config.Format,
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
		return nil, err
	}
	defer logger.Sync()

	zap.ReplaceGlobals(logger)

	return logger, nil
}
