package dashboards

import (
	"encoding/json"
	"fmt"
	"net/http"

	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Router struct {
	*chi.Mux
	dbClient db.Client
}

func (router *Router) getDashboards(w http.ResponseWriter, r *http.Request) {
	clusters := r.URL.Query()["cluster"]
	namespaces := r.URL.Query()["namespace"]

	dashboards, err := router.dbClient.GetDashboards(r.Context(), clusters, namespaces)
	if err != nil {
		log.Error(r.Context(), "Failed to get dashboards", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get dashboards")
		return
	}

	log.Debug(r.Context(), "Get dashboards result", zap.Int("dashboardsCount", len(dashboards)))
	render.JSON(w, r, dashboards)
}

func (router *Router) getDashboardsFromReferences(w http.ResponseWriter, r *http.Request) {
	var references []dashboardv1.Reference

	err := json.NewDecoder(r.Body).Decode(&references)
	if err != nil {
		log.Error(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	var dashboards []*dashboardv1.DashboardSpec

	for _, reference := range references {
		if reference.Inline != nil {
			dashboards = append(dashboards, &dashboardv1.DashboardSpec{
				Cluster:     "",
				Namespace:   "",
				Name:        "",
				Title:       reference.Title,
				Description: reference.Description,
				HideToolbar: reference.Inline.HideToolbar,
				Variables:   addPlaceholdersAsVariables(nil, reference.Inline.Variables, reference.Placeholders),
				Rows:        reference.Inline.Rows,
			})
		} else {
			dashboard, err := router.dbClient.GetDashboardByID(r.Context(), fmt.Sprintf("/cluster/%s/namespace/%s/name/%s", reference.Cluster, reference.Namespace, reference.Name))
			if err != nil {
				log.Error(r.Context(), "Failed to get dashboard", zap.Error(err))
				errresponse.Render(w, r, http.StatusBadRequest, "Failed to get dashboard")
				return
			}

			dashboard.Title = reference.Title
			dashboard.Variables = addPlaceholdersAsVariables(dashboard.Placeholders, dashboard.Variables, reference.Placeholders)
			dashboards = append(dashboards, dashboard)
		}
	}

	log.Debug(r.Context(), "Get dashboards result", zap.Int("dashboardsCount", len(dashboards)))
	render.JSON(w, r, dashboards)
}

func (router *Router) getDashboard(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")

	placeholders := make(map[string]string)

	for key := range r.URL.Query() {
		if key != "id" {
			placeholders[key] = r.URL.Query().Get(key)
		}
	}

	dashboard, err := router.dbClient.GetDashboardByID(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Failed to get dashboard", zap.Error(err), zap.String("dashboard", id))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get dashboard")
		return
	}

	dashboard.Variables = addPlaceholdersAsVariables(dashboard.Placeholders, dashboard.Variables, placeholders)
	render.JSON(w, r, dashboard)
}

func Mount(dbClient db.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		dbClient,
	}

	router.Get("/", router.getDashboards)
	router.Post("/", router.getDashboardsFromReferences)
	router.Get("/dashboard", router.getDashboard)

	return router
}
