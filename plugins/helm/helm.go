package helm

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/clusters"
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/helm/pkg/client"
	"github.com/kobsio/kobs/plugins/helm/pkg/permissions"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/helm"

// Config is the structure of the configuration for the Helm plugin.
type Config struct {
	PermissionsEnabled bool `json:"permissionsEnabled"`
}

// Router implements the router for the Helm plugin, which can be registered in the router for our rest api. It contains
// the apie endpoints for the plugin, a clusters client to get the installed Helm releases and the user defined
// configuration.
type Router struct {
	*chi.Mux
	clustersClient clusters.Client
	config         Config
}

var newHelmClient = client.New

// getReleases returns a list of all Helm releases for the specified cluster and namespaces. If the namespaces query
// parameter is empty we list the Helm releases for all namespaces.
func (router *Router) getReleases(w http.ResponseWriter, r *http.Request) {
	clusterNames := r.URL.Query()["cluster"]
	namespaces := r.URL.Query()["namespace"]

	log.Debug(r.Context(), "Get Helm releases.", zap.Strings("clusters", clusterNames), zap.Strings("namespaces", namespaces))

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get Helm releases.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get the Helm releases")
		return
	}

	var helmReleases []*client.Release

	for _, clusterName := range clusterNames {
		cluster := router.clustersClient.GetCluster(clusterName)
		if cluster == nil {
			log.Error(r.Context(), "Invalid cluster name.", zap.String("cluster", clusterName))
			errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		if namespaces == nil {
			tmpReleases, err := newHelmClient(cluster).List(r.Context(), "")
			if err != nil {
				log.Error(r.Context(), "Could not list Helm releases.", zap.Error(err), zap.String("cluster", clusterName))
				errresponse.Render(w, r, err, http.StatusBadRequest, "Could not list Helm releases")
				return
			}

			helmReleases = append(helmReleases, tmpReleases...)
		} else {
			for _, namespace := range namespaces {
				tmpReleases, err := newHelmClient(cluster).List(r.Context(), namespace)
				if err != nil {
					log.Error(r.Context(), "Could not list Helm releases.", zap.Error(err), zap.String("cluster", clusterName))
					errresponse.Render(w, r, err, http.StatusBadRequest, "Could not list Helm releases")
					return
				}

				helmReleases = append(helmReleases, tmpReleases...)
			}
		}
	}

	// Filter all the returned Helm release, based on the permission of an user.
	var filteredHelmReleases []*client.Release

	for _, helmRelease := range helmReleases {
		err := permissions.CheckPermissions(router.config.PermissionsEnabled, user, helmRelease.Cluster, helmRelease.Namespace, helmRelease.Name)
		if err == nil {
			filteredHelmReleases = append(filteredHelmReleases, helmRelease)
		}
	}

	log.Debug(r.Context(), "Get Helm releases result.", zap.Int("releasesCount", len(helmReleases)), zap.Int("filteredReleasesCount", len(filteredHelmReleases)))
	render.JSON(w, r, filteredHelmReleases)
}

// getRelease returns a single Helm release.
func (router *Router) getRelease(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	version := r.URL.Query().Get("version")

	log.Debug(r.Context(), "Get Helm release.", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name))

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get Helm release.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get the Helm release")
		return
	}

	err = permissions.CheckPermissions(router.config.PermissionsEnabled, user, clusterName, namespace, name)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the Helm release.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the Helm release")
		return
	}

	parsedVersion, err := strconv.Atoi(version)
	if err != nil {
		log.Error(r.Context(), "Could not parse version parameter.", zap.Error(err), zap.String("version", version))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse version parameter")
		return
	}

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name.", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	release, err := newHelmClient(cluster).Get(r.Context(), namespace, name, parsedVersion)
	if err != nil {
		log.Error(r.Context(), "Could not get Helm release.", zap.Error(err), zap.String("cluster", clusterName))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get Helm release")
		return
	}

	render.JSON(w, r, release)
}

// getReleaseHistory returns the history of a single Helm release.
func (router *Router) getReleaseHistory(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")

	log.Debug(r.Context(), "Get Helm release history.", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name))

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get Helm release history.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get the Helm release history")
		return
	}

	err = permissions.CheckPermissions(router.config.PermissionsEnabled, user, clusterName, namespace, name)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the Helm release history.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the Helm release history")
		return
	}

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name.", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	releases, err := newHelmClient(cluster).History(r.Context(), namespace, name)
	if err != nil {
		log.Error(r.Context(), "Could not get Helm release.", zap.Error(err), zap.String("cluster", clusterName))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get Helm release")
		return
	}

	log.Debug(r.Context(), "Get Helm release history result.", zap.Int("releasesCount", len(releases)))
	render.JSON(w, r, releases)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clustersClient clusters.Client, plugins *plugin.Plugins, config Config) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "helm",
		DisplayName: "Helm",
		Description: "The package manager for Kubernetes.",
		Type:        "helm",
	})

	router := Router{
		chi.NewRouter(),
		clustersClient,
		config,
	}

	router.Get("/releases", router.getReleases)
	router.Get("/release", router.getRelease)
	router.Get("/release/history", router.getReleaseHistory)

	return router
}
