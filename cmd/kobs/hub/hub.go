package hub

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/kobsio/kobs/cmd/kobs/hub/config"
	"github.com/kobsio/kobs/pkg/api/hub"
	"github.com/kobsio/kobs/pkg/app"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/metrics"
	"github.com/kobsio/kobs/pkg/version"

	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

var (
	appAddress          string
	appAssetsDir        string
	hubAddress          string
	hubConfigFile       string
	hubSyncInterval     time.Duration
	metricsAddress      string
	authEnabled         bool
	authHeaderUser      string
	authHeaderTeams     string
	authSessionToken    string
	authSessionInterval time.Duration
)

// Cmd is the cobra command to start the kobs hub.
var Cmd = &cobra.Command{
	Use:   "hub",
	Short: "Hub component of kobs.",
	Long:  "Hub component of kobs.",
	Run: func(cmd *cobra.Command, args []string) {
		// Get our global flags for kobs and use them to setup our logging configuration. After our logging is
		// configured we print the version information and build context of kobs.
		logLevel, _ := cmd.Flags().GetString("log.level")
		logFormat, _ := cmd.Flags().GetString("log.format")
		log.Setup(logLevel, logFormat)

		log.Info(nil, "Version information", version.Info()...)
		log.Info(nil, "Build context", version.BuildContext()...)

		// Load the configuration for the satellite from the provided configuration file.
		cfg, err := config.Load(hubConfigFile)
		if err != nil {
			log.Fatal(nil, "Could not load configuration file", zap.Error(err), zap.String("config", hubConfigFile))
		}
		fmt.Println(cfg)

		// TODO: Add "sync satellites" process, which is responsible for retrieving the configuration from all
		// satellites and sets all plugins and clusters.
		//
		// The sync process is also responsible for keeping the plugins and clustersClient in sync with the satellites
		// via polling.
		// clustersClient, err := clusters.NewClientForHub(cfg.Clusters)
		// if err != nil {
		// 	log.Fatal(nil, "Could not load clusters", zap.Error(err))
		// }

		// pluginsRouter, err := plugins.Register(cfg.Clusters)
		// if err != nil {
		// 	log.Fatal(nil, "Could not load plugins", zap.Error(err))
		// }

		// Initialize each component and start it in it's own goroutine, so that the main goroutine is only used as
		// listener for terminal signals, to initialize the graceful shutdown of the components.
		// The hubServer handles all requests from the kobs ui, which is served via the appServer. The metrics server is
		// used to serve the kobs metrics.
		hubSever, err := hub.New(hubAddress, authEnabled, authHeaderUser, authHeaderTeams, authSessionToken, authSessionInterval, nil, nil)
		if err != nil {
			log.Fatal(nil, "Could not create hub server", zap.Error(err))
		}
		go hubSever.Start()

		appServer, err := app.New(hubAddress, appAddress, appAssetsDir)
		if err != nil {
			log.Fatal(nil, "Could not create Application server", zap.Error(err))
		}
		go appServer.Start()

		metricsServer := metrics.New(metricsAddress)
		go metricsServer.Start()

		// All components should be terminated gracefully. For that we are listen for the SIGINT and SIGTERM signals and try
		// to gracefully shutdown the started kobs components. This ensures that established connections or tasks are not
		// interrupted.
		done := make(chan os.Signal, 1)
		signal.Notify(done, os.Interrupt, syscall.SIGTERM)

		log.Debug(nil, "Start listining for SIGINT and SIGTERM signal")
		<-done
		log.Info(nil, "Shutdown kobs hub...")

		metricsServer.Stop()
		appServer.Stop()
		hubSever.Stop()

		log.Info(nil, "Shutdown is done")
	},
}

func init() {
	defaultAppAddress := ":15219"
	if os.Getenv("KOBS_APP_ADDRESS") != "" {
		defaultAppAddress = os.Getenv("KOBS_APP_ADDRESS")
	}

	defaultAppAssetsDir := "app/build"
	if os.Getenv("KOBS_APP_ASSETS") != "" {
		defaultAppAssetsDir = os.Getenv("KOBS_APP_ASSETS")
	}

	defaultHubAddress := ":15220"
	if os.Getenv("KOBS_HUB_ADDRESS") != "" {
		defaultHubAddress = os.Getenv("KOBS_HUB_ADDRESS")
	}

	defaultHubConfigFile := "config.yaml"
	if os.Getenv("KOBS_HUB_CONFIG") != "" {
		defaultHubConfigFile = os.Getenv("KOBS_HUB_CONFIG")
	}

	defaultMetricsAddress := ":15222"
	if os.Getenv("KOBS_METRICS_ADDRESS") != "" {
		defaultMetricsAddress = os.Getenv("KOBS_METRICS_ADDRESS")
	}

	defaultAuthHeaderUser := "X-Auth-Request-Email"
	if os.Getenv("KOBS_AUTH_HEADER_USER") != "" {
		defaultAuthHeaderUser = os.Getenv("KOBS_AUTH_HEADER_USER")
	}

	defaultAuthHeaderTeams := "X-Auth-Request-Groups"
	if os.Getenv("KOBS_AUTH_HEADER_TEAMS") != "" {
		defaultAuthHeaderTeams = os.Getenv("KOBS_AUTH_HEADER_TEAMS")
	}

	defaultAuthSessionToken := ""
	if os.Getenv("KOBS_AUTH_SESSION_TOKEN") != "" {
		defaultAuthSessionToken = os.Getenv("KOBS_AUTH_SESSION_TOKEN")
	}

	defaultAuthSessionInterval := time.Duration(48 * time.Hour)
	if os.Getenv("KOBS_AUTH_SESSION_INTERVAL") != "" {
		parsedDefaultAuthSessionInterval, err := time.ParseDuration(os.Getenv("KOBS_AUTH_SESSION_INTERVAL"))
		if err == nil && parsedDefaultAuthSessionInterval > 60*time.Second {
			defaultAuthSessionInterval = parsedDefaultAuthSessionInterval
		}
	}

	Cmd.PersistentFlags().StringVar(&appAddress, "app.address", defaultAppAddress, "The address, where the application server is listen on.")
	Cmd.PersistentFlags().StringVar(&appAssetsDir, "app.assets", defaultAppAssetsDir, "The location of the assets directory.")
	Cmd.PersistentFlags().StringVar(&hubAddress, "hub.address", defaultHubAddress, "The address, where the hub is listen on.")
	Cmd.PersistentFlags().StringVar(&hubConfigFile, "hub.config", defaultHubConfigFile, "Path to the configuration file for the hub.")
	Cmd.PersistentFlags().DurationVar(&hubSyncInterval, "hub.sync-interval", time.Duration(10*time.Minute), "The sync interval for the hub with the satellites.")
	Cmd.PersistentFlags().StringVar(&metricsAddress, "metrics.address", defaultMetricsAddress, "The address, where the metrics server is listen on.")
	Cmd.PersistentFlags().BoolVar(&authEnabled, "auth.enabled", false, "Enable the authentication and authorization middleware.")
	Cmd.PersistentFlags().StringVar(&authHeaderUser, "auth.header.user", defaultAuthHeaderUser, "The header, which contains the user id.")
	Cmd.PersistentFlags().StringVar(&authHeaderTeams, "auth.header.teams", defaultAuthHeaderTeams, "The header, which contains the team ids.")
	Cmd.PersistentFlags().StringVar(&authSessionToken, "auth.session.token", defaultAuthSessionToken, "The token to encrypt the session cookie.")
	Cmd.PersistentFlags().DurationVar(&authSessionInterval, "auth.session.interval", defaultAuthSessionInterval, "The interval for how long a session is valid.")
}
