package hub

import (
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/kobsio/kobs/cmd/kobs/hub/config"
	"github.com/kobsio/kobs/pkg/app"
	"github.com/kobsio/kobs/pkg/hub"
	"github.com/kobsio/kobs/pkg/hub/satellites"
	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/kobsio/kobs/pkg/hub/watcher"
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
	hubStoreURI         string
	hubStoreType        string
	hubWatcherEnabled   bool
	hubWatcherInterval  time.Duration
	hubWatcherWorker    int64
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

		// Initialize the store, which is used to "cache" all clusters, plugins, applications, etc. from the satellites.
		// So that we can directly interact with the store for these resources and do not have to call each satellite
		// for every single API request.
		// The store is then passed to the watcher. The watcher is used to get the resources from the satellites in a
		// preconfigured interval and to pass them to the store. To watch the resources we start the "Watch" process in
		// a new goroutine.
		satellitesClient, err := satellites.NewClient(cfg.Satellites)
		if err != nil {
			log.Fatal(nil, "Could not create satellites client", zap.Error(err))
		}

		storeClient, err := store.NewClient(hubStoreType, hubStoreURI)
		if err != nil {
			log.Fatal(nil, "Could not create store", zap.Error(err))
		}

		var watcherClient watcher.Client
		if hubWatcherEnabled {
			watcherClient, err = watcher.NewClient(hubWatcherInterval, hubWatcherWorker, satellitesClient, storeClient)
			if err != nil {
				log.Fatal(nil, "Could not create watcher", zap.Error(err))
			}
			go watcherClient.Watch()
		}

		// Initialize each component and start it in it's own goroutine, so that the main goroutine is only used as
		// listener for terminal signals, to initialize the graceful shutdown of the components.
		// The hubServer handles all requests from the kobs ui, which is served via the appServer. The metrics server is
		// used to serve the kobs metrics.
		hubSever, err := hub.New(hubAddress, authEnabled, authHeaderUser, authHeaderTeams, authSessionToken, authSessionInterval, satellitesClient, storeClient)
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

		if watcherClient != nil {
			err := watcherClient.Stop()
			if err != nil {
				log.Error(nil, "Failed to stop watcher", zap.Error(err))
			}
		}

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

	defaultHubStoreType := "sqlite"
	if os.Getenv("KOBS_HUB_STORE_TYPE") != "" {
		defaultHubStoreType = os.Getenv("KOBS_HUB_STORE_TYPE")
	}

	defaultHubStoreURI := "file::memory:?cache=shared"
	if os.Getenv("KOBS_HUB_STORE_URI") != "" {
		defaultHubStoreURI = os.Getenv("KOBS_HUB_STORE_URI")
	}

	defaultHubWatcherInterval := 300 * time.Second
	if os.Getenv("KOBS_HUB_WATCHER_INTERVAL") != "" {
		defaultHubWatcherIntervalEnv := os.Getenv("KOBS_HUB_WATCHER_INTERVAL")
		if defaultHubWatcherIntervalEnvParsed, err := time.ParseDuration(defaultHubWatcherIntervalEnv); err != nil {
			defaultHubWatcherInterval = defaultHubWatcherIntervalEnvParsed
		}
	}

	defaultHubWatcherWorker := int64(10)
	if os.Getenv("KOBS_HUB_WATCHER_WORKER") != "" {
		defaultHubWatcherWorkerEnv := os.Getenv("KOBS_HUB_WATCHER_WORKER")
		if defaultHubWatcherWorkerEnvParsed, err := strconv.ParseInt(defaultHubWatcherWorkerEnv, 10, 64); err != nil {
			defaultHubWatcherWorker = defaultHubWatcherWorkerEnvParsed
		}
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
	Cmd.PersistentFlags().StringVar(&hubStoreType, "hub.store.type", defaultHubStoreType, "The database type, which should be used for the store.")
	Cmd.PersistentFlags().StringVar(&hubStoreURI, "hub.store.uri", defaultHubStoreURI, "The URI for the store.")
	Cmd.PersistentFlags().BoolVar(&hubWatcherEnabled, "hub.watcher.enabled", true, "Enable / disable the watcher.")
	Cmd.PersistentFlags().DurationVar(&hubWatcherInterval, "hub.watcher.interval", defaultHubWatcherInterval, "The interval for the watcher to sync the satellite configuration.")
	Cmd.PersistentFlags().Int64Var(&hubWatcherWorker, "hub.watcher.worker", defaultHubWatcherWorker, "The number of parallel sync processes for the watcher.")
	Cmd.PersistentFlags().StringVar(&metricsAddress, "metrics.address", defaultMetricsAddress, "The address, where the metrics server is listen on.")
	Cmd.PersistentFlags().BoolVar(&authEnabled, "auth.enabled", false, "Enable the authentication and authorization middleware.")
	Cmd.PersistentFlags().StringVar(&authHeaderUser, "auth.header.user", defaultAuthHeaderUser, "The header, which contains the user id.")
	Cmd.PersistentFlags().StringVar(&authHeaderTeams, "auth.header.teams", defaultAuthHeaderTeams, "The header, which contains the team ids.")
	Cmd.PersistentFlags().StringVar(&authSessionToken, "auth.session.token", defaultAuthSessionToken, "The token to encrypt the session cookie.")
	Cmd.PersistentFlags().DurationVar(&authSessionInterval, "auth.session.interval", defaultAuthSessionInterval, "The interval for how long a session is valid.")
}
