package teams

import (
	"encoding/json"
	"net/http"
	"strconv"

	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	"github.com/kobsio/kobs/pkg/hub/app/settings"
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
	appSettings settings.Settings
	dbClient    db.Client
}

func (router *Router) getTeams(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	all := r.URL.Query().Get("all")
	searchTerm := r.URL.Query().Get("searchTerm")
	user := authContext.MustGetUser(r.Context())

	log.Debug(ctx, "Get teams parameters", zap.String("all", all), zap.String("searchTerm", searchTerm))

	var teams []teamv1.TeamSpec
	var err error

	parsedAll, _ := strconv.ParseBool(all)
	if parsedAll {
		if !user.HasTeamAccess("*") {
			log.Warn(r.Context(), "The user is not authorized to view all teams", zap.Error(err))
			errresponse.Render(w, r, http.StatusForbidden, "You are not allowed to view all teams")
			return
		}

		teams, err = router.dbClient.GetTeams(r.Context(), searchTerm)
		if err != nil {
			log.Error(r.Context(), "Failed to get teams", zap.Error(err))
			errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get teams")
			return
		}
	} else {
		teams, err = router.dbClient.GetTeamsByIDs(r.Context(), user.Teams, searchTerm)
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
	ctx := r.Context()
	user := authContext.MustGetUser(ctx)
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

func (router *Router) saveTeam(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user := authContext.MustGetUser(ctx)

	if !router.appSettings.Save.Enabled {
		errresponse.Render(w, r, http.StatusMethodNotAllowed, "Save is disabled")
		return
	}

	var team teamv1.TeamSpec

	err := json.NewDecoder(r.Body).Decode(&team)
	if err != nil {
		log.Error(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	if team.ID == "" || team.Cluster == "" || team.Namespace == "" || team.Name == "" {
		log.Error(r.Context(), "Invalid team data")
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid team data")
		return
	}

	if !user.HasTeamAccess(team.ID) {
		log.Warn(ctx, "The user is not authorized to edit the team")
		errresponse.Render(w, r, http.StatusForbidden, "You are not allowed to edit the team")
		return
	}

	err = router.dbClient.SaveTeam(ctx, &team)
	if err != nil {
		log.Error(ctx, "Failed to save team", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to save team")
		return
	}

	render.Status(r, http.StatusNoContent)
	render.JSON(w, r, nil)
}

func Mount(appSettings settings.Settings, dbClient db.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		appSettings,
		dbClient,
	}

	router.Get("/", router.getTeams)
	router.Get("/team", router.getTeam)
	router.Post("/team", router.saveTeam)

	return router
}
