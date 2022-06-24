package helm

import (
	"fmt"
	"net/http"
	"strconv"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-helm/pkg/client"
	"github.com/kobsio/kobs/plugins/plugin-helm/pkg/permissions"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// PluginType is the type which must be used for the Helm plugin.
const PluginType = "helm"

// Router implements the router for the Helm plugin, which can be registered in the router for our rest api. It contains
// the api routes for the Helm plugin and it's configuration.
type Router struct {
	*chi.Mux
	clustersClient     clusters.Client
	permissionsEnabled bool
}

var newHelmClient = client.New

// appendIfMissing appends a value to a slice, when this values doesn't exist in the slice already.
func appendIfMissing(items []string, item string) []string {
	for _, ele := range items {
		if ele == item {
			return items
		}
	}

	return append(items, item)
}

func (router *Router) getClusters(w http.ResponseWriter, r *http.Request) {
	clusters := router.clustersClient.GetClusters(r.Context())

	var clusterNames []string
	for _, cluster := range clusters {
		clusterNames = append(clusterNames, cluster.GetName())
	}

	render.JSON(w, r, clusterNames)
}

func (router *Router) getNamespaces(w http.ResponseWriter, r *http.Request) {
	var namespaces []string
	clusterNames := r.URL.Query()["cluster"]

	for _, clusterName := range clusterNames {
		tmpNamespaces, err := router.clustersClient.GetCluster(r.Context(), clusterName).GetNamespaces(r.Context())
		if err != nil {
			log.Error(r.Context(), "Could not get namespaces", zap.Error(err), zap.String("cluster", clusterName))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get namespaces")
			return
		}

		for _, namespace := range tmpNamespaces {
			namespaces = appendIfMissing(namespaces, namespace)
		}
	}

	render.JSON(w, r, namespaces)
}

// getReleases returns a list of all Helm releases for the specified cluster and namespaces. If the namespaces query
// parameter is empty we list the Helm releases for all namespaces.
func (router *Router) getReleases(w http.ResponseWriter, r *http.Request) {
	clusterNames := r.URL.Query()["cluster"]
	namespaces := r.URL.Query()["namespace"]

	log.Debug(r.Context(), "Get Helm releases", zap.Strings("clusters", clusterNames), zap.Strings("namespaces", namespaces))

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get Helm releases", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get the Helm releases")
		return
	}

	var helmReleases []*client.Release

	for _, clusterName := range clusterNames {
		cluster := router.clustersClient.GetCluster(r.Context(), clusterName)
		if cluster == nil {
			log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
			errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		if namespaces == nil {
			tmpReleases, err := newHelmClient(cluster).List(r.Context(), "")
			if err != nil {
				log.Error(r.Context(), "Could not list Helm releases", zap.Error(err), zap.String("cluster", clusterName))
				errresponse.Render(w, r, err, http.StatusBadRequest, "Could not list Helm releases")
				return
			}

			helmReleases = append(helmReleases, tmpReleases...)
		} else {
			for _, namespace := range namespaces {
				tmpReleases, err := newHelmClient(cluster).List(r.Context(), namespace)
				if err != nil {
					log.Error(r.Context(), "Could not list Helm releases", zap.Error(err), zap.String("cluster", clusterName))
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
		err := permissions.CheckPermissions(router.permissionsEnabled, user, helmRelease.Cluster, helmRelease.Namespace, helmRelease.Name)
		if err == nil {
			filteredHelmReleases = append(filteredHelmReleases, helmRelease)
		}
	}

	log.Debug(r.Context(), "Get Helm releases result", zap.Int("releasesCount", len(helmReleases)), zap.Int("filteredReleasesCount", len(filteredHelmReleases)))
	render.JSON(w, r, filteredHelmReleases)
}

// getRelease returns a single Helm release.
func (router *Router) getRelease(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	version := r.URL.Query().Get("version")

	log.Debug(r.Context(), "Get Helm release", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name))

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get Helm release", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get the Helm release")
		return
	}

	err = permissions.CheckPermissions(router.permissionsEnabled, user, clusterName, namespace, name)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the Helm release", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the Helm release")
		return
	}

	parsedVersion, err := strconv.Atoi(version)
	if err != nil {
		log.Error(r.Context(), "Could not parse version parameter", zap.Error(err), zap.String("version", version))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse version parameter")
		return
	}

	cluster := router.clustersClient.GetCluster(r.Context(), clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	release, err := newHelmClient(cluster).Get(r.Context(), namespace, name, parsedVersion)
	if err != nil {
		log.Error(r.Context(), "Could not get Helm release", zap.Error(err), zap.String("cluster", clusterName))
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

	log.Debug(r.Context(), "Get Helm release history", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name))

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get Helm release history", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get the Helm release history")
		return
	}

	err = permissions.CheckPermissions(router.permissionsEnabled, user, clusterName, namespace, name)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the Helm release history", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the Helm release history")
		return
	}

	cluster := router.clustersClient.GetCluster(r.Context(), clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	releases, err := newHelmClient(cluster).History(r.Context(), namespace, name)
	if err != nil {
		log.Error(r.Context(), "Could not get Helm release", zap.Error(err), zap.String("cluster", clusterName))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get Helm release")
		return
	}

	log.Debug(r.Context(), "Get Helm release history result", zap.Int("releasesCount", len(releases)))
	render.JSON(w, r, releases)
}

// Mount mounts the Helm plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	if len(instances) != 1 {
		return nil, fmt.Errorf("invalid number of instances")
	}

	var permissionsEnabled bool
	if value, ok := instances[0].Options["permissionsEnabled"]; ok {
		if valueBool, okBool := value.(bool); okBool {
			permissionsEnabled = valueBool
		}
	}

	router := Router{
		chi.NewRouter(),
		clustersClient,
		permissionsEnabled,
	}

	router.Get("/clusters", router.getClusters)
	router.Get("/namespaces", router.getNamespaces)
	router.Get("/releases", router.getReleases)
	router.Get("/release", router.getRelease)
	router.Get("/release/history", router.getReleaseHistory)

	return router, nil
}
