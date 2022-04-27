package satellite

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/kobsio/kobs/cmd/kobs/satellite/config"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/metrics"
	"github.com/kobsio/kobs/pkg/satellite"
	"github.com/kobsio/kobs/pkg/satellite/plugins"
	"github.com/kobsio/kobs/pkg/satellite/router"
	"github.com/kobsio/kobs/pkg/version"

	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

var (
	satelliteAddress    string
	satelliteConfigFile string
	satellitePlugins    string
	satelliteToken      string
	metricsAddress      string
)

// Cmd is the cobra command to start a kobs satellite.
var Cmd = &cobra.Command{
	Use:   "satellite",
	Short: "Satellite component of kobs.",
	Long:  "Satellite component of kobs.",
	Run: func(cmd *cobra.Command, args []string) {
		// Get our global flags for kobs and use them to setup our logging configuration. After our logging is
		// configured we print the version information and build context of kobs.
		logLevel, _ := cmd.Flags().GetString("log.level")
		logFormat, _ := cmd.Flags().GetString("log.format")
		log.Setup(logLevel, logFormat)

		log.Info(nil, "Version information", version.Info()...)
		log.Info(nil, "Build context", version.BuildContext()...)

		// Load the configuration for the satellite from the provided configuration file.
		cfg, err := config.Load(satelliteConfigFile)
		if err != nil {
			log.Fatal(nil, "Could not load configuration file", zap.Error(err), zap.String("config", satelliteConfigFile))
		}

		// Load all cluster for the given clusters configuration and initialize our plugin manager, which contains a
		// router with all the routes for all plugins.
		// The loaded clusters and the router for the plugins is then passed to the satellite api package, so we can
		// access all the plugin routes via the kobs api.
		clustersClient, err := clusters.NewClient(cfg.Clusters)
		if err != nil {
			log.Fatal(nil, "Could not load clusters", zap.Error(err))
		}

		clustersRouter := router.NewRouter(cfg.Router, clustersClient)

		pluginsClient, err := plugins.NewClient(satellitePlugins, cfg.Plugins, clustersClient)
		if err != nil {
			log.Fatal(nil, "Could not initialize plugins client", zap.Error(err))
		}

		// Initialize each component and start it in it's own goroutine, so that the main goroutine is only used as
		// listener for terminal signals, to initialize the graceful shutdown of the components.
		// The satelliteServer handles all requests from a kobs hub and serves the configuration, so the hub knows which
		// clusters and plugins are available via this satellite instance. The metrics server is used to serve the kobs
		// metrics.
		satelliteServer, err := satellite.New(satelliteAddress, satelliteToken, clustersRouter, pluginsClient)
		if err != nil {
			log.Fatal(nil, "Could not create satellite server", zap.Error(err))
		}
		go satelliteServer.Start()

		metricsServer := metrics.New(metricsAddress)
		go metricsServer.Start()

		// All components should be terminated gracefully. For that we are listen for the SIGINT and SIGTERM signals and try
		// to gracefully shutdown the started kobs components. This ensures that established connections or tasks are not
		// interrupted.
		done := make(chan os.Signal, 1)
		signal.Notify(done, os.Interrupt, syscall.SIGTERM)

		log.Debug(nil, "Start listining for SIGINT and SIGTERM signal")
		<-done
		log.Info(nil, "Shutdown kobs satellite...")

		metricsServer.Stop()
		satelliteServer.Stop()

		log.Info(nil, "Shutdown is done")
	},
}

func init() {
	defaultSatelliteAddress := ":15221"
	if os.Getenv("KOBS_SATELLITE_ADDRESS") != "" {
		defaultSatelliteAddress = os.Getenv("KOBS_SATELLITE_ADDRESS")
	}

	defaultSatelliteConfigFile := "config.yaml"
	if os.Getenv("KOBS_SATELLITE_CONFIG") != "" {
		defaultSatelliteConfigFile = os.Getenv("KOBS_SATELLITE_CONFIG")
	}

	defaultSatelliteToken := ""
	if os.Getenv("KOBS_SATELLITE_TOKEN") != "" {
		defaultSatelliteToken = os.Getenv("KOBS_SATELLITE_TOKEN")
	}

	defaultSatellitePlugins := "plugins"
	if os.Getenv("KOBS_SATELLITE_PLUGINS") != "" {
		defaultSatellitePlugins = os.Getenv("KOBS_SATELLITE_PLUGINS")
	}

	defaultMetricsAddress := ":15222"
	if os.Getenv("KOBS_METRICS_ADDRESS") != "" {
		defaultMetricsAddress = os.Getenv("KOBS_METRICS_ADDRESS")
	}

	Cmd.PersistentFlags().StringVar(&satelliteAddress, "satellite.address", defaultSatelliteAddress, "The address, where the satellite is listen on.")
	Cmd.PersistentFlags().StringVar(&satelliteConfigFile, "satellite.config", defaultSatelliteConfigFile, "Path to the configuration file for the satellite.")
	Cmd.PersistentFlags().StringVar(&satellitePlugins, "satellite.plugins", defaultSatellitePlugins, "The directory which contains the plugin files.")
	Cmd.PersistentFlags().StringVar(&satelliteToken, "satellite.token", defaultSatelliteToken, "A token to protect the kobs satellite.")
	Cmd.PersistentFlags().StringVar(&metricsAddress, "metrics.address", defaultMetricsAddress, "The address, where the metrics server is listen on.")
}
