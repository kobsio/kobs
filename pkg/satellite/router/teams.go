package router

import (
	"net/http"

	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// getUserTeams returns a list of teams for all clusters and namespaces. We always return all teams for all clusters and
// namespaces. For this we are looping though the loaded clusters and called the GetTeams function for each one.
func (router *Router) getTeams(w http.ResponseWriter, r *http.Request) {
	log.Debug(r.Context(), "Get team")

	var teams []teamv1.TeamSpec

	for _, cluster := range router.clustersClient.GetClusters() {
		team, err := cluster.GetTeams(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Could not get teams", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get teams")
			return
		}

		teams = append(teams, team...)
	}

	log.Debug(r.Context(), "Get teams result", zap.Int("teamsCount", len(teams)))
	render.JSON(w, r, teams)
}

// getUserTeam returns a single team for the given cluster and namespace and name. The cluster, namespace and name is
// defined via a corresponding query parameter. Then we are using the cluster object to get the team via the GetTeam
// function.
func (router *Router) getTeam(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")

	log.Debug(r.Context(), "Get team parameters", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name))

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
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
