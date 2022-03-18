package plugins

import (
	"github.com/kobsio/kobs/plugins/backstage"
	"net/http"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"

	// Import all plugins, which should be used with the kobs instance. By default this are all first party plugins from
	// the plugins folder.
	"github.com/kobsio/kobs/plugins/applications"
	"github.com/kobsio/kobs/plugins/azure"
	"github.com/kobsio/kobs/plugins/dashboards"
	"github.com/kobsio/kobs/plugins/elasticsearch"
	"github.com/kobsio/kobs/plugins/flux"
	"github.com/kobsio/kobs/plugins/grafana"
	"github.com/kobsio/kobs/plugins/harbor"
	"github.com/kobsio/kobs/plugins/helm"
	"github.com/kobsio/kobs/plugins/istio"
	"github.com/kobsio/kobs/plugins/jaeger"
	"github.com/kobsio/kobs/plugins/kiali"
	"github.com/kobsio/kobs/plugins/klogs"
	"github.com/kobsio/kobs/plugins/markdown"
	"github.com/kobsio/kobs/plugins/opsgenie"
	"github.com/kobsio/kobs/plugins/prometheus"
	"github.com/kobsio/kobs/plugins/resources"
	"github.com/kobsio/kobs/plugins/rss"
	"github.com/kobsio/kobs/plugins/sonarqube"
	"github.com/kobsio/kobs/plugins/sql"
	"github.com/kobsio/kobs/plugins/teams"
	"github.com/kobsio/kobs/plugins/techdocs"
	"github.com/kobsio/kobs/plugins/users"
)

// Config holds the configuration for all plugins. We have to add the configuration for all the imported plugins.
type Config struct {
	Applications  applications.Config  `json:"applications"`
	Azure         azure.Config         `json:"azure"`
	Backstage     backstage.Config     `json:"backstage"`
	Dashboards    dashboards.Config    `json:"dashboards"`
	Elasticsearch elasticsearch.Config `json:"elasticsearch"`
	Flux          flux.Config          `json:"flux"`
	Grafana       grafana.Config       `json:"grafana"`
	Harbor        harbor.Config        `json:"harbor"`
	Helm          helm.Config          `json:"helm"`
	Istio         istio.Config         `json:"istio"`
	Jaeger        jaeger.Config        `json:"jaeger"`
	Kiali         kiali.Config         `json:"kiali"`
	Klogs         klogs.Config         `json:"klogs"`
	Opsgenie      opsgenie.Config      `json:"opsgenie"`
	Prometheus    prometheus.Config    `json:"prometheus"`
	Markdown      markdown.Config      `json:"markdown"`
	Resources     resources.Config     `json:"resources"`
	RSS           rss.Config           `json:"rss"`
	Sonarqube     sonarqube.Config     `json:"sonarqube"`
	SQL           sql.Config           `json:"sql"`
	Teams         teams.Config         `json:"teams"`
	TechDocs      techdocs.Config      `json:"techdocs"`
	Users         users.Config         `json:"users"`
}

// Router implements the router for the plugins package. This only registeres one route which is used to return all the
// configured plugins.
type Router struct {
	*chi.Mux
	plugins *plugin.Plugins
}

// getPlugins returns all registered plugin instances.
func (router *Router) getPlugins(w http.ResponseWriter, r *http.Request) {
	render.JSON(w, r, router.plugins)
}

// Register is used to register all api routes for plugins.
func Register(clustersClient clusters.Client, config Config) chi.Router {
	router := Router{
		chi.NewRouter(),
		&plugin.Plugins{},
	}

	router.Get("/", router.getPlugins)

	// Initialize all plugins
	resourcesRouter := resources.Register(clustersClient, router.plugins, config.Resources)
	applicationsRouter := applications.Register(clustersClient, router.plugins, config.Applications)
	teamsRouter := teams.Register(clustersClient, router.plugins, config.Teams)
	usersRouter := users.Register(clustersClient, router.plugins, config.Users)
	dashboardsRouter := dashboards.Register(clustersClient, router.plugins, config.Dashboards)
	helmRouter := helm.Register(clustersClient, router.plugins, config.Helm)
	prometheusRouter, prometheusInstances := prometheus.Register(router.plugins, config.Prometheus)
	elasticsearchRouter := elasticsearch.Register(router.plugins, config.Elasticsearch)
	klogsRouter, klogsInstances := klogs.Register(router.plugins, config.Klogs)
	jaegerRouter := jaeger.Register(router.plugins, config.Jaeger)
	kialiRouter := kiali.Register(router.plugins, config.Kiali)
	istioRouter := istio.Register(router.plugins, config.Istio, prometheusInstances, klogsInstances)
	grafanaRouter := grafana.Register(router.plugins, config.Grafana)
	harborRouter := harbor.Register(router.plugins, config.Harbor)
	fluxRouter := flux.Register(clustersClient, router.plugins, config.Flux)
	opsgenieRouter := opsgenie.Register(router.plugins, config.Opsgenie)
	sonarqubeRouter := sonarqube.Register(router.plugins, config.Sonarqube)
	techdocsRouter := techdocs.Register(router.plugins, config.TechDocs)
	azureRouter := azure.Register(router.plugins, config.Azure)
	sqlRouter := sql.Register(router.plugins, config.SQL)
	markdownRouter := markdown.Register(router.plugins, config.Markdown)
	rssRouter := rss.Register(router.plugins, config.RSS)
	backstageRouter := backstage.Register(router.plugins, config.Backstage, applicationsRouter, prometheusInstances)

	// Register all plugins
	router.Mount(resources.Route, resourcesRouter)
	router.Mount(applications.Route, applicationsRouter)
	router.Mount(teams.Route, teamsRouter)
	router.Mount(users.Route, usersRouter)
	router.Mount(dashboards.Route, dashboardsRouter)
	router.Mount(helm.Route, helmRouter)
	router.Mount(prometheus.Route, prometheusRouter)
	router.Mount(elasticsearch.Route, elasticsearchRouter)
	router.Mount(klogs.Route, klogsRouter)
	router.Mount(jaeger.Route, jaegerRouter)
	router.Mount(kiali.Route, kialiRouter)
	router.Mount(istio.Route, istioRouter)
	router.Mount(grafana.Route, grafanaRouter)
	router.Mount(harbor.Route, harborRouter)
	router.Mount(flux.Route, fluxRouter)
	router.Mount(opsgenie.Route, opsgenieRouter)
	router.Mount(sonarqube.Route, sonarqubeRouter)
	router.Mount(techdocs.Route, techdocsRouter)
	router.Mount(azure.Route, azureRouter)
	router.Mount(sql.Route, sqlRouter)
	router.Mount(markdown.Route, markdownRouter)
	router.Mount(rss.Route, rssRouter)
	router.Mount(backstage.Route, backstageRouter)

	return router
}
