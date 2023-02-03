package users

import (
	"fmt"
	"net/http"

	dashboardv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/dashboard/v1"
	userv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/user/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/hub/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/instrument/log"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Config struct {
	DefaultDashboards []dashboardv1.Reference `json:"defaultDashboards"`
}

type Router struct {
	*chi.Mux
	config      Config
	storeClient db.Client
}

func (router *Router) getUser(w http.ResponseWriter, r *http.Request) {
	authUser := authContext.MustGetUser(r.Context())
	id := r.URL.Query().Get("id")

	if id != authUser.ID {
		log.Warn(r.Context(), "The user is not authorized to access the user", zap.String("id", id), zap.String("userID", authUser.ID))
		errresponse.Render(w, r, http.StatusForbidden, fmt.Errorf("you can only access you own profile"))
		return
	}

	user, err := router.storeClient.GetUserByID(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get user", zap.Error(err), zap.String("id", id))
		errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("could not get user"))
		return
	}

	profile := userv1.UserSpec{
		ID:         id,
		Dashboards: user.Dashboards,
	}

	if len(profile.Dashboards) == 0 {
		profile.Dashboards = router.config.DefaultDashboards
	}

	render.JSON(w, r, profile)
}

func Mount(config Config, storeClient db.Client) chi.Router {
	defaultDashboards := []dashboardv1.Reference{
		{
			Title: "Teams",
			Inline: &dashboardv1.ReferenceInline{
				HideToolbar: true,
				Panels: []dashboardv1.Panel{{
					W:           -1,
					Title:       "Teams",
					Description: "The teams you are part of",
					Plugin: dashboardv1.Plugin{
						Type: "app",
						Name: "userteams",
					},
				}},
			},
		},
		{
			Title: "Applications",
			Inline: &dashboardv1.ReferenceInline{
				HideToolbar: true,
				Panels: []dashboardv1.Panel{{
					W:           -1,
					Title:       "Applications",
					Description: "The applications which are owned by your teams",
					Plugin: dashboardv1.Plugin{
						Type: "app",
						Name: "userapplications",
					},
				}},
			},
		},
	}

	if len(config.DefaultDashboards) == 0 {
		config.DefaultDashboards = defaultDashboards
	}

	router := Router{
		chi.NewRouter(),
		config,
		storeClient,
	}

	router.Get("/user", router.getUser)

	return router
}
