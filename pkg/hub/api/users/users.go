package users

import (
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/store"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

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
	storeClient store.Client
}

func (router *Router) getUser(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the user", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the user")
		return
	}

	email := r.URL.Query().Get("email")

	if email != user.Email {
		log.Warn(r.Context(), "The user is not authorized to access the user", zap.Error(err))
		errresponse.Render(w, r, nil, http.StatusForbidden, "You can only access you own profile")
		return
	}

	users, err := router.storeClient.GetUsersByEmail(r.Context(), email)
	if err != nil {
		log.Error(r.Context(), "Could not get user", zap.Error(err), zap.String("email", email))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get user")
		return
	}

	profile := userv1.UserSpec{
		Email: email,
	}

	for _, v := range users {
		profile.Dashboards = append(profile.Dashboards, v.Dashboards...)
	}

	if len(profile.Dashboards) == 0 {
		profile.Dashboards = router.config.DefaultDashboards
	}

	render.JSON(w, r, profile)
}

func Mount(config Config, storeClient store.Client) chi.Router {
	defaultDashboards := []dashboardv1.Reference{
		{
			Title: "Teams",
			Inline: &dashboardv1.ReferenceInline{
				HideToolbar: true,
				Rows: []dashboardv1.Row{{
					Size: -1,
					Panels: []dashboardv1.Panel{{
						Title:       "Teams",
						Description: "The teams you are part of",
						Plugin: dashboardv1.Plugin{
							Type: "app",
							Name: "userteams",
						},
					}},
				}},
			},
		},
		{
			Title: "Applications",
			Inline: &dashboardv1.ReferenceInline{
				HideToolbar: true,
				Rows: []dashboardv1.Row{{
					Size: -1,
					Panels: []dashboardv1.Panel{{
						Title:       "Applications",
						Description: "The applications which are owned by your teams",
						Plugin: dashboardv1.Plugin{
							Type: "app",
							Name: "userapplications",
						},
					}},
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
