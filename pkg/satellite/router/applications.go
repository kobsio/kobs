package router

import (
	"net/http"

	"github.com/go-chi/render"
	v1application "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"go.uber.org/zap"
)

// getApplications returns a list of applications. This api endpoint supports multiple options to get applications. Without
// adding query parameters, all applications from all clusters and namespaces are returned. When providing cluster or
// namespace query parameter the result is limited to these properties.
func (router *Router) getApplications(w http.ResponseWriter, r *http.Request) {
	clusterNames := r.URL.Query()["cluster"]
	namespaces := r.URL.Query()["namespace"]

	log.Debug(r.Context(), "Get applications parameters", zap.Strings("clusters", clusterNames), zap.Strings("namespaces", namespaces))

	var applications []v1application.ApplicationSpec
	var clusters []cluster.Client
	if len(clusterNames) == 0 {
		clusters = router.clustersClient.GetClusters()
		log.Debug(r.Context(), "No clusters defined, will automatically fetch from config")
	} else {
		for _, clusterName := range clusterNames {
			cluster := router.clustersClient.GetCluster(clusterName)
			if cluster == nil {
				log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
				errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
				return
			}
			clusters = append(clusters, cluster)
		}
	}

	for _, cluster := range clusters {
		if namespaces == nil {
			application, err := cluster.GetApplications(r.Context(), "")
			if err != nil {
				log.Error(r.Context(), "Could not get applications", zap.Error(err))
				errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get applications")
				return
			}

			applications = append(applications, application...)
		} else {
			for _, namespace := range namespaces {
				application, err := cluster.GetApplications(r.Context(), namespace)
				if err != nil {
					log.Error(r.Context(), "Could not get applications", zap.Error(err))
					errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get applications")
					return
				}

				applications = append(applications, application...)
			}
		}
	}

	log.Debug(r.Context(), "Get applications results", zap.Int("applicationsCount", len(applications)))
	render.JSON(w, r, applications)
}

// getApplication returns a a single application for the given cluster and namespace and name. The cluster, namespace
// and name is defined via the corresponding query parameters.
func (router *Router) getApplication(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")

	log.Debug(r.Context(), "Get application parameters", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name))

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	application, err := cluster.GetApplication(r.Context(), namespace, name)
	if err != nil {
		log.Error(r.Context(), "Could not get applications")
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get application")
		return
	}

	render.JSON(w, r, application)
}
