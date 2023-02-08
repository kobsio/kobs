package cluster

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/kobsio/kobs/pkg/cluster/api"
	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	clusterPlugins "github.com/kobsio/kobs/pkg/cluster/plugins"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/instrument/metrics"
	"github.com/kobsio/kobs/pkg/instrument/tracer"
	"github.com/kobsio/kobs/pkg/plugins"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/config"
	"go.uber.org/zap"
)

type Config struct {
	Plugins []plugin.Instance `json:"plugins"`
}

type Cmd struct {
	Log        log.Config        `embed:"" prefix:"log." envprefix:"KOBS_LOG_"`
	Tracer     tracer.Config     `embed:"" prefix:"tracer." envprefix:"KOBS_TRACER_"`
	Metrics    metrics.Config    `embed:"" prefix:"metrics." envprefix:"KOBS_METRICS_"`
	Kubernetes kubernetes.Config `embed:"" prefix:"kubernetes." envprefix:"KOBS_KUBERNETES_"`
	API        api.Config        `embed:"" prefix:"api." envprefix:"KOBS_API_"`
	Config     string            `env:"KOBS_CONFIG" default:"config.yaml" help:"The path to the configuration file for the cluster."`
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

	kubernetesClient, err := kubernetes.NewClient(r.Kubernetes)
	if err != nil {
		log.Error(nil, "Could not create Kubernetes client", zap.Error(err))
		return err
	}

	pluginsClient, err := clusterPlugins.NewClient(plugins, cfg.Plugins, kubernetesClient)
	if err != nil {
		log.Error(nil, "Could not create plugins client", zap.Error(err))
		return err
	}

	apiServer, err := api.New(r.API, kubernetesClient, pluginsClient)
	if err != nil {
		log.Error(nil, "Could not create client server", zap.Error(err))
		return err
	}
	go apiServer.Start()

	// All components should be terminated gracefully. For that we are listen for the SIGINT and SIGTERM signals and try
	// to gracefully shutdown the started kobs components. This ensures that established connections or tasks are not
	// interrupted.
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGTERM)

	log.Debug(nil, "Start listining for SIGINT and SIGTERM signal")
	<-done
	log.Info(nil, "Shutdown kobs client...")

	apiServer.Stop()

	log.Info(nil, "Shutdown is done")

	return nil
}
