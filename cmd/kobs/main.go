package main

import (
	"os"

	"github.com/kobsio/kobs/cmd/kobs/hub"
	"github.com/kobsio/kobs/cmd/kobs/satellite"
	"github.com/kobsio/kobs/cmd/kobs/version"
	"github.com/kobsio/kobs/pkg/log"

	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

var rootCmd = &cobra.Command{
	Use:   "kobs",
	Short: "kobs - Kubernetes Observability Platform.",
	Long:  "kobs - Kubernetes Observability Platform.",
}

func init() {
	defaultDebugUsername := ""
	if os.Getenv("KOBS_DEBUG_USERNAME") != "" {
		defaultDebugUsername = os.Getenv("KOBS_DEBUG_USERNAME")
	}

	defaultDebugPassword := ""
	if os.Getenv("KOBS_DEBUG_PASSWORD") != "" {
		defaultDebugPassword = os.Getenv("KOBS_DEBUG_PASSWORD")
	}

	defaultLogFormat := "console"
	if os.Getenv("KOBS_LOG_FORMAT") != "" {
		defaultLogFormat = os.Getenv("KOBS_LOG_FORMAT")
	}

	defaultLogLevel := "info"
	if os.Getenv("KOBS_LOG_LEVEL") != "" {
		defaultLogLevel = os.Getenv("KOBS_LOG_LEVEL")
	}

	defaultTraceServiceName := "kobs"
	if os.Getenv("KOBS_TRACE_SERVICE_NAME") != "" {
		defaultTraceServiceName = os.Getenv("KOBS_TRACE_SERVICE_NAME")
	}

	defaultTraceProvider := "jaeger"
	if os.Getenv("KOBS_TRACE_PROVIDER") != "" {
		defaultTraceProvider = os.Getenv("KOBS_TRACE_PROVIDER")
	}

	defaultTraceAddress := "http://localhost:14268/api/traces"
	if os.Getenv("KOBS_TRACE_ADDRESS") != "" {
		defaultTraceAddress = os.Getenv("KOBS_TRACE_ADDRESS")
	}

	rootCmd.AddCommand(hub.Cmd)
	rootCmd.AddCommand(satellite.Cmd)
	rootCmd.AddCommand(version.Cmd)

	rootCmd.PersistentFlags().String("debug.username", defaultDebugUsername, "The username for the debug endpoints. The endpoints are only available when a username is provided.")
	rootCmd.PersistentFlags().String("debug.password", defaultDebugPassword, "The password for the debug endpoints. The endpoints are only available when a password is provided.")
	rootCmd.PersistentFlags().String("log.format", defaultLogFormat, "Set the output format of the logs. Must be \"console\" or \"json\".")
	rootCmd.PersistentFlags().String("log.level", defaultLogLevel, "Set the log level. Must be \"debug\", \"info\", \"warn\", \"error\", \"fatal\" or \"panic\".")
	rootCmd.PersistentFlags().Bool("trace.enabled", false, "Enable / disable tracing.")
	rootCmd.PersistentFlags().String("trace.service-name", defaultTraceServiceName, "The service name which should be used for tracing.")
	rootCmd.PersistentFlags().String("trace.provider", defaultTraceProvider, "Set the trace exporter which should be used. Must be \"jaeger\" or \"zipkin\".")
	rootCmd.PersistentFlags().String("trace.address", defaultTraceAddress, "Set the address of the Jaeger or Zipkin instance.")
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		log.Fatal(nil, "Failed to initialize kobs", zap.Error(err))
	}
}
