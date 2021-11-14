package resources

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/clusters/cluster/terminal"
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
	corev1 "k8s.io/api/core/v1"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/resources"

var (
	log        = logrus.WithFields(logrus.Fields{"package": "resources"})
	pingPeriod = 30 * time.Second
)

// Resources is the structure for the getResources api call. It contains the cluster, namespace and the json
// representation of the retunred list object from the Kuberntes API.
type Resources struct {
	Cluster   string                 `json:"cluster"`
	Namespace string                 `json:"namespace"`
	Resources map[string]interface{} `json:"resources"`
}

// Config is the structure of the configuration for the resources plugin. It only contains one filed to forbid access to
// the provided resources.
type Config struct {
	Forbidden           []string                    `json:"forbidden"`
	WebSocket           WebSocket                   `json:"webSocket"`
	EphemeralContainers []corev1.EphemeralContainer `json:"ephemeralContainers"`
}

// WebSocket is the structure for the WebSocket configuration for terminal for Pods.
type WebSocket struct {
	Address         string `json:"address"`
	AllowAllOrigins bool   `json:"allowAllOrigins"`
}

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clusters *clusters.Clusters
	config   Config
}

// isForbidden checks if the requested resource was specified in the forbidden resources list. This can be used to use
// wildcard selectors in the RBAC permissions for kobs, but disallow the users to view secrets.
func (router *Router) isForbidden(resource string) bool {
	for _, r := range router.config.Forbidden {
		if resource == r {
			return true
		}
	}

	return false
}

// getResources returns a list of resources for the given clusters and namespaces. The result can limited by the
// paramName and param query parameter.
func (router *Router) getResources(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	clusterNames := r.URL.Query()["cluster"]
	namespaces := r.URL.Query()["namespace"]
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")
	path := r.URL.Query().Get("path")
	paramName := r.URL.Query().Get("paramName")
	param := r.URL.Query().Get("param")

	log.WithFields(logrus.Fields{"clusters": clusterNames, "namespaces": namespaces, "name": name, "resource": resource, "path": path, "paramName": paramName, "param": param}).Tracef("getResources")

	var resources []Resources

	// Loop through all the given cluster names and get for each provided name the cluster interface. After that we
	// check if the resource was provided via the forbidden resources list.
	for _, clusterName := range clusterNames {
		cluster := router.clusters.GetCluster(clusterName)
		if cluster == nil {
			errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		if router.isForbidden(resource) {
			errresponse.Render(w, r, nil, http.StatusForbidden, fmt.Sprintf("Access for resource %s is forbidding", resource))
			return
		}

		// If the namespaces slice is nil, we retrieve the resource for all namespaces. If a list of namespaces was
		// provided we loop through all the namespaces and return the resources for these namespaces. All results are
		// added to the resources slice, which is then returned by the api.
		if namespaces == nil {
			if !user.HasResourceAccess(clusterName, "*", resource) {
				errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: *, resource: %s", clusterName, resource), http.StatusForbidden, "You are not authorized to access the resource")
				return
			}

			list, err := cluster.GetResources(r.Context(), "", name, path, resource, paramName, param)
			if err != nil {
				errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get resources")
				return
			}

			var tmpResources map[string]interface{}
			err = json.Unmarshal(list, &tmpResources)
			if err != nil {
				errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not unmarshal resources")
				return
			}

			resources = append(resources, Resources{
				Cluster:   clusterName,
				Namespace: "",
				Resources: tmpResources,
			})
		} else {
			for _, namespace := range namespaces {
				if !user.HasResourceAccess(clusterName, namespace, resource) {
					errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s", clusterName, namespace, resource), http.StatusForbidden, "You are not authorized to access the resource")
					return
				}

				list, err := cluster.GetResources(r.Context(), namespace, name, path, resource, paramName, param)
				if err != nil {
					errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get resources")
					return
				}

				var tmpResources map[string]interface{}
				err = json.Unmarshal(list, &tmpResources)
				if err != nil {
					errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not unmarshal resources")
					return
				}

				resources = append(resources, Resources{
					Cluster:   clusterName,
					Namespace: namespace,
					Resources: tmpResources,
				})
			}
		}
	}

	log.WithFields(logrus.Fields{"count": len(resources)}).Tracef("getResources")
	render.JSON(w, r, resources)
}

// deleteResource handles the deletion of a resource. The resource can be identified by the given cluster, namespace,
// name, resource and path.
// When the user sets the "force" parameter to "true" we will set a body on the delete request, where we set the
// "gracePeriodSeconds" to 0. This will cause the same behaviour as "kubectl delete --force --grace-period 0".
func (router *Router) deleteResource(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")
	path := r.URL.Query().Get("path")
	force := r.URL.Query().Get("force")

	log.WithFields(logrus.Fields{"cluster": clusterName, "namespace": namespace, "name": name, "resource": resource, "path": path}).Tracef("deleteResource")

	if !user.HasResourceAccess(clusterName, namespace, resource) {
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s", clusterName, namespace, resource), http.StatusForbidden, "You are not authorized to access the resource")
		return
	}

	cluster := router.clusters.GetCluster(clusterName)
	if cluster == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	if router.isForbidden(resource) {
		errresponse.Render(w, r, nil, http.StatusForbidden, fmt.Sprintf("Access for resource %s is forbidding", resource))
		return
	}

	parsedForce, err := strconv.ParseBool(force)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse force parameter")
		return
	}

	var body []byte
	if parsedForce {
		body = []byte(`{"gracePeriodSeconds": 0}`)
	}

	err = cluster.DeleteResource(r.Context(), namespace, name, path, resource, body)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not delete resource")
		return
	}

	render.JSON(w, r, nil)
}

// patchResource hadnles patch operations for resources. The resource can be identified by the given cluster,
// namespace, name, resource and path. The patch operation must be provided in the request body.
func (router *Router) patchResource(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")
	path := r.URL.Query().Get("path")

	log.WithFields(logrus.Fields{"cluster": clusterName, "namespace": namespace, "name": name, "resource": resource, "path": path}).Tracef("patchResource")

	if !user.HasResourceAccess(clusterName, namespace, resource) {
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s", clusterName, namespace, resource), http.StatusForbidden, "You are not authorized to access the resource")
		return
	}

	cluster := router.clusters.GetCluster(clusterName)
	if cluster == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	if router.isForbidden(resource) {
		errresponse.Render(w, r, nil, http.StatusForbidden, fmt.Sprintf("Access for resource %s is forbidding", resource))
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	err = cluster.PatchResource(r.Context(), namespace, name, path, resource, body)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not patch resource")
		return
	}

	render.JSON(w, r, nil)
}

// createResource hadnles patch operations for resources. The resource can be identified by the given cluster,
// namespace, name, resource and path. The resource must be provided in the request body.
func (router *Router) createResource(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")
	subResource := r.URL.Query().Get("subResource")
	path := r.URL.Query().Get("path")

	log.WithFields(logrus.Fields{"cluster": clusterName, "namespace": namespace, "name": name, "path": path, "resource": resource, "subResource": subResource}).Tracef("createResource")

	if !user.HasResourceAccess(clusterName, namespace, resource) {
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s", clusterName, namespace, resource), http.StatusForbidden, "You are not authorized to access the resource")
		return
	}

	cluster := router.clusters.GetCluster(clusterName)
	if cluster == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	if router.isForbidden(resource) {
		errresponse.Render(w, r, nil, http.StatusForbidden, fmt.Sprintf("Access for resource %s is forbidding", resource))
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	err = cluster.CreateResource(r.Context(), namespace, name, path, resource, subResource, body)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not create resource")
		return
	}

	render.JSON(w, r, nil)
}

// getLogs returns the logs for the container of a pod in a cluster and namespace. A user can also set the time since
// when the logs should be returned.
func (router *Router) getLogs(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	regex := r.URL.Query().Get("regex")
	since := r.URL.Query().Get("since")
	tail := r.URL.Query().Get("tail")
	previous := r.URL.Query().Get("previous")
	follow := r.URL.Query().Get("follow")

	log.WithFields(logrus.Fields{"cluster": clusterName, "namespace": namespace, "name": name, "container": container, "regex": regex, "since": since, "previous": previous, "follow": follow}).Tracef("getLogs")

	cluster := router.clusters.GetCluster(clusterName)
	if cluster == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	parsedSince, err := strconv.ParseInt(since, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse since parameter")
		return
	}

	parsedTail, err := strconv.ParseInt(tail, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse tail parameter")
		return
	}

	parsedPrevious, err := strconv.ParseBool(previous)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse previous parameter")
		return
	}

	parsedFollow, err := strconv.ParseBool(follow)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse follow parameter")
		return
	}

	// If the parsedFollow parameter was set to true, we stream the logs via an WebSocket connection instead of
	// returning a json response.
	if parsedFollow {
		var upgrader = websocket.Upgrader{}

		if router.config.WebSocket.AllowAllOrigins {
			upgrader.CheckOrigin = func(r *http.Request) bool { return true }
		}

		c, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.WithError(err).Errorf("Could not upgrade connection")
			return
		}
		defer c.Close()

		c.SetPongHandler(func(string) error { return nil })

		go func() {
			ticker := time.NewTicker(pingPeriod)
			defer ticker.Stop()

			for {
				select {
				case <-ticker.C:
					if err := c.WriteMessage(websocket.PingMessage, nil); err != nil {
						return
					}
				}
			}
		}()

		user, err := authContext.GetUser(r.Context())
		if err != nil {
			c.WriteMessage(websocket.TextMessage, []byte("You are not authorized to access the resource"))
			return
		}

		if !user.HasResourceAccess(clusterName, namespace, "pods") {
			c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("You are not authorized to access the resource: cluster: %s, namespace: %s, resource: pods", clusterName, namespace)))
			return
		}

		err = cluster.StreamLogs(r.Context(), c, namespace, name, container, parsedSince, parsedTail, parsedFollow)
		if err != nil {
			c.WriteMessage(websocket.TextMessage, []byte("Could not stream logs: "+err.Error()))
			return
		}

		log.Tracef("Logs stream was closed")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	if !user.HasResourceAccess(clusterName, namespace, "pods") {
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: pods", clusterName, namespace), http.StatusForbidden, "You are not authorized to access the resource")
		return
	}

	logs, err := cluster.GetLogs(r.Context(), namespace, name, container, regex, parsedSince, parsedTail, parsedPrevious)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadGateway, "Could not get logs")
		return
	}

	log.WithFields(logrus.Fields{"count": len(logs)}).Tracef("getLogs")
	render.JSON(w, r, struct {
		Logs string `json:"logs"`
	}{logs})
}

// getTerminal starts a new terminal session for a container in a pod. The user must provide the cluster, namespace, pod
// and container via the corresponding query parameter. It is also possible to specify the shell which should be used
// for the terminal.
func (router *Router) getTerminal(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	shell := r.URL.Query().Get("shell")

	log.WithFields(logrus.Fields{"cluster": clusterName, "namespace": namespace, "name": name, "container": container, "shell": shell}).Tracef("getTerminal")

	var upgrader = websocket.Upgrader{}

	if router.config.WebSocket.AllowAllOrigins {
		upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	}

	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.WithError(err).Errorf("Could not upgrade connection")
		return
	}
	defer c.Close()

	c.SetPongHandler(func(string) error { return nil })

	go func() {
		ticker := time.NewTicker(pingPeriod)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				if err := c.WriteMessage(websocket.PingMessage, nil); err != nil {
					return
				}
			}
		}
	}()

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		msg, _ := json.Marshal(terminal.Message{
			Op:   "stdout",
			Data: "You are not authorized to access the resource",
		})

		c.WriteMessage(websocket.TextMessage, msg)
		return
	}

	if !user.HasResourceAccess(clusterName, namespace, "pods") {
		msg, _ := json.Marshal(terminal.Message{
			Op:   "stdout",
			Data: fmt.Sprintf("You are not authorized to access the resource: cluster: %s, namespace: %s, resource: pods", clusterName, namespace),
		})

		c.WriteMessage(websocket.TextMessage, msg)
		return
	}

	cluster := router.clusters.GetCluster(clusterName)
	if cluster == nil {
		log.WithError(err).Errorf("Invalid cluster name")
		msg, _ := json.Marshal(terminal.Message{
			Op:   "stdout",
			Data: fmt.Sprintf("Invalid cluster name: %s", err.Error()),
		})
		c.WriteMessage(websocket.TextMessage, msg)
		return
	}

	err = cluster.GetTerminal(c, namespace, name, container, shell)
	if err != nil {
		log.WithError(err).Errorf("Could not create terminal")
		msg, _ := json.Marshal(terminal.Message{
			Op:   "stdout",
			Data: fmt.Sprintf("Could not create terminal: %s", err.Error()),
		})
		c.WriteMessage(websocket.TextMessage, msg)
		return
	}

	log.Tracef("Terminal connection was closed")
}

// getFile allows a user to download a file from a given container. For that the file/folder which should be downloaded
// must be specified as source path (srcPath).
func (router *Router) getFile(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	srcPath := r.URL.Query().Get("srcPath")

	log.WithFields(logrus.Fields{"cluster": clusterName, "namespace": namespace, "name": name, "container": container, "srcPath": srcPath}).Tracef("getFile")

	cluster := router.clusters.GetCluster(clusterName)
	if cluster == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	err := cluster.CopyFileFromPod(w, namespace, name, container, srcPath)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not copy file")
		return
	}
}

// postFile allows a user to upload a file to a given container. For that the file must be sent as form data, so that it
// can be created in the destination (destPath).
func (router *Router) postFile(w http.ResponseWriter, r *http.Request) {
	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	destPath := r.URL.Query().Get("destPath")

	log.WithFields(logrus.Fields{"cluster": clusterName, "namespace": namespace, "name": name, "container": container, "destPath": destPath}).Tracef("postFile")

	f, h, err := r.FormFile("file")
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not upload file")
		return
	}
	defer f.Close()

	cluster := router.clusters.GetCluster(clusterName)
	if cluster == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	destPath = destPath + "/" + h.Filename

	err = cluster.CopyFileToPod(namespace, name, container, f, destPath)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not copy file")
		return
	}

	render.JSON(w, r, nil)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	var options map[string]interface{}
	options = make(map[string]interface{})
	options["webSocketAddress"] = config.WebSocket.Address
	options["ephemeralContainers"] = config.EphemeralContainers

	plugins.Append(plugin.Plugin{
		Name:        "resources",
		DisplayName: "Resources",
		Description: "View and edit Kubernetes resources.",
		Type:        "resources",
		Options:     options,
	})

	router := Router{
		chi.NewRouter(),
		clusters,
		config,
	}

	router.Get("/resources", router.getResources)
	router.Delete("/resources", router.deleteResource)
	router.Put("/resources", router.patchResource)
	router.Post("/resources", router.createResource)
	router.Get("/logs", router.getLogs)
	router.HandleFunc("/terminal", router.getTerminal)
	router.Get("/file", router.getFile)
	router.Post("/file", router.postFile)

	return router
}
