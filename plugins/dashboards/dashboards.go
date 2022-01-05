package dashboards

import (
	"encoding/json"
	"net/http"

	dashboard "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/dashboards/pkg/variables"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/dashboards"

// Config is the structure of the configuration for the dashboards plugin.
type Config struct{}

// Router implements the router for the dashboards plugin, which can be registered in the router for our rest api. Next
// to the api routes it contains a clusters client to load the dashboards via the Kubernetes api server and the user
// defined configuration.
type Router struct {
	*chi.Mux
	clustersClient clusters.Client
	config         Config
}

// getDashboardsRequest is the structure of the request body for a getDashboards call. It contains some defaults and a
// list of references. The defaults are the cluster/namespace/name of the Team/Application where the dashboard is used
// and the references are a list of references from the same Team/Application.
type getDashboardsRequest struct {
	Cluster    string                `json:"cluster"`
	Namespace  string                `json:"namespace"`
	References []dashboard.Reference `json:"references"`
}

type getDashboardRequest struct {
	Cluster      string            `json:"cluster"`
	Namespace    string            `json:"namespace"`
	Name         string            `json:"name"`
	Placeholders map[string]string `json:"placeholders"`
}

// getAllDashboards can be use to get all dashboards accross all clusters and namespaces. For that we are looping
// through all the clusters and retrieving all dashboards via the GetDashboards function. Finally we return an array of
// dashboards.
func (router *Router) getAllDashboards(w http.ResponseWriter, r *http.Request) {
	log.Debug(r.Context(), "Get all dashboards.")

	var dashboards []dashboard.DashboardSpec

	for _, cluster := range router.clustersClient.GetClusters() {
		dashboard, err := cluster.GetDashboards(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Could not get dashboards.", zap.Error(err))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get dashboards")
			return
		}

		dashboards = append(dashboards, dashboard...)
	}

	log.Debug(r.Context(), "Get all dashboards result.", zap.Int("dashboardsCount", len(dashboards)))
	render.JSON(w, r, dashboards)
}

// getDashboards is used to return a list of dashboards. To get the list of dashboards the request body must contain a
// list of references and some defaults, which are used to set the cluster/namespace in the reference when they are not
// provided.
func (router *Router) getDashboards(w http.ResponseWriter, r *http.Request) {
	log.Debug(r.Context(), "Get dashboards.")

	var data getDashboardsRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "Could not decode request body.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	var dashboards []*dashboard.DashboardSpec

	// Loop through all the provided references and use the GetDashboard function for a cluster to get the dashboard by
	// namespace and name. After that we are replacing the placeholders in a dashboard with the provided values and we
	// are adding the title from the reference as dashboard title and we are adding the dashboard to a list of
	// dashboards.
	for _, reference := range data.References {
		if reference.Inline != nil {
			dashboards = append(dashboards, &dashboard.DashboardSpec{
				Cluster:     "-",
				Namespace:   "-",
				Name:        "-",
				Title:       reference.Title,
				Description: reference.Description,
				Variables:   variables.GetVariables(reference.Inline.Variables, data.Cluster, data.Namespace, nil),
				Rows:        reference.Inline.Rows,
			})
		} else {
			cluster := router.clustersClient.GetCluster(reference.Cluster)
			if cluster == nil {
				log.Error(r.Context(), "Invalid cluster name.", zap.String("cluster", reference.Cluster))
				errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
				return
			}

			dashboard, err := cluster.GetDashboard(r.Context(), reference.Namespace, reference.Name)
			if err != nil {
				log.Error(r.Context(), "Could not get dashboard.", zap.Error(err))
				errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get dashboard")
				return
			}

			dashboard.Variables = variables.GetVariables(dashboard.Variables, data.Cluster, data.Namespace, reference.Placeholders)
			dashboard.Title = reference.Title
			dashboards = append(dashboards, dashboard)
		}
	}

	log.Debug(r.Context(), "Get dashboards result.", zap.Int("dashboardsCount", len(dashboards)))
	render.JSON(w, r, dashboards)
}

// getDashboard can be used to get a single dashboard. Each dashboard is identified by the cluster, namespace and name
// which is set via the request body. To get the dashboard we have to get the cluster and then using the GetDashboard
// function to return the dashboard.
// Unlike as we do it in the "getDashboards" function, we are not passing the cluster / namespace from the application
// or team in the request body. Instead the placeholders list should contain an entry "__cluster" and "__namespace".
func (router *Router) getDashboard(w http.ResponseWriter, r *http.Request) {
	var data getDashboardRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	log.Debug(r.Context(), "Get dashboard request data.", zap.String("cluster", data.Cluster), zap.String("namespace", data.Namespace), zap.String("name", data.Name), zap.Any("placeholders", data.Placeholders))

	cluster := router.clustersClient.GetCluster(data.Cluster)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name.", zap.String("cluster", data.Cluster))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	dashboard, err := cluster.GetDashboard(r.Context(), data.Namespace, data.Name)
	if err != nil {
		log.Error(r.Context(), "Could not get dashboard.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get dashboard")
		return
	}

	dashboard.Variables = variables.GetVariables(dashboard.Variables, "", "", data.Placeholders)

	log.Debug(r.Context(), "Return dashboard.", zap.String("cluster", data.Cluster), zap.String("namespace", data.Namespace), zap.String("name", data.Name))
	render.JSON(w, r, dashboard)
	return
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clustersClient clusters.Client, plugins *plugin.Plugins, config Config) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "dashboards",
		DisplayName: "Dashboards",
		Description: "Create dashboards for your Teams and Applications.",
		Type:        "dashboards",
	})

	router := Router{
		chi.NewRouter(),
		clustersClient,
		config,
	}

	router.Get("/dashboards", router.getAllDashboards)
	router.Post("/dashboards", router.getDashboards)
	router.Post("/dashboard", router.getDashboard)

	return router
}
