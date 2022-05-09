package router

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster/terminal"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/render"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

var (
	pingPeriod = 30 * time.Second
)

// Resources is the structure for the getResources api call. It contains the cluster, namespace and the json
// representation of the retunred list object from the Kuberntes API.
type Resources struct {
	Cluster   string                 `json:"cluster"`
	Namespace string                 `json:"namespace"`
	Resources map[string]interface{} `json:"resources"`
}

// isForbidden checks if the requested resource was specified in the forbidden resources list. This can be used to use
// wildcard selectors in the RBAC permissions for kobs, but disallow the users to view secrets.
func (router *Router) isForbidden(cluster, namespace, name, verb string) bool {
	for _, resource := range router.config.Forbidden {
		for _, c := range resource.Clusters {
			if c == cluster || c == "*" {
				for _, n := range resource.Namespaces {
					if n == namespace || n == "*" {
						for _, r := range resource.Resources {
							if r == name || r == "*" {
								for _, v := range resource.Verbs {
									if v == verb || v == "*" {
										return true
									}
								}
							}
						}
					}
				}
			}
		}
	}

	return false
}

// getResources returns a list of resources for the given clusters and namespaces. The result can limited by the
// paramName and param query parameter.
func (router *Router) getResources(w http.ResponseWriter, r *http.Request) {
	satellite := r.Header.Get("x-kobs-satellite")

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the resource", zap.Error(err))
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

	log.Debug(r.Context(), "Get resources parameters", zap.Strings("clusters", clusterNames), zap.Strings("namespaces", namespaces), zap.String("name", name), zap.String("resource", resource), zap.String("path", path), zap.String("paramName", paramName), zap.String("param", param))

	var resources []Resources

	// Loop through all the given cluster names and get for each provided name the cluster interface. After that we
	// check if the resource was provided via the forbidden resources list.
	for _, clusterName := range clusterNames {
		cluster := router.clustersClient.GetCluster(clusterName)
		if cluster == nil {
			log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
			errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
			return
		}

		// If the namespaces slice is nil, we retrieve the resource for all namespaces. If a list of namespaces was
		// provided we loop through all the namespaces and return the resources for these namespaces. All results are
		// added to the resources slice, which is then returned by the api.
		if namespaces == nil {
			if router.isForbidden(clusterName, "*", resource, "get") {
				log.Warn(r.Context(), "Access for the resource is forbidden", zap.String("cluster", clusterName), zap.String("namespace", "*"), zap.String("resource", resource), zap.String("verb", "get"))
				errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: *, resource: %s, verb: get", clusterName, resource), http.StatusForbidden, "Access for the resource is forbidden")
				return
			}

			if !user.HasResourceAccess(satellite, clusterName, "*", resource, "get") {
				log.Warn(r.Context(), "User is not authorized to access the resource", zap.String("cluster", clusterName), zap.String("namespace", "*"), zap.String("resource", resource), zap.String("verb", "get"))
				errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: *, resource: %s, verb: get", clusterName, resource), http.StatusForbidden, "You are not authorized to access the resource")
				return
			}

			list, err := cluster.GetResources(r.Context(), "", name, path, resource, paramName, param)
			if err != nil {
				log.Error(r.Context(), "Could not get resource", zap.Error(err))
				errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get resources")
				return
			}

			var tmpResources map[string]interface{}
			err = json.Unmarshal(list, &tmpResources)
			if err != nil {
				log.Error(r.Context(), "Could not unmarshal resources", zap.Error(err))
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
				if router.isForbidden(clusterName, namespace, resource, "get") {
					log.Warn(r.Context(), "Access for the resource is forbidden", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", resource), zap.String("verb", "get"))
					errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s, verb: get", clusterName, namespace, resource), http.StatusForbidden, "Access for the resource is forbidden")
					return
				}

				if !user.HasResourceAccess(satellite, clusterName, namespace, resource, "get") {
					log.Warn(r.Context(), "User is not authorized to access the resource", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", resource), zap.String("verb", "get"))
					errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s, verb: get", clusterName, namespace, resource), http.StatusForbidden, "You are not authorized to access the resource")
					return
				}

				list, err := cluster.GetResources(r.Context(), namespace, name, path, resource, paramName, param)
				if err != nil {
					log.Error(r.Context(), "Could not get resources", zap.Error(err))
					errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get resources")
					return
				}

				var tmpResources map[string]interface{}
				err = json.Unmarshal(list, &tmpResources)
				if err != nil {
					log.Error(r.Context(), "Could not unmarshal resources", zap.Error(err))
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

	log.Debug(r.Context(), "Get resources result", zap.Int("resourcesCount", len(resources)))
	render.JSON(w, r, resources)
}

// deleteResource handles the deletion of a resource. The resource can be identified by the given cluster, namespace,
// name, resource and path.
// When the user sets the "force" parameter to "true" we will set a body on the delete request, where we set the
// "gracePeriodSeconds" to 0. This will cause the same behaviour as "kubectl delete --force --grace-period 0".
func (router *Router) deleteResource(w http.ResponseWriter, r *http.Request) {
	satellite := r.Header.Get("x-kobs-satellite")

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the resource", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")
	path := r.URL.Query().Get("path")
	force := r.URL.Query().Get("force")

	log.Debug(r.Context(), "Delete resource parameters", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name), zap.String("resource", resource), zap.String("path", path))

	if router.isForbidden(clusterName, namespace, resource, "delete") {
		log.Warn(r.Context(), "Access for the resource is forbidden", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", resource), zap.String("verb", "delete"))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s, verb: delete", clusterName, namespace, resource), http.StatusForbidden, "Access for the resource is forbidden")
		return
	}

	if !user.HasResourceAccess(satellite, clusterName, namespace, resource, "delete") {
		log.Warn(r.Context(), "User is not authorized to access the resource", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", resource), zap.String("verb", "delete"))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s, verb: delete", clusterName, namespace, resource), http.StatusForbidden, "You are not authorized to access the resource")
		return
	}

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	parsedForce, err := strconv.ParseBool(force)
	if err != nil {
		log.Error(r.Context(), "Could not parse force parameter", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse force parameter")
		return
	}

	var body []byte
	if parsedForce {
		body = []byte(`{"gracePeriodSeconds": 0}`)
	}

	err = cluster.DeleteResource(r.Context(), namespace, name, path, resource, body)
	if err != nil {
		log.Error(r.Context(), "Could not delete resource", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not delete resource")
		return
	}

	render.JSON(w, r, nil)
}

// patchResource hadnles patch operations for resources. The resource can be identified by the given cluster,
// namespace, name, resource and path. The patch operation must be provided in the request body.
func (router *Router) patchResource(w http.ResponseWriter, r *http.Request) {
	satellite := r.Header.Get("x-kobs-satellite")

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the resource", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")
	path := r.URL.Query().Get("path")

	log.Debug(r.Context(), "Path resource parameters", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name), zap.String("resource", resource), zap.String("path", path))

	if router.isForbidden(clusterName, namespace, resource, "patch") {
		log.Warn(r.Context(), "Access for the resource is forbidden", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", resource), zap.String("verb", "patch"))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s, verb: patch", clusterName, namespace, resource), http.StatusForbidden, "Access for the resource is forbidden")
		return
	}

	if !user.HasResourceAccess(satellite, clusterName, namespace, resource, "patch") {
		log.Warn(r.Context(), "User is not authorized to access the resource", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", resource), zap.String("verb", "patch"))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s, verb: patch", clusterName, namespace, resource), http.StatusForbidden, "You are not authorized to access the resource")
		return
	}

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Error(r.Context(), "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	err = cluster.PatchResource(r.Context(), namespace, name, path, resource, body)
	if err != nil {
		log.Error(r.Context(), "Could not patch resource", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not patch resource")
		return
	}

	render.JSON(w, r, nil)
}

// createResource hadnles patch operations for resources. The resource can be identified by the given cluster,
// namespace, name, resource and path. The resource must be provided in the request body.
func (router *Router) createResource(w http.ResponseWriter, r *http.Request) {
	satellite := r.Header.Get("x-kobs-satellite")

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the resource", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")
	subResource := r.URL.Query().Get("subResource")
	path := r.URL.Query().Get("path")

	log.Debug(r.Context(), "Create resource parameters", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name), zap.String("path", path), zap.String("resource", resource), zap.String("subResource", subResource))

	if router.isForbidden(clusterName, namespace, resource, "post") {
		log.Warn(r.Context(), "Access for the resource is forbidden", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", resource), zap.String("verb", "post"))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s, verb: post", clusterName, namespace, resource), http.StatusForbidden, "Access for the resource is forbidden")
		return
	}

	if !user.HasResourceAccess(satellite, clusterName, namespace, resource, "post") {
		log.Warn(r.Context(), "User is not authorized to access the resource", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", resource))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: %s, verb: create", clusterName, namespace, resource), http.StatusForbidden, "You are not authorized to access the resource")
		return
	}

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Error(r.Context(), "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	err = cluster.CreateResource(r.Context(), namespace, name, path, resource, subResource, body)
	if err != nil {
		log.Error(r.Context(), "Could not create resource", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not create resource")
		return
	}

	render.JSON(w, r, nil)
}

// getLogs returns the logs for the container of a pod in a cluster and namespace. A user can also set the time since
// when the logs should be returned.
func (router *Router) getLogs(w http.ResponseWriter, r *http.Request) {
	satellite := r.Header.Get("x-kobs-satellite")

	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	regex := r.URL.Query().Get("regex")
	since := r.URL.Query().Get("since")
	tail := r.URL.Query().Get("tail")
	previous := r.URL.Query().Get("previous")
	follow := r.URL.Query().Get("follow")

	log.Debug(r.Context(), "Get logs parameters", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name), zap.String("container", container), zap.String("regex", regex), zap.String("since", since), zap.String("previous", previous), zap.String("follow", follow))

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	parsedSince, err := strconv.ParseInt(since, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse since parameter", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse since parameter")
		return
	}

	parsedTail, err := strconv.ParseInt(tail, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse tail parameter", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse tail parameter")
		return
	}

	parsedPrevious, err := strconv.ParseBool(previous)
	if err != nil {
		log.Error(r.Context(), "Could not parse previous parameter", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse previous parameter")
		return
	}

	parsedFollow, err := strconv.ParseBool(follow)
	if err != nil {
		log.Error(r.Context(), "Could not parse follow parameter", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse follow parameter")
		return
	}

	// If the parsedFollow parameter was set to true, we stream the logs via an WebSocket connection instead of
	// returning a json response.
	if parsedFollow {
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		}

		c, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Error(r.Context(), "Could not upgrade connection", zap.Error(err))
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
			log.Warn(r.Context(), "User is not authorized to access the resource", zap.Error(err), zap.String("cluster", clusterName), zap.String("namespace", namespace))
			c.WriteMessage(websocket.TextMessage, []byte("You are not authorized to access the resource"))
			return
		}

		if router.isForbidden(clusterName, namespace, "pods/log", "*") {
			log.Warn(r.Context(), "Access for the resource is forbidden", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", "pods/log"), zap.String("verb", "*"))
			c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("Access for the resource is forbidden: cluster: %s, namespace: %s, resource: pods/log, verb: *", clusterName, namespace)))
			return
		}

		if !user.HasResourceAccess(satellite, clusterName, namespace, "pods/log", "*") {
			log.Warn(r.Context(), "User is not authorized to access the resource", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", "pods/log"), zap.String("verb", "*"))
			c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("You are not authorized to access the resource: cluster: %s, namespace: %s, resource: pods/log, verb: *", clusterName, namespace)))
			return
		}

		err = cluster.StreamLogs(r.Context(), c, namespace, name, container, parsedSince, parsedTail, parsedFollow)
		if err != nil {
			log.Error(r.Context(), "Could not stream logs", zap.Error(err))
			c.WriteMessage(websocket.TextMessage, []byte("Could not stream logs: "+err.Error()))
			return
		}

		log.Debug(r.Context(), "Logs stream was closed")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to access the resource", zap.Error(err), zap.String("cluster", clusterName), zap.String("namespace", namespace))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	if router.isForbidden(clusterName, namespace, "pods/log", "*") {
		log.Warn(r.Context(), "Access for the resource is forbidden", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", "pods/log"), zap.String("verb", "*"))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: pods/log, verb: *", clusterName, namespace), http.StatusForbidden, "Access for the resource is forbidden")
		return
	}

	if !user.HasResourceAccess(satellite, clusterName, namespace, "pods/log", "*") {
		log.Warn(r.Context(), "User is not authorized to access the resource", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", "pods/log"), zap.String("verb", "*"))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: pods/log, verb: *", clusterName, namespace), http.StatusForbidden, "You are not authorized to access the resource")
		return
	}

	logs, err := cluster.GetLogs(r.Context(), namespace, name, container, regex, parsedSince, parsedTail, parsedPrevious)
	if err != nil {
		log.Error(r.Context(), "Could not get logs", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadGateway, "Could not get logs")
		return
	}

	log.Debug(r.Context(), "Get logs result", zap.Int("lineCount", len(logs)))
	render.JSON(w, r, struct {
		Logs string `json:"logs"`
	}{logs})
}

// getTerminal starts a new terminal session for a container in a pod. The user must provide the cluster, namespace, pod
// and container via the corresponding query parameter. It is also possible to specify the shell which should be used
// for the terminal.
func (router *Router) getTerminal(w http.ResponseWriter, r *http.Request) {
	satellite := r.Header.Get("x-kobs-satellite")

	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	shell := r.URL.Query().Get("shell")

	log.Debug(r.Context(), "Get terminal parameters", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name), zap.String("container", container), zap.String("shell", shell))

	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Error(r.Context(), "Could not upgrade connection", zap.Error(err))
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
		log.Warn(r.Context(), "User is not authorized to access the resource", zap.Error(err), zap.String("cluster", clusterName), zap.String("namespace", namespace))

		msg, _ := json.Marshal(terminal.Message{
			Op:   "stdout",
			Data: "You are not authorized to access the resource",
		})

		c.WriteMessage(websocket.TextMessage, msg)
		return
	}

	if router.isForbidden(clusterName, namespace, "pods/exec", "*") {
		log.Warn(r.Context(), "Access for the resource is forbidden", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", "pods/exec"), zap.String("verb", "*"))
		msg, _ := json.Marshal(terminal.Message{
			Op:   "stdout",
			Data: fmt.Sprintf("Access for the resource is forbidden: cluster: %s, namespace: %s, resource: pods/exec, verb: *", clusterName, namespace),
		})

		c.WriteMessage(websocket.TextMessage, msg)
		return
	}

	if !user.HasResourceAccess(satellite, clusterName, namespace, "pods/exec", "*") {
		log.Warn(r.Context(), "User is not authorized to access the resource", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", "pods/exec"), zap.String("verb", "*"))

		msg, _ := json.Marshal(terminal.Message{
			Op:   "stdout",
			Data: fmt.Sprintf("You are not authorized to access the resource: cluster: %s, namespace: %s, resource: pods/exec, verb: *", clusterName, namespace),
		})

		c.WriteMessage(websocket.TextMessage, msg)
		return
	}

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		msg, _ := json.Marshal(terminal.Message{
			Op:   "stdout",
			Data: fmt.Sprintf("Invalid cluster name: %s", err.Error()),
		})
		c.WriteMessage(websocket.TextMessage, msg)
		return
	}

	err = cluster.GetTerminal(c, namespace, name, container, shell)
	if err != nil {
		log.Error(r.Context(), "Could not create terminal", zap.Error(err))
		msg, _ := json.Marshal(terminal.Message{
			Op:   "stdout",
			Data: fmt.Sprintf("Could not create terminal: %s", err.Error()),
		})
		c.WriteMessage(websocket.TextMessage, msg)
		return
	}

	log.Debug(r.Context(), "Terminal connection was closed")
}

// getFile allows a user to download a file from a given container. For that the file/folder which should be downloaded
// must be specified as source path (srcPath).
func (router *Router) getFile(w http.ResponseWriter, r *http.Request) {
	satellite := r.Header.Get("x-kobs-satellite")

	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	srcPath := r.URL.Query().Get("srcPath")

	log.Debug(r.Context(), "Get file parameters", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name), zap.String("container", container), zap.String("srcPath", srcPath))

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to access the resource", zap.Error(err), zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name), zap.String("container", container))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	if router.isForbidden(clusterName, namespace, "pods/exec", "*") {
		log.Warn(r.Context(), "Access for the resource is forbidden", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", "pods/exec"), zap.String("verb", "*"), zap.String("name", name), zap.String("container", container))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: pods/exec, verb: *", clusterName, namespace), http.StatusForbidden, "Access for the resource is forbidden")
		return
	}

	if !user.HasResourceAccess(satellite, clusterName, namespace, "pods/exec", "*") {
		log.Warn(r.Context(), "User is not authorized to access the resource", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", "pods/exec"), zap.String("verb", "*"), zap.String("name", name), zap.String("container", container))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: pods/exec, verb: *", clusterName, namespace), http.StatusForbidden, "You are not authorized to access the resource")
		return
	}

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	err = cluster.CopyFileFromPod(w, namespace, name, container, srcPath)
	if err != nil {
		log.Error(r.Context(), "Could not copy file", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not copy file")
		return
	}
}

// postFile allows a user to upload a file to a given container. For that the file must be sent as form data, so that it
// can be created in the destination (destPath).
func (router *Router) postFile(w http.ResponseWriter, r *http.Request) {
	satellite := r.Header.Get("x-kobs-satellite")

	clusterName := r.URL.Query().Get("cluster")
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	destPath := r.URL.Query().Get("destPath")

	log.Debug(r.Context(), "Get file parameters", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name), zap.String("container", container), zap.String("destPath", destPath))

	f, h, err := r.FormFile("file")
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not upload file")
		return
	}
	defer f.Close()

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to access the resource", zap.Error(err), zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("name", name), zap.String("container", container))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	if router.isForbidden(clusterName, namespace, "pods/exec", "*") {
		log.Warn(r.Context(), "Access for the resource is forbidden", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", "pods/exec"), zap.String("verb", "*"), zap.String("name", name), zap.String("container", container))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: pods/exec, verb: *", clusterName, namespace), http.StatusForbidden, "Access for the resource is forbidden")
		return
	}

	if !user.HasResourceAccess(satellite, clusterName, namespace, "pods/exec", "*") {
		log.Warn(r.Context(), "User is not authorized to access the resource", zap.String("cluster", clusterName), zap.String("namespace", namespace), zap.String("resource", "pods/exec"), zap.String("verb", "*"), zap.String("name", name), zap.String("container", container))
		errresponse.Render(w, r, fmt.Errorf("cluster: %s, namespace: %s, resource: pods/exec, verb: *", clusterName, namespace), http.StatusForbidden, "You are not authorized to access the resource")
		return
	}

	cluster := router.clustersClient.GetCluster(clusterName)
	if cluster == nil {
		log.Error(r.Context(), "Invalid cluster name", zap.String("cluster", clusterName))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid cluster name")
		return
	}

	destPath = destPath + "/" + h.Filename

	err = cluster.CopyFileToPod(namespace, name, container, f, destPath)
	if err != nil {
		log.Error(r.Context(), "Could not copy file", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not copy file")
		return
	}

	render.JSON(w, r, nil)
}
