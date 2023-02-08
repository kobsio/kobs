package teams

import (
	"fmt"
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

type Config struct{}

type Router struct {
	*chi.Mux
	storeClient db.Client
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
			errresponse.Render(w, r, http.StatusForbidden, fmt.Errorf("you are not allowed to view all teams"))
			return
		}

		teams, err = router.storeClient.GetTeams(r.Context())
		if err != nil {
			log.Error(r.Context(), "Could not get teams", zap.Error(err))
			errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("could not get teams"))
			return
		}
	} else {
		teams, err = router.storeClient.GetTeamsByIDs(r.Context(), user.Teams)
		if err != nil {
			log.Error(r.Context(), "Could not get teams", zap.Error(err))
			errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("could not get teams"))
			return
		}
	}

	var aggregatedTeams []teamv1.TeamSpec /*  */
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
		errresponse.Render(w, r, http.StatusForbidden, fmt.Errorf("you are not allowed to view the team"))
		return
	}

	team, err := router.storeClient.GetTeamByID(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get team", zap.Error(err), zap.String("id", id))
		errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("could not get team"))
		return
	}

	render.JSON(w, r, team)
}

func Mount(config Config, storeClient db.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		storeClient,
	}

	router.Get("/", router.getTeams)
	router.Get("/team", router.getTeam)

	return router
}
