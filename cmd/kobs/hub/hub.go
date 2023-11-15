package hub

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/kobsio/kobs/pkg/hub/api"
	"github.com/kobsio/kobs/pkg/hub/app"
	"github.com/kobsio/kobs/pkg/hub/auth"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	hubPlugins "github.com/kobsio/kobs/pkg/hub/plugins"
	"github.com/kobsio/kobs/pkg/instrument/debug"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/instrument/metrics"
	"github.com/kobsio/kobs/pkg/instrument/tracer"
	"github.com/kobsio/kobs/pkg/plugins"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/config"

	"go.uber.org/zap"
)

type Cmd struct {
	Config string `env:"KOBS_CONFIG" default:"config.yaml" help:"The path to the configuration file for the hub."`

	Hub struct {
		Debug    debug.Config      `json:"debug" embed:"" prefix:"debug." envprefix:"DEBUG_"`
		Log      log.Config        `json:"log" embed:"" prefix:"log." envprefix:"LOG_"`
		Tracer   tracer.Config     `json:"tracer" embed:"" prefix:"tracer." envprefix:"TRACER_"`
		Metrics  metrics.Config    `json:"metrics" embed:"" prefix:"metrics." envprefix:"METRICS_"`
		Database db.Config         `json:"database" embed:"" prefix:"database." envprefix:"DATABASE_"`
		API      api.Config        `json:"api" embed:"" prefix:"api." envprefix:"API_"`
		Auth     auth.Config       `json:"auth" embed:"" prefix:"auth." envprefix:"AUTH_"`
		App      app.Config        `json:"app" embed:"" prefix:"app." envprefix:"APP_"`
		Clusters clusters.Config   `json:"clusters" kong:"-"`
		Plugins  []plugin.Instance `json:"plugins" kong:"-"`
	} `json:"hub" embed:"" prefix:"hub." envprefix:"KOBS_HUB_"`
}

func (r *Cmd) Run(plugins []plugins.Plugin) error {
	cfg, err := config.Load(r.Config, *r)
	if err != nil {
		log.Error(context.Background(), "Could not load configuration", zap.Error(err))
		return err
	}

	logger, err := log.Setup(cfg.Hub.Log)
	if err != nil {
		return err
	}
	defer logger.Sync()

	tracerClient, err := tracer.Setup(cfg.Hub.Tracer)
	if err != nil {
		return err
	}
	if tracerClient != nil {
		defer tracerClient.Shutdown()
	}

	metricsServer := metrics.New(cfg.Hub.Metrics)
	go metricsServer.Start()
	defer metricsServer.Stop()

	if cfg.Hub.Debug.Enabled {
		debugServer := debug.New(cfg.Hub.Debug)
		go debugServer.Start()
		defer debugServer.Stop()
	}

	clustersClient, err := clusters.NewClient(cfg.Hub.Clusters)
	if err != nil {
		log.Error(context.Background(), "Could not create clusters client", zap.Error(err))
		return err
	}

	dbClient, err := db.NewClient(cfg.Hub.Database)
	if err != nil {
		log.Error(context.Background(), "Could not create database client", zap.Error(err))
		return err
	}

	err = dbClient.CreateIndexes(context.Background())
	if err != nil {
		log.Error(context.Background(), "Could not create indexes", zap.Error(err))
		return err
	}

	pluginsClient, err := hubPlugins.NewClient(plugins, cfg.Hub.Plugins, clustersClient, dbClient)
	if err != nil {
		log.Error(context.Background(), "Could not create plugins client", zap.Error(err))
		return err
	}

	authClient, err := auth.NewClient(cfg.Hub.Auth, cfg.Hub.App.Settings, dbClient)
	if err != nil {
		log.Error(context.Background(), "Could not create auth client", zap.Error(err))
		return err
	}

	apiServer, err := api.New(cfg.Hub.API, cfg.Hub.App.Settings, authClient, clustersClient, dbClient, pluginsClient)
	if err != nil {
		log.Error(context.Background(), "Could not create client server", zap.Error(err))
		return err
	}
	go apiServer.Start()

	appServer, err := app.New(cfg.Hub.App, cfg.Hub.API)
	if err != nil {
		log.Error(context.Background(), "Could not create Application server", zap.Error(err))
		return err
	}
	go appServer.Start()

	// All components should be terminated gracefully. For that we are listen for the SIGINT and SIGTERM signals and try
	// to gracefully shutdown the started kobs components. This ensures that established connections or tasks are not
	// interrupted.
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGTERM)

	log.Debug(context.Background(), "Start listening for SIGINT and SIGTERM signal")
	<-done
	log.Info(context.Background(), "Shutdown kobs hub...")

	appServer.Stop()
	apiServer.Stop()

	log.Info(context.Background(), "Shutdown is done")

	return nil
}
