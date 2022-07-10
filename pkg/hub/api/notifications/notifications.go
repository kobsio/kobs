package notifications

import (
	"net/http"

	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type Config struct {
	Groups []group `json:"groups"`
}

type group struct {
	Title  string             `json:"title"`
	Plugin dashboardv1.Plugin `json:"plugin"`
}

type Router struct {
	*chi.Mux
	config Config
}

func (router *Router) getNotificationGroups(w http.ResponseWriter, r *http.Request) {
	render.JSON(w, r, router.config.Groups)
}

func Mount(config Config) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
	}

	router.Get("/groups", router.getNotificationGroups)

	return router
}
