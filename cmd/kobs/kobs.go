package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/kobsio/kobs/pkg/api"
	"github.com/kobsio/kobs/pkg/app"
	"github.com/kobsio/kobs/pkg/config"
	"github.com/kobsio/kobs/pkg/metrics"
	"github.com/kobsio/kobs/pkg/version"

	"github.com/sirupsen/logrus"
	flag "github.com/spf13/pflag"
)

var (
	log         = logrus.WithFields(logrus.Fields{"package": "main"})
	configFile  string
	logFormat   string
	logLevel    string
	showVersion bool
)

// init is used to define all flags for kobs. If a specific package needs some additional flags, they must be defined in
// the init method of the package. See the pkg/metrics/metrics.go file, which defines an additional metrics.address flag
// for the metrics server. All package specific flags should be prefixed with the name of the package.
func init() {
	defaultConfigFile := "config.yaml"
	if os.Getenv("KOBS_CONFIG") != "" {
		defaultConfigFile = os.Getenv("KOBS_CONFIG")
	}

	defaultLogFormat := "plain"
	if os.Getenv("KOBS_LOG_FORMAT") != "" {
		defaultLogFormat = os.Getenv("KOBS_LOG_FORMAT")
	}

	defaultLogLevel := "info"
	if os.Getenv("KOBS_LOG_LEVEL") != "" {
		defaultLogLevel = os.Getenv("KOBS_LOG_LEVEL")
	}

	flag.StringVar(&configFile, "config", defaultConfigFile, "Name of the configuration file.")
	flag.StringVar(&logFormat, "log.format", defaultLogFormat, "Set the output format of the logs. Must be \"plain\" or \"json\".")
	flag.StringVar(&logLevel, "log.level", defaultLogLevel, "Set the log level. Must be \"trace\", \"debug\", \"info\", \"warn\", \"error\", \"fatal\" or \"panic\".")
	flag.BoolVar(&showVersion, "version", false, "Print version information.")
}

func main() {
	flag.Parse()

	// Configure our logging library. The logs can be written in plain format (the plain format is compatible with
	// logfmt) or in json format. The default is plain, because it is better to read during development. In a production
	// environment you should consider to use json, so that the logs can be parsed by a logging system like
	// Elasticsearch.
	// Next to the log format it is also possible to configure the log leven. The accepted values are "trace", "debug",
	// "info", "warn", "error", "fatal" and "panic". The default log level is "info". When the log level is set to
	// "trace" or "debug" we will also print the caller in the logs.
	if logFormat == "json" {
		logrus.SetFormatter(&logrus.JSONFormatter{})
	} else {
		logrus.SetFormatter(&logrus.TextFormatter{})
	}

	lvl, err := logrus.ParseLevel(logLevel)
	if err != nil {
		log.WithError(err).WithFields(logrus.Fields{"log.level": logLevel}).Fatal("Could not set log level")
	}
	logrus.SetLevel(lvl)

	if lvl == logrus.TraceLevel || lvl == logrus.DebugLevel {
		logrus.SetReportCaller(true)
	}

	// Load the configuration for kobs from the provided configuration file.
	cfg, err := config.Load(configFile)
	if err != nil {
		log.WithError(err).WithFields(logrus.Fields{"config": configFile}).Fatalf("Could not load configuration file.")
	}

	// When the version value is set to "true" (--version) we will print the version information for kobs. After we
	// printed the version information the application is stopped.
	// The short form of the version information is also printed in two lines, when the version option is set to
	// "false".
	if showVersion {
		v, err := version.Print("kobs")
		if err != nil {
			log.WithError(err).Fatalf("Failed to print version information")
		}

		fmt.Fprintln(os.Stdout, v)
		return
	}

	log.WithFields(version.Info()).Infof("Version information")
	log.WithFields(version.BuildContext()).Infof("Build context")

	// Initialize each component and start it in it's own goroutine, so that the main goroutine is only used as listener
	// for terminal signals, to initialize the graceful shutdown of the components.
	// The appServer is the kobs application server, which serves the React frontend and the health endpoint. The
	// metrics server is used to serve the kobs metrics.
	appServer, err := app.New()
	if err != nil {
		log.WithError(err).Fatalf("Could not create application server.")
	}
	go appServer.Start()

	apiServer, err := api.New(cfg)
	if err != nil {
		log.WithError(err).Fatalf("Could not create API server.")
	}
	go apiServer.Start()

	metricsServer := metrics.New()
	go metricsServer.Start()

	// All components should be terminated gracefully. For that we are listen for the SIGINT and SIGTERM signals and try
	// to gracefully shutdown the started kobs components. This ensures that established connections or tasks are not
	// interrupted.
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	log.Debugf("Start listining for SIGINT and SIGTERM signal.")
	<-done
	log.Debugf("Start shutdown process.")

	metricsServer.Stop()
	apiServer.Stop()
	appServer.Stop()

	log.Infof("Shutdown kobs...")
}
