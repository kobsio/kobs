package watcher

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/hub/watcher"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/instrument/metrics"
	"github.com/kobsio/kobs/pkg/instrument/tracer"
	"github.com/kobsio/kobs/pkg/plugins"
	"github.com/kobsio/kobs/pkg/utils/config"

	"go.uber.org/zap"
)

type Config struct {
	Clusters clusters.Config `json:"clusters"`
}

type Cmd struct {
	Log      log.Config     `embed:"" prefix:"log." envprefix:"KOBS_LOG_"`
	Tracer   tracer.Config  `embed:"" prefix:"tracer." envprefix:"KOBS_TRACER_"`
	Metrics  metrics.Config `embed:"" prefix:"metrics." envprefix:"KOBS_METRICS_"`
	Database db.Config      `embed:"" prefix:"database." envprefix:"KOBS_DATABASE_"`
	Watcher  watcher.Config `embed:"" prefix:"watcher." envprefix:"KOBS_WATCHER_"`
	Config   string         `env:"KOBS_CONFIG" default:"config.yaml" help:"The path to the configuration file for the hub."`
}

func (r *Cmd) Run(plugins []plugins.Plugin) error {
	logger, err := log.Setup(r.Log)
	if err != nil {
		return err
	}
	defer logger.Sync()

	tracerClient, err := tracer.Setup(r.Tracer)
	if err != nil {
		return err
	}
	if tracerClient != nil {
		defer tracerClient.Shutdown()
	}

	metricsServer := metrics.New(r.Metrics)
	go metricsServer.Start()
	defer metricsServer.Stop()

	cfg, err := config.Load[Config](r.Config)
	if err != nil {
		log.Error(nil, "Could not load configuration", zap.Error(err))
		return err
	}

	clustersClient, err := clusters.NewClient(cfg.Clusters)
	if err != nil {
		log.Error(nil, "Could not create clusters client", zap.Error(err))
		return err
	}

	dbClient, err := db.NewClient(r.Database)
	if err != nil {
		log.Error(nil, "Could not create database client", zap.Error(err))
	}

	watcherClient, err := watcher.NewClient(r.Watcher, clustersClient, dbClient)
	if err != nil {
		log.Error(nil, "Could not create watcher", zap.Error(err))
		return err
	}
	go watcherClient.Watch()

	// All components should be terminated gracefully. For that we are listen for the SIGINT and SIGTERM signals and try
	// to gracefully shutdown the started kobs components. This ensures that established connections or tasks are not
	// interrupted.
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGTERM)

	log.Debug(nil, "Start listining for SIGINT and SIGTERM signal")
	<-done
	log.Info(nil, "Shutdown kobs watcher...")

	watcherClient.Stop()

	log.Info(nil, "Shutdown is done")

	return nil
}
