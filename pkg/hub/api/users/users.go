package users

import (
	"encoding/json"
	"net/http"

	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	"github.com/kobsio/kobs/pkg/hub/app/settings"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"
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

func (router *Router) saveUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	authUser := authContext.MustGetUser(ctx)

	if !router.appSettings.Save.Enabled {
		errresponse.Render(w, r, http.StatusMethodNotAllowed, "Save is disabled")
		return
	}

	var user userv1.UserSpec

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		log.Error(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	if user.ID == "" || user.Cluster == "" || user.Namespace == "" || user.Name == "" {
		log.Error(r.Context(), "Invalid user data")
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid user data")
		return
	}

	if user.ID != authUser.ID {
		log.Warn(ctx, "The user is not authorized to edit the user")
		errresponse.Render(w, r, http.StatusForbidden, "You are not allowed to edit the user")
		return
	}

	err = router.dbClient.SaveUser(ctx, &user)
	if err != nil {
		log.Error(ctx, "Failed to save user", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to save user")
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

	router.Post("/user", router.saveUser)

	return router
}
