package dashboards

import (
	"encoding/json"
	"net/http"

	dashboard "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/dashboards/pkg/placeholders"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/dashboards"

var (
	log = logrus.WithFields(logrus.Fields{"package": "dashboards"})
)

// Config is the structure of the configuration for the dashboards plugin.
type Config struct{}

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clusters *clusters.Clusters
	config   Config
}

// getDashboardsRequest is the structure of the request body for a getDashboards call. It contains some defaults and a
// list of references. The defaults are the cluster/namespace/name of the Team/Application where the dashboard is used
// and the references are a list of references from the same Team/Application.
type getDashboardsRequest struct {
	Defaults   dashboard.Reference   `json:"defaults"`
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
	log.Tracef("getAllDashboards")

	var dashboards []dashboard.DashboardSpec

	for _, cluster := range router.clusters.Clusters {
		dashboard, err := cluster.GetDashboards(r.Context(), "")
		if err != nil {
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get dashboards")
			return
		}

		dashboards = append(dashboards, dashboard...)
	}

	log.WithFields(logrus.Fields{"count": len(dashboards)}).Tracef("getAllDashboards")
	render.JSON(w, r, dashboards)
}

// getDashboards is used to return a list of dashboards. To get the list of dashboards the request body must contain a
// list of references and some defaults, which are used to set the cluster/namespace in the reference when they are not
// provided.
func (router *Router) getDashboards(w http.ResponseWriter, r *http.Request) {
	log.Tracef("getDashboards")

	var data getDashboardsRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	var dashboards []*dashboard.DashboardSpec

	// Loop through all the provided references and set the cluster and namespace from the defaults, when it is not
	// provided. Then we are using the GetDashboard function for a cluster to get the dashboard by namespace and name.
	// Finally we are replacing the placeholders in a dashboard with the provided values and we are adding the title
	// from the reference as dashboard title and we are adding the dashboard to a list of dashboards.
	for _, reference := range data.References {
		if reference.Cluster == "" {
			reference.Cluster = data.Defaults.Cluster
		}

		if reference.Namespace == "" {
			reference.Namespace = data.Defaults.Namespace
		}

		if reference.Inline != nil {
			dashboards = append(dashboards, &dashboard.DashboardSpec{
				Cluster:     "-",
				Namespace:   "-",
				Name:        "-",
				Title:       reference.Title,
				Description: reference.Description,
				Variables:   reference.Inline.Variables,
				Rows:        reference.Inline.Rows,
			})
		} else {
			cluster := router.clusters.GetCluster(reference.Cluster)
			if cluster == nil {
				errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
				return
			}

			dashboard, err := cluster.GetDashboard(r.Context(), reference.Namespace, reference.Name)
			if err != nil {
				errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get dashboard")
				return
			}

			if reference.Placeholders != nil {
				dashboard, err = placeholders.Replace(reference.Placeholders, *dashboard)
				if err != nil {
					errresponse.Render(w, r, err, http.StatusBadRequest, "Could not replace placeholders")
					return
				}
			}

			dashboard.Title = reference.Title
			dashboards = append(dashboards, dashboard)
		}
	}

	log.WithFields(logrus.Fields{"count": len(dashboards)}).Tracef("getDashboards")
	render.JSON(w, r, dashboards)
}

// getDashboard can be used to get a single dashboard. Each dashboard is identified by the cluster, namespace and name
// which is set via the request body. To get the dashboard we have to get the cluster and then using the GetDashboard
// function to return the dashboard.
func (router *Router) getDashboard(w http.ResponseWriter, r *http.Request) {
	log.Tracef("getDashboard")

	var data getDashboardRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	log.WithFields(logrus.Fields{"cluster": data.Cluster, "namespace": data.Namespace, "name": data.Name}).Tracef("getDashboard")

	cluster := router.clusters.GetCluster(data.Cluster)
	if cluster == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	dashboard, err := cluster.GetDashboard(r.Context(), data.Namespace, data.Name)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get dashboard")
		return
	}

	if data.Placeholders != nil {
		dashboard, err = placeholders.Replace(data.Placeholders, *dashboard)
		if err != nil {
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not replace placeholders")
			return
		}
	}

	render.JSON(w, r, dashboard)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "dashboards",
		DisplayName: "Dashboards",
		Description: "Create dashboards for your Teams and Applications.",
		Type:        "dashboards",
	})

	router := Router{
		chi.NewRouter(),
		clusters,
		config,
	}

	router.Get("/dashboards", router.getAllDashboards)
	router.Post("/dashboards", router.getDashboards)
	router.Post("/dashboard", router.getDashboard)

	return router
}
