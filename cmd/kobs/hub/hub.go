package hub

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/kobsio/kobs/pkg/hub/api"
	"github.com/kobsio/kobs/pkg/hub/app"
	"github.com/kobsio/kobs/pkg/hub/auth"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	hubPlugins "github.com/kobsio/kobs/pkg/hub/plugins"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/instrument/metrics"
	"github.com/kobsio/kobs/pkg/instrument/tracer"
	"github.com/kobsio/kobs/pkg/plugins"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/config"

	"go.uber.org/zap"
)

type Config struct {
	Clusters clusters.Config   `json:"clusters"`
	Plugins  []plugin.Instance `json:"plugins"`
}

type Cmd struct {
	Log      log.Config     `embed:"" prefix:"log." envprefix:"KOBS_LOG_"`
	Tracer   tracer.Config  `embed:"" prefix:"tracer." envprefix:"KOBS_TRACER_"`
	Metrics  metrics.Config `embed:"" prefix:"metrics." envprefix:"KOBS_METRICS_"`
	Database db.Config      `embed:"" prefix:"database." envprefix:"KOBS_DATABASE_"`
	API      api.Config     `embed:"" prefix:"api." envprefix:"KOBS_API_"`
	Auth     auth.Config    `embed:"" prefix:"auth." envprefix:"KOBS_AUTH_"`
	App      app.Config     `embed:"" prefix:"app." envprefix:"KOBS_APP_"`
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
		return err
	}

	pluginsClient, err := hubPlugins.NewClient(plugins, cfg.Plugins, clustersClient, dbClient)
	if err != nil {
		log.Error(nil, "Could not create plugins client", zap.Error(err))
		return err
	}

	authClient, err := auth.NewClient(r.Auth, dbClient)
	if err != nil {
		log.Error(nil, "Could not create auth client", zap.Error(err))
		return err
	}

	apiServer, err := api.New(r.API, authClient, clustersClient, dbClient, pluginsClient)
	if err != nil {
		log.Error(nil, "Could not create client server", zap.Error(err))
		return err
	}
	go apiServer.Start()

	appServer, err := app.New(r.App, r.API)
	if err != nil {
		log.Error(nil, "Could not create Application server", zap.Error(err))
		return err
	}
	go appServer.Start()

	// All components should be terminated gracefully. For that we are listen for the SIGINT and SIGTERM signals and try
	// to gracefully shutdown the started kobs components. This ensures that established connections or tasks are not
	// interrupted.
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGTERM)

	log.Debug(nil, "Start listining for SIGINT and SIGTERM signal")
	<-done
	log.Info(nil, "Shutdown kobs hub...")

	appServer.Stop()
	apiServer.Stop()

	log.Info(nil, "Shutdown is done")

	return nil
}
