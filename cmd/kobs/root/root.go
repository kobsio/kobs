package root

import (
	"os"

	"github.com/kobsio/kobs/cmd/kobs/hub"
	"github.com/kobsio/kobs/cmd/kobs/satellite"
	"github.com/kobsio/kobs/cmd/kobs/version"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/spf13/cobra"
)

// Command returns the root cobra command. If the user calls kobs without any additional command parameters, this
// command does nothing.
// The user has to pass in a custom map of MountFn functions. This map is then passed to the "satellite" command, so
// that we can register the plugins in the satellite API.
func Command(pluginMounts map[string]plugin.MountFn) *cobra.Command {
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

	rootCmd := &cobra.Command{
		Use:   "kobs",
		Short: "kobs - Kubernetes Observability Platform.",
		Long:  "kobs - Kubernetes Observability Platform.",
	}

	rootCmd.AddCommand(hub.Command())
	rootCmd.AddCommand(satellite.Command(pluginMounts))
	rootCmd.AddCommand(version.Command())

	rootCmd.PersistentFlags().String("debug.username", defaultDebugUsername, "The username for the debug endpoints. The endpoints are only available when a username is provided.")
	rootCmd.PersistentFlags().String("debug.password", defaultDebugPassword, "The password for the debug endpoints. The endpoints are only available when a password is provided.")
	rootCmd.PersistentFlags().String("log.format", defaultLogFormat, "Set the output format of the logs. Must be \"console\" or \"json\".")
	rootCmd.PersistentFlags().String("log.level", defaultLogLevel, "Set the log level. Must be \"debug\", \"info\", \"warn\", \"error\", \"fatal\" or \"panic\".")
	rootCmd.PersistentFlags().Bool("trace.enabled", false, "Enable / disable tracing.")
	rootCmd.PersistentFlags().String("trace.service-name", defaultTraceServiceName, "The service name which should be used for tracing.")
	rootCmd.PersistentFlags().String("trace.provider", defaultTraceProvider, "Set the trace exporter which should be used. Must be \"jaeger\" or \"zipkin\".")
	rootCmd.PersistentFlags().String("trace.address", defaultTraceAddress, "Set the address of the Jaeger or Zipkin instance.")

	return rootCmd
}
