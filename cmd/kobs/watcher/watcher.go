package watcher

import (
	"context"
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

type Cmd struct {
	Config string `env:"KOBS_CONFIG" default:"config.yaml" help:"The path to the configuration file for the watcher."`

	Log      log.Config     `json:"log" embed:"" prefix:"log." envprefix:"KOBS_LOG_"`
	Tracer   tracer.Config  `json:"tracer" embed:"" prefix:"tracer." envprefix:"KOBS_TRACER_"`
	Metrics  metrics.Config `json:"metrics" embed:"" prefix:"metrics." envprefix:"KOBS_METRICS_"`
	Database db.Config      `json:"database" embed:"" prefix:"database." envprefix:"KOBS_DATABASE_"`

	Watcher struct {
		Watcher  watcher.Config  `json:"watcher" embed:"" prefix:"watcher." envprefix:"WATCHER_"`
		Clusters clusters.Config `json:"clusters" kong:"-"`
	} `json:"watcher" embed:"" prefix:"watcher." envprefix:"KOBS_WATCHER_"`
}

func (r *Cmd) Run(plugins []plugins.Plugin) error {
	cfg, err := config.Load(r.Config, *r)
	if err != nil {
		log.Error(context.Background(), "Could not load configuration", zap.Error(err))
		return err
	}

	logger, err := log.Setup(cfg.Log)
	if err != nil {
		return err
	}
	defer logger.Sync()

	tracerClient, err := tracer.Setup(cfg.Tracer)
	if err != nil {
		return err
	}
	if tracerClient != nil {
		defer tracerClient.Shutdown()
	}

	metricsServer := metrics.New(cfg.Metrics)
	go metricsServer.Start()
	defer metricsServer.Stop()

	clustersClient, err := clusters.NewClient(cfg.Watcher.Clusters)
	if err != nil {
		log.Error(context.Background(), "Could not create clusters client", zap.Error(err))
		return err
	}

	dbClient, err := db.NewClient(cfg.Database)
	if err != nil {
		log.Error(context.Background(), "Could not create database client", zap.Error(err))
	}

	watcherClient, err := watcher.NewClient(cfg.Watcher.Watcher, clustersClient, dbClient)
	if err != nil {
		log.Error(context.Background(), "Could not create watcher", zap.Error(err))
		return err
	}
	go watcherClient.Watch()

	// All components should be terminated gracefully. For that we are listen for the SIGINT and SIGTERM signals and try
	// to gracefully shutdown the started kobs components. This ensures that established connections or tasks are not
	// interrupted.
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGTERM)

	log.Debug(context.Background(), "Start listining for SIGINT and SIGTERM signal")
	<-done
	log.Info(context.Background(), "Shutdown kobs watcher...")

	watcherClient.Stop()

	log.Info(context.Background(), "Shutdown is done")

	return nil
}
