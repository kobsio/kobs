package navigation

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type Config struct {
	Groups []group `json:"groups"`
}

type group struct {
	Title string `json:"title"`
	Items []item `json:"items"`
}

type item struct {
	Title     string `json:"title"`
	Childs    []item `json:"childs"`
	Dashboard struct {
		Satellite    string         `json:"satellite"`
		Cluster      string         `json:"cluster"`
		Namespace    string         `json:"namespace"`
		Name         string         `json:"name"`
		Placeholders map[string]any `json:"placeholders"`
	} `json:"dashboard"`
}

type Router struct {
	*chi.Mux
	config Config
}

func (router *Router) getNavigationGroups(w http.ResponseWriter, r *http.Request) {
	render.JSON(w, r, router.config.Groups)
}

func Mount(config Config) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
	}

	router.Get("/groups", router.getNavigationGroups)

	return router
}
