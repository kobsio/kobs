package teams

import (
	"net/http"
	"strconv"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/store"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	storeClient store.Client
}

func (router *Router) getTeams(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the teams", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the teams")
		return
	}

	var teams []teamv1.TeamSpec
	all := r.URL.Query().Get("all")

	parsedAll, _ := strconv.ParseBool(all)
	if parsedAll == true || (len(user.Permissions.Teams) == 1 && user.Permissions.Teams[0] == "*") {
		if !user.HasTeamAccess("*") {
			log.Warn(r.Context(), "The user is not authorized to view all teams", zap.Error(err))
			errresponse.Render(w, r, nil, http.StatusForbidden, "You are not allowed to view all teams")
			return
		}

		teams, err = router.storeClient.GetTeams(r.Context())
		if err != nil {
			log.Error(r.Context(), "Could not get teams", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get teams")
			return
		}
	} else {
		teams, err = router.storeClient.GetTeamsByGroups(r.Context(), user.Teams)
		if err != nil {
			log.Error(r.Context(), "Could not get teams", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get teams")
			return
		}
	}

	var aggregatedTeams []teamv1.TeamSpec
	for _, team := range teams {
		aggregatedTeams = appendIfMissing(aggregatedTeams, team)
	}

	render.JSON(w, r, aggregatedTeams)
}

func (router *Router) getTeam(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the team", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the team")
		return
	}

	group := r.URL.Query().Get("group")

	if !user.HasTeamAccess(group) {
		log.Warn(r.Context(), "The user is not authorized to view the team", zap.Error(err), zap.String("group", group))
		errresponse.Render(w, r, nil, http.StatusForbidden, "You are not allowed to view the team")
		return
	}

	team, err := router.storeClient.GetTeamByGroup(r.Context(), group)
	if err != nil {
		log.Error(r.Context(), "Could not get team", zap.Error(err), zap.String("group", group))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get team")
		return
	}

	render.JSON(w, r, team)
}

func Mount(storeClient store.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		storeClient,
	}

	router.Get("/", router.getTeams)
	router.Get("/team", router.getTeam)

	return router
}
