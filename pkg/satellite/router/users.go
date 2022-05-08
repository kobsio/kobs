package router

import (
	"net/http"

	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// getUsers returns a list of users for all clusters and namespaces. We always return all users for all clusters and
// namespaces. For this we are looping though the loaded clusters and called the GetUsers function for each one.
func (router *Router) getUsers(w http.ResponseWriter, r *http.Request) {
	log.Debug(r.Context(), "Get users")

	var users []userv1.UserSpec

	for _, cluster := range router.clustersClient.GetClusters() {
		user, err := cluster.GetUsers(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Could not get users")
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get users")
			return
		}

		users = append(users, user...)
	}

	log.Debug(r.Context(), "Get users result", zap.Int("usersCount", len(users)))
	render.JSON(w, r, users)
}

// getUser returns a single user for the given cluster and namespace and name. The cluster, namespace and name is
// defined via a corresponding query parameter. Then we are using the cluster object to get the user via the GetUser
// function.
func (router *Router) getUser(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")

	log.Debug(r.Context(), "Get User parameters", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name))

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	user, err := cluster.GetUser(r.Context(), namespace, name)
	if err != nil {
		log.Error(r.Context(), "Could not get user", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get user")
		return
	}

	render.JSON(w, r, user)
}
