package teams

import (
	"net/http"

	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

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
