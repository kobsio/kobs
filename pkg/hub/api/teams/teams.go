package teams

import (
	"net/http"
	"strconv"

	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	dbClient db.Client
}

func (router *Router) getTeams(w http.ResponseWriter, r *http.Request) {
	user := authContext.MustGetUser(r.Context())
	var teams []teamv1.TeamSpec
	var err error
	all := r.URL.Query().Get("all")

	parsedAll, _ := strconv.ParseBool(all)
	if parsedAll {
		if !user.HasTeamAccess("*") {
			log.Warn(r.Context(), "The user is not authorized to view all teams", zap.Error(err))
			errresponse.Render(w, r, http.StatusForbidden, "You are not allowed to view all teams")
			return
		}

		teams, err = router.dbClient.GetTeams(r.Context())
		if err != nil {
			log.Error(r.Context(), "Failed to get teams", zap.Error(err))
			errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get teams")
			return
		}
	} else {
		teams, err = router.dbClient.GetTeamsByIDs(r.Context(), user.Teams)
		if err != nil {
			log.Error(r.Context(), "Failed to get teams", zap.Error(err))
			errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get teams")
			return
		}
	}

	var aggregatedTeams []teamv1.TeamSpec
	for _, team := range teams {
		aggregatedTeams = utils.AppendIf(
			aggregatedTeams,
			team,
			func(iter, nw teamv1.TeamSpec) bool { return iter.ID != nw.ID },
		)
	}

	render.JSON(w, r, aggregatedTeams)
}

func (router *Router) getTeam(w http.ResponseWriter, r *http.Request) {
	user := authContext.MustGetUser(r.Context())
	id := r.URL.Query().Get("id")

	if !user.HasTeamAccess(id) {
		log.Warn(r.Context(), "The user is not authorized to view the team", zap.String("id", id))
		errresponse.Render(w, r, http.StatusForbidden, "You are not allowed to view the team")
		return
	}

	team, err := router.dbClient.GetTeamByID(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Failed to get team", zap.Error(err), zap.String("id", id))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get team")
		return
	}

	render.JSON(w, r, team)
}

func Mount(dbClient db.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		dbClient,
	}

	router.Get("/", router.getTeams)
	router.Get("/team", router.getTeam)

	return router
}
