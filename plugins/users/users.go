package users

import (
	"encoding/json"
	"net/http"

	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	user "github.com/kobsio/kobs/pkg/api/apis/user/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/users"

// Config is the structure of the configuration for the users plugin.
type Config struct{}

// Router implements the router for the users plugin, which can be registered in the router for our rest api. The router
// contains all the api endpoints for the plugin, the clusters client to retrieve the users from the Kubernetes api
// server and the user defined configuration.
type Router struct {
	*chi.Mux
	clustersClient clusters.Client
	config         Config
}

type getTeamsData struct {
	Teams []user.TeamReference `json:"teams"`
}

func isMember(teams []user.TeamReference, defaultCluster, defaultNamespace, cluster, namespace, name string) bool {
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
// namespaces. For this we are looping though the loaded clusters and callend the GetUsers function for each one.
func (router *Router) getUsers(w http.ResponseWriter, r *http.Request) {
	log.Debug(r.Context(), "Get users.")

	var users []user.UserSpec

	for _, cluster := range router.clustersClient.GetClusters() {
		user, err := cluster.GetUsers(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Could not get users.")
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get users")
			return
		}

		users = append(users, user...)
	}

	log.Debug(r.Context(), "Get users result.", zap.Int("usersCount", len(users)))
	render.JSON(w, r, users)
}

// getUser returns a a single user for the given cluster and namespace and name. The cluster, namespace and name is
// defined via a corresponding query parameter. Then we are using the cluster object to get the user via the GetUser
// function.
func (router *Router) getUser(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")

	log.Debug(r.Context(), "Get User parameters.", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name))

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name.", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	user, err := cluster.GetUser(r.Context(), namespace, name)
	if err != nil {
		log.Error(r.Context(), "Could not get user.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get user")
		return
	}

	render.JSON(w, r, user)
}

// getTeams returns all teams, where a users is a member of.
func (router *Router) getTeams(w http.ResponseWriter, r *http.Request) {
	defaultClusterName := r.URL.Query().Get("cluster")
	defaultNamespace := r.URL.Query().Get("namespace")

	log.Debug(r.Context(), "Get User parameters.", zap.String("defaultCluster", defaultClusterName), zap.String("defaultNamespace", defaultNamespace))

	var data getTeamsData

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "could not decode request body.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	var teams []*team.TeamSpec

	for _, team := range data.Teams {
		c := defaultClusterName
		if team.Cluster != "" {
			c = team.Cluster
		}

		n := defaultNamespace
		if team.Namespace != "" {
			n = team.Namespace
		}

		cluster := router.clustersClient.GetCluster(c)
		if cluster == nil {
			log.Error(r.Context(), "Invalid cluster name.", zap.String("cluster", c))
			errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		t, err := cluster.GetTeam(r.Context(), n, team.Name)
		if err != nil {
			log.Error(r.Context(), "Could not get team.", zap.String("team", team.Name))
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

	log.Debug(r.Context(), "Get team parameters.", zap.String("cluster", teamCluster), zap.String("namespace", teamNamespace), zap.String("name", teamName))

	var users []user.UserSpec
	var filteredUsers []user.UserSpec

	for _, cluster := range router.clustersClient.GetClusters() {
		user, err := cluster.GetUsers(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Could not get users.")
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

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clustersClient clusters.Client, plugins *plugin.Plugins, config Config) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "users",
		DisplayName: "Users",
		Description: "Define the members of your Teams.",
		Home:        true,
		Type:        "users",
	})

	router := Router{
		chi.NewRouter(),
		clustersClient,
		config,
	}

	router.Get("/users", router.getUsers)
	router.Get("/user", router.getUser)
	router.Post("/teams", router.getTeams)
	router.Get("/team", router.getTeam)

	return router
}
