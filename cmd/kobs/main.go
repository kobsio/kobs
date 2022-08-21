package main

import (
	"github.com/kobsio/kobs/cmd/kobs/root"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	azure "github.com/kobsio/kobs/plugins/plugin-azure/cmd"
	elasticsearch "github.com/kobsio/kobs/plugins/plugin-elasticsearch/cmd"
	flux "github.com/kobsio/kobs/plugins/plugin-flux/cmd"
	github "github.com/kobsio/kobs/plugins/plugin-github/cmd"
	grafana "github.com/kobsio/kobs/plugins/plugin-grafana/cmd"
	harbor "github.com/kobsio/kobs/plugins/plugin-harbor/cmd"
	helm "github.com/kobsio/kobs/plugins/plugin-helm/cmd"
	istio "github.com/kobsio/kobs/plugins/plugin-istio/cmd"
	jaeger "github.com/kobsio/kobs/plugins/plugin-jaeger/cmd"
	jira "github.com/kobsio/kobs/plugins/plugin-jira/cmd"
	kiali "github.com/kobsio/kobs/plugins/plugin-kiali/cmd"
	klogs "github.com/kobsio/kobs/plugins/plugin-klogs/cmd"
	opsgenie "github.com/kobsio/kobs/plugins/plugin-opsgenie/cmd"
	prometheus "github.com/kobsio/kobs/plugins/plugin-prometheus/cmd"
	rss "github.com/kobsio/kobs/plugins/plugin-rss/cmd"
	sonarqube "github.com/kobsio/kobs/plugins/plugin-sonarqube/cmd"
	sql "github.com/kobsio/kobs/plugins/plugin-sql/cmd"
	techdocs "github.com/kobsio/kobs/plugins/plugin-techdocs/cmd"

	"go.uber.org/zap"
)

func main() {
	var pluginMounts map[string]plugin.MountFn
	pluginMounts = make(map[string]plugin.MountFn)

	pluginMounts[azure.PluginType] = azure.Mount
	pluginMounts[elasticsearch.PluginType] = elasticsearch.Mount
	pluginMounts[flux.PluginType] = flux.Mount
	pluginMounts[github.PluginType] = github.Mount
	pluginMounts[grafana.PluginType] = grafana.Mount
	pluginMounts[harbor.PluginType] = harbor.Mount
	pluginMounts[helm.PluginType] = helm.Mount
	pluginMounts[istio.PluginType] = istio.Mount
	pluginMounts[jaeger.PluginType] = jaeger.Mount
	pluginMounts[jira.PluginType] = jira.Mount
	pluginMounts[kiali.PluginType] = kiali.Mount
	pluginMounts[klogs.PluginType] = klogs.Mount
	pluginMounts[opsgenie.PluginType] = opsgenie.Mount
	pluginMounts[prometheus.PluginType] = prometheus.Mount
	pluginMounts[rss.PluginType] = rss.Mount
	pluginMounts[sonarqube.PluginType] = sonarqube.Mount
	pluginMounts[sql.PluginType] = sql.Mount
	pluginMounts[techdocs.PluginType] = techdocs.Mount

	if err := root.Command(pluginMounts).Execute(); err != nil {
		log.Fatal(nil, "Failed to initialize kobs", zap.Error(err))
	}
}
