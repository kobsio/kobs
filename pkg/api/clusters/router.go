package clusters

import (
	"net/http"
	"sort"

	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Router implements the router for the clusters package. The router provides all standard methods to interact with the
// Kubernetes API of a cluster.
type Router struct {
	*chi.Mux
	clusters *Clusters
}

// GetClusters returns all loaded Kubernetes clusters.
// We are not returning the complete cluster structure. Instead we are returning just the names of the clusters. We are
// also sorting the clusters alphabetically, to improve the user experience in the frontend.
// NOTE: Maybe we can also save the cluster names slice, since the name of a cluster couldn't change during runtime.
func (router *Router) getClusters(w http.ResponseWriter, r *http.Request) {
	log.Tracef("getClusters")

	var clusterNames []string

	for _, cluster := range router.clusters.Clusters {
		clusterNames = append(clusterNames, cluster.GetName())
	}

	sort.Slice(clusterNames, func(i, j int) bool {
		return clusterNames[i] < clusterNames[j]
	})

	log.WithFields(logrus.Fields{"clusters": clusterNames}).Tracef("getClusters")
	render.JSON(w, r, clusterNames)
}

// getNamespaces returns all namespaces for the given clusters.
// As we did it for the clusters, we are also just returning the names of all namespaces. After we retrieved all
// namespaces we have to depulicate them, so that our frontend logic can handle them properly. We are also sorting the
// namespaces alphabetically.
func (router *Router) getNamespaces(w http.ResponseWriter, r *http.Request) {
	clusterNames := r.URL.Query()["cluster"]
	log.WithFields(logrus.Fields{"clusters": clusterNames}).Tracef("getNamespaces")

	var namespaces []string

	for _, clusterName := range clusterNames {
		cluster := router.clusters.GetCluster(clusterName)
		if cluster == nil {
			render.Render(w, r, errresponse.Render(nil, http.StatusBadRequest, "invalid cluster name"))
			return
		}

		clusterNamespaces, err := cluster.GetNamespaces(r.Context(), cacheDurationNamespaces)
		if err != nil {
			render.Render(w, r, errresponse.Render(err, http.StatusBadRequest, "could not get namespaces"))
			return
		}

		if clusterNamespaces != nil {
			namespaces = append(namespaces, clusterNamespaces...)
		}

	}

	keys := make(map[string]bool)
	uniqueNamespaces := []string{}
	for _, namespace := range namespaces {
		if _, value := keys[namespace]; !value {
			keys[namespace] = true
			uniqueNamespaces = append(uniqueNamespaces, namespace)
		}
	}

	sort.Slice(uniqueNamespaces, func(i, j int) bool {
		return uniqueNamespaces[i] < uniqueNamespaces[j]
	})

	log.WithFields(logrus.Fields{"namespaces": len(uniqueNamespaces)}).Tracef("getNamespaces")
	render.JSON(w, r, uniqueNamespaces)
}

// getCRDs returns all CRDs for all clusters.
// Instead of only returning the CRDs for a list of specified clusters, we return all CRDs, so that we only have to call
// this function once from the React app. The CRDs form all loaded clusters are merged and then deduplicated.
func (router *Router) getCRDs(w http.ResponseWriter, r *http.Request) {
	log.Tracef("getCRDs")
	var crds []cluster.CRD

	for _, cluster := range router.clusters.Clusters {
		crds = append(crds, cluster.GetCRDs()...)
	}

	keys := make(map[string]bool)
	uniqueCRDs := []cluster.CRD{}
	for _, crd := range crds {
		if _, value := keys[crd.Resource+"."+crd.Path]; !value {
			keys[crd.Resource+"."+crd.Path] = true
			uniqueCRDs = append(uniqueCRDs, crd)
		}
	}

	log.WithFields(logrus.Fields{"count": len(uniqueCRDs)}).Tracef("getCRDs")
	render.JSON(w, r, uniqueCRDs)
}

// NewRouter return a new router with all the cluster routes.
func NewRouter(clusters *Clusters) chi.Router {
	router := Router{
		chi.NewRouter(),
		clusters,
	}

	router.Get("/", router.getClusters)
	router.Get("/namespaces", router.getNamespaces)
	router.Get("/crds", router.getCRDs)

	return router
}
