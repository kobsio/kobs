package applications

import (
	"context"
	"net/http"
	"time"

	application "github.com/kobsio/kobs/pkg/api/apis/application/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/applications/pkg/tags"
	"github.com/kobsio/kobs/plugins/applications/pkg/teams"
	"github.com/kobsio/kobs/plugins/applications/pkg/topology"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/applications"

// Config is the structure of the configuration for the applications plugin.
type Config struct {
	Cache    CacheConfig       `json:"cache"`
	Topology []topology.Config `json:"topology"`
}

// CacheConfig is the structure of the cache configuration for the topology graph, teams and tags.
type CacheConfig struct {
	TopologyDuration string `json:"topologyDuration"`
	TeamsDuration    string `json:"teamsDuration"`
	TagsDuration     string `json:"tagsDuration"`
}

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clustersClient clusters.Client
	config         Config
	topology       topology.Cache
	teams          teams.Cache
	tags           tags.Cache
}

// getApplications returns a list of applications. This api endpoint supports multiple options to get applications. So
// we have three separete implementations for this endpoint. The first one is for the gallery view. For this the user
// must also define a list of clusters and namespaces. The second option for the gallery view is that the user defines
// a team for which he wants to retrieve the applications. The third option is the topology view, for which a list of
// cluster and namespaces is needed.
func (router *Router) getApplications(w http.ResponseWriter, r *http.Request) {
	clusterNames := r.URL.Query()["cluster"]
	namespaces := r.URL.Query()["namespace"]
	tagsList := r.URL.Query()["tag"]
	view := r.URL.Query().Get("view")
	teamCluster := r.URL.Query().Get("teamCluster")
	teamNamespace := r.URL.Query().Get("teamNamespace")
	teamName := r.URL.Query().Get("teamName")

	log.Debug(r.Context(), "Get applications parameters.", zap.Strings("clusters", clusterNames), zap.Strings("namespaces", namespaces), zap.Strings("tags", tagsList), zap.String("teamCluster", teamCluster), zap.String("teamNamespace", teamNamespace), zap.String("teamName", teamName), zap.String("view", view))

	if view == "gallery" {
		// If the view parameter has the value "gallery" and the team parameters are defined we return all applications
		// for this team. For this we are using the cached teams object. If the cache isn't to old we return the teams
		// from the cache. If the cached teams are to old and the teams slice is nil we are getting the teams first, add
		// them to the cache and then returning the applications for the requested team. If the cache is to old, but we
		// still have the teams cached we are returning the cached team and generating a new cache object in the
		// background.
		if teamCluster != "" && teamNamespace != "" && teamName != "" {
			if router.teams.LastFetch.After(time.Now().Add(-1 * router.teams.CacheDuration)) {
				applications := teams.GetApplications(router.teams.Teams, teamCluster, teamNamespace, teamName)
				log.Debug(r.Context(), "Get applications result.", zap.String("team", "return cached applications"), zap.Int("applicationsCount", len(applications)))
				render.JSON(w, r, applications)
				return
			}

			if router.teams.Teams == nil {
				ts := teams.Get(r.Context(), router.clustersClient)
				if ts != nil {
					router.teams.LastFetch = time.Now()
					router.teams.Teams = ts

					applications := teams.GetApplications(ts, teamCluster, teamNamespace, teamName)
					log.Debug(r.Context(), "Get applications result.", zap.String("team", "get and return applications"), zap.Int("applicationsCount", len(applications)))
					render.JSON(w, r, applications)
					return
				}

				log.Error(r.Context(), "Could not get applications")
				errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not get applications")
				return
			}

			go func() {
				ts := teams.Get(r.Context(), router.clustersClient)
				if ts != nil {
					log.Debug(r.Context(), "Get applications result.", zap.String("team", "get teams in background"), zap.Int("teamsCount", len(ts)))
					router.teams.LastFetch = time.Now()
					router.teams.Teams = ts
				}
			}()

			applications := teams.GetApplications(router.teams.Teams, teamCluster, teamNamespace, teamName)
			log.Debug(r.Context(), "Get applications result.", zap.String("team", "return applications"), zap.Int("applicationsCount", len(applications)))
			render.JSON(w, r, applications)
			return
		}

		// When no team is definied for the gallery view, we are returning all applications for the requested clusters
		// and namespaces. For this we just have to loop through the clusters and namespaces and add all the
		// applications to one list.
		var applications []application.ApplicationSpec

		for _, clusterName := range clusterNames {
			cluster := router.clustersClient.GetCluster(clusterName)
			if cluster == nil {
				log.Error(r.Context(), "Invalid cluster name.", zap.String("cluster", clusterName))
				errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
				return
			}

			if namespaces == nil {
				application, err := cluster.GetApplications(r.Context(), "")
				if err != nil {
					log.Error(r.Context(), "Could not get applications.", zap.Error(err))
					errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get applications")
					return
				}

				applications = append(applications, application...)
			} else {
				for _, namespace := range namespaces {
					application, err := cluster.GetApplications(r.Context(), namespace)
					if err != nil {
						log.Error(r.Context(), "Could not get applications.", zap.Error(err))
						errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get applications")
						return
					}

					applications = append(applications, application...)
				}
			}
		}

		applications = tags.FilterApplications(applications, tagsList)

		log.Debug(r.Context(), "Get applications results.", zap.Int("applicationsCount", len(applications)))
		render.JSON(w, r, applications)
		return
	}

	// The topology option returns a topology graph for the applications. In the best case we are returning the topology
	// graph from the cache. For that we just have to generate the topology graph for the users specified clusters and
	// namespaces. When the cache is to old and the topology graph is nil we have to get a new topology graph before we
	// can return it to the user. If the cache is to old and the topology isn't to old we return the cached topology
	// graph and generating a new one in the background.
	if view == "topology" {
		if router.topology.LastFetch.After(time.Now().Add(-1 * router.topology.CacheDuration)) {
			topo := topology.Generate(router.topology.Topology, clusterNames, namespaces, tagsList)
			log.Debug(r.Context(), "Get applications result.", zap.String("topology", "return cached topology"), zap.Int("edges", len(topo.Edges)), zap.Int("nodes", len(topo.Nodes)))
			render.JSON(w, r, topo)
			return
		}

		if router.topology.Topology == nil || router.topology.Topology.Nodes == nil {
			topo := topology.Get(r.Context(), router.clustersClient)
			if topo != nil && topo.Nodes != nil {
				router.topology.LastFetch = time.Now()
				router.topology.Topology = topo

				topo = topology.Generate(topo, clusterNames, namespaces, tagsList)
				log.Debug(r.Context(), "Get applications result.", zap.String("topology", "get and return topology"), zap.Int("edges", len(topo.Edges)), zap.Int("nodes", len(topo.Nodes)))
				render.JSON(w, r, topo)
				return
			}

			log.Error(r.Context(), "Could not generate topology.")
			errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not generate topology")
			return
		}

		go func() {
			topo := topology.Get(context.Background(), router.clustersClient)
			if topo != nil && topo.Nodes != nil {
				log.Debug(r.Context(), "Get applications result.", zap.String("topology", "get topology in background"), zap.Int("edges", len(topo.Edges)), zap.Int("nodes", len(topo.Nodes)))
				router.topology.LastFetch = time.Now()
				router.topology.Topology = topo
			}
		}()

		topo := topology.Generate(router.topology.Topology, clusterNames, namespaces, tagsList)
		log.Debug(r.Context(), "Get applications result.", zap.String("topology", "return topology"), zap.Int("edges", len(topo.Edges)), zap.Int("nodes", len(topo.Nodes)))
		render.JSON(w, r, topo)
		return
	}

	log.Error(r.Context(), "Invalid view property.")
	errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid view property")
}

// getApplication returns a a single application for the given clusters and namespaces and name. The cluster, namespace
// and name is defined via the corresponding query parameters.
func (router *Router) getApplication(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")

	log.Debug(r.Context(), "Get application parameters.", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name))

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name.", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	application, err := cluster.GetApplication(r.Context(), namespace, name)
	if err != nil {
		log.Error(r.Context(), "Could not get applications.")
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get application")
		return
	}

	render.JSON(w, r, application)
}

// getTags returns a list of tags from all applications in all clusters. For that we have to create a slice of tags
// across all clusters, namespaces and applications. After we created the slice of tag, we run our unique function to
// return each tag only once. Finally we are saving the unique slice of tags in our cache.
func (router *Router) getTags(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")

	log.Debug(r.Context(), "Get tags.", zap.String("name", name))

	if router.tags.LastFetch.After(time.Now().Add(-1 * router.tags.CacheDuration)) {
		log.Debug(r.Context(), "Get tags from cache result.", zap.Int("tagsCount", len(router.tags.Tags)))
		render.JSON(w, r, router.tags.Tags)
		return
	}

	var allTags []string

	for _, cluster := range router.clustersClient.GetClusters() {
		applications, err := cluster.GetApplications(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Could not get tags.", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get tags")
			return
		}

		for _, application := range applications {
			allTags = append(allTags, application.Tags...)
		}
	}

	uniqueTags := tags.Unique(allTags)
	router.topology.LastFetch = time.Now()
	router.tags.Tags = uniqueTags

	log.Debug(r.Context(), "Get tags result.", zap.Int("tagsCount", len(uniqueTags)))
	render.JSON(w, r, uniqueTags)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clustersClient clusters.Client, plugins *plugin.Plugins, config Config) chi.Router {
	var options map[string]interface{}
	options = make(map[string]interface{})
	options["topology"] = config.Topology

	plugins.Append(plugin.Plugin{
		Name:        "applications",
		DisplayName: "Applications",
		Description: "Monitor your Kubernetes workloads.",
		Home:        true,
		Type:        "applications",
		Options:     options,
	})

	var topology topology.Cache
	topologyCacheDuration, err := time.ParseDuration(config.Cache.TopologyDuration)
	if err != nil || topologyCacheDuration.Seconds() < 60 {
		topology.CacheDuration = time.Duration(1 * time.Hour)
	} else {
		topology.CacheDuration = topologyCacheDuration
	}

	var teams teams.Cache
	teamsCacheDuration, err := time.ParseDuration(config.Cache.TeamsDuration)
	if err != nil || teamsCacheDuration.Seconds() < 60 {
		teams.CacheDuration = time.Duration(1 * time.Hour)
	} else {
		teams.CacheDuration = teamsCacheDuration
	}

	var tags tags.Cache
	tagsCacheDuration, err := time.ParseDuration(config.Cache.TagsDuration)
	if err != nil || tagsCacheDuration.Seconds() < 60 {
		tags.CacheDuration = time.Duration(1 * time.Hour)
	} else {
		tags.CacheDuration = tagsCacheDuration
	}

	router := Router{
		chi.NewRouter(),
		clustersClient,
		config,
		topology,
		teams,
		tags,
	}

	router.Get("/applications", router.getApplications)
	router.Get("/application", router.getApplication)
	router.Get("/tags", router.getTags)

	return router
}
