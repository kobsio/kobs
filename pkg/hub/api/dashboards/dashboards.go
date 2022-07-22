package dashboards

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/kobsio/kobs/pkg/hub/store"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Config struct{}

type Router struct {
	*chi.Mux
	storeClient store.Client
}

func (router *Router) getDashboardsFromReferences(w http.ResponseWriter, r *http.Request) {
	var references []dashboardv1.Reference

	err := json.NewDecoder(r.Body).Decode(&references)
	if err != nil {
		log.Error(r.Context(), "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	var dashboards []*dashboardv1.DashboardSpec

	for _, reference := range references {
		if reference.Inline != nil {
			dashboards = append(dashboards, &dashboardv1.DashboardSpec{
				Satellite:   "",
				Cluster:     "",
				Namespace:   "",
				Name:        "",
				Title:       reference.Title,
				Description: reference.Description,
				HideToolbar: reference.Inline.HideToolbar,
				Variables:   addPlaceholdersAsVariables(reference.Inline.Variables, reference.Placeholders),
				Rows:        reference.Inline.Rows,
			})
		} else {
			dashboard, err := router.storeClient.GetDashboardByID(r.Context(), fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s/name/%s", reference.Satellite, reference.Cluster, reference.Namespace, reference.Name))
			if err != nil {
				log.Error(r.Context(), "Could not get dashboard", zap.Error(err))
				errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get dashboard")
				return
			}

			dashboard.Title = reference.Title
			dashboard.Variables = addPlaceholdersAsVariables(dashboard.Variables, reference.Placeholders)
			dashboards = append(dashboards, dashboard)
		}
	}

	log.Debug(r.Context(), "Get dashboards result", zap.Int("dashboardsCount", len(dashboards)))
	render.JSON(w, r, dashboards)
}

func (router *Router) getDashboard(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")

	var placeholders map[string]string
	placeholders = make(map[string]string)

	for key := range r.URL.Query() {
		if key != "id" {
			placeholders[key] = r.URL.Query().Get(key)
		}
	}

	dashboard, err := router.storeClient.GetDashboardByID(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get dashboard", zap.Error(err), zap.String("dashboard", id))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get dashboard")
		return
	}

	dashboard.Variables = addPlaceholdersAsVariables(dashboard.Variables, placeholders)
	render.JSON(w, r, dashboard)
}

func Mount(config Config, storeClient store.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		storeClient,
	}

	router.Post("/", router.getDashboardsFromReferences)
	router.Get("/dashboard", router.getDashboard)

	return router
}
