package teams

import (
	"net/http"

	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Config struct{}

type Router struct {
	*chi.Mux
	config         Config
	clustersClient clusters.Client
}

func (router *Router) getTeams(w http.ResponseWriter, r *http.Request) {
	log.Debug(r.Context(), "Get team")

	var teams []teamv1.TeamSpec

	for _, cluster := range router.clustersClient.GetClusters(r.Context()) {
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

func Mount(config Config, clustersClient clusters.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
		clustersClient,
	}

	router.Get("/", router.getTeams)

	return router
}
