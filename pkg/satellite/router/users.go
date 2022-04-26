package router

import (
	"encoding/json"
	"net/http"

	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type getTeamsData struct {
	Teams []userv1.TeamReference `json:"teams"`
}

func isMember(teams []userv1.TeamReference, defaultCluster, defaultNamespace, cluster, namespace, name string) bool {
	for _, team := range teams {
		c := defaultCluster
		if team.Cluster != "" {
			c = team.Cluster
		}

		n := defaultNamespace
		if team.Namespace != "" {
			n = team.Namespace
		}

		if c == cluster && n == namespace && team.Name == name {
			return true
		}
	}

	return false
}

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

// getTeams returns all teams, where a users are a member of.
func (router *Router) getTeams(w http.ResponseWriter, r *http.Request) {
	var data getTeamsData

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "could not decode request body", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	var teams []*teamv1.TeamSpec

	for _, team := range data.Teams {
		cluster := router.clustersClient.GetCluster(team.Cluster)
		if cluster == nil {
			log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", team.Cluster))
			errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		t, err := cluster.GetTeam(r.Context(), team.Namespace, team.Name)
		if err != nil {
			log.Error(r.Context(), "Could not get team", zap.String("cluster", team.Cluster), zap.String("namespace", team.Namespace), zap.String("team", team.Name))
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get team")
			return
		}

		teams = append(teams, t)
	}

	render.JSON(w, r, teams)
}

// getTeam returns all users for the given team.
func (router *Router) getTeam(w http.ResponseWriter, r *http.Request) {
	teamCluster := r.URL.Query().Get("cluster")
	teamNamespace := r.URL.Query().Get("namespace")
	teamName := r.URL.Query().Get("name")

	log.Debug(r.Context(), "Get team parameters", zap.String("cluster", teamCluster), zap.String("namespace", teamNamespace), zap.String("name", teamName))

	var users []userv1.UserSpec
	var filteredUsers []userv1.UserSpec

	for _, cluster := range router.clustersClient.GetClusters() {
		user, err := cluster.GetUsers(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Could not get users")
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get users")
			return
		}

		users = append(users, user...)
	}

	for _, user := range users {
		if isMember(user.Teams, user.Cluster, user.Namespace, teamCluster, teamNamespace, teamName) {
			filteredUsers = append(filteredUsers, user)
		}
	}

	render.JSON(w, r, filteredUsers)
}
