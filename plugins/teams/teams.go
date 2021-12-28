package teams

import (
	"net/http"

	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/teams"

// Config is the structure of the configuration for the teams plugin.
type Config struct{}

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clustersClient clusters.Client
	config         Config
}

// getTeams returns a list of teams for all clusters and namespaces. We always return all teams for all clusters and
// namespaces. For this we are looping though the loaded clusters and callend the GetTeams function for each one.
func (router *Router) getTeams(w http.ResponseWriter, r *http.Request) {
	log.Debug(r.Context(), "Get team.")

	var teams []team.TeamSpec

	for _, cluster := range router.clustersClient.GetClusters() {
		team, err := cluster.GetTeams(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Could not get teams.", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get teams")
			return
		}

		teams = append(teams, team...)
	}

	log.Debug(r.Context(), "Get teams result.", zap.Int("teamsCount", len(teams)))
	render.JSON(w, r, teams)
}

// getTeam returns a a single team for the given cluster and namespace and name. The cluster, namespace and name is
// defined via a corresponding query parameter. Then we are using the cluster object to get the team via the GetTeam
// function.
func (router *Router) getTeam(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")

	log.Debug(r.Context(), "Get team parameters.", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name))

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name.", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	team, err := cluster.GetTeam(r.Context(), namespace, name)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get team")
		return
	}

	render.JSON(w, r, team)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clustersClient clusters.Client, plugins *plugin.Plugins, config Config) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "teams",
		DisplayName: "Teams",
		Description: "Define an ownership for your Kubernetes resources.",
		Home:        true,
		Type:        "teams",
	})

	router := Router{
		chi.NewRouter(),
		clustersClient,
		config,
	}

	router.Get("/teams", router.getTeams)
	router.Get("/team", router.getTeam)

	return router
}
