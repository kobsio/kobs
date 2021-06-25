package teams

import (
	"net/http"

	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/teams"

var (
	log = logrus.WithFields(logrus.Fields{"package": "teams"})
)

// Config is the structure of the configuration for the teams plugin.
type Config struct{}

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clusters *clusters.Clusters
	config   Config
}

// getTeams returns a list of teams for all clusters and namespaces. We always return all teams for all clusters and
// namespaces. For this we are looping though the loaded clusters and callend the GetTeams function for each one.
func (router *Router) getTeams(w http.ResponseWriter, r *http.Request) {
	log.Tracef("getTeams")

	var teams []team.TeamSpec

	for _, cluster := range router.clusters.Clusters {
		team, err := cluster.GetTeams(r.Context(), "")
		if err != nil {
			render.Render(w, r, errresponse.Render(err, http.StatusBadRequest, "could not get teams"))
			return
		}

		teams = append(teams, team...)
	}

	log.WithFields(logrus.Fields{"count": len(teams)}).Tracef("getTeams")
	render.JSON(w, r, teams)
}

// getTeam returns a a single team for the given cluster and namespace and name. The cluster, namespace and name is
// defined via a corresponding query parameter. Then we are using the cluster object to get the team via the GetTeam
// function.
func (router *Router) getTeam(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")

	log.WithFields(logrus.Fields{"cluster": clusterName, "namespace": namespace, "name": name}).Tracef("getTeam")

	cluster := router.clusters.GetCluster(clusterName)
	if cluster == nil {
		render.Render(w, r, errresponse.Render(nil, http.StatusBadRequest, "invalid cluster name"))
		return
	}

	team, err := cluster.GetTeam(r.Context(), namespace, name)
	if err != nil {
		render.Render(w, r, errresponse.Render(err, http.StatusBadRequest, "could not get team"))
		return
	}

	render.JSON(w, r, team)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "teams",
		DisplayName: "Teams",
		Description: "TODO",
		Type:        "teams",
	})

	router := Router{
		chi.NewRouter(),
		clusters,
		config,
	}

	router.Get("/teams", router.getTeams)
	router.Get("/team", router.getTeam)

	return router
}
