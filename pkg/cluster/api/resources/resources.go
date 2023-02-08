package resources

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/cluster/kubernetes/cluster/terminal"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/gorilla/websocket"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

var (
	pingPeriod = 30 * time.Second
)

type Config struct{}

type Router struct {
	*chi.Mux
	config           Config
	kubernetesClient kubernetes.Client
	tracer           trace.Tracer
}

// getResources returns a list of resources for the given clusters and namespaces. The result can limited by the
// paramName and param query parameter.
func (router *Router) getResources(w http.ResponseWriter, r *http.Request) {
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")
	path := r.URL.Query().Get("path")
	paramName := r.URL.Query().Get("paramName")
	param := r.URL.Query().Get("param")

	ctx, span := router.tracer.Start(r.Context(), "getResources")
	defer span.End()
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("resource").String(resource))
	span.SetAttributes(attribute.Key("path").String(path))
	span.SetAttributes(attribute.Key("paramName").String(paramName))
	span.SetAttributes(attribute.Key("param").String(param))
	log.Debug(ctx, "Get resources", zap.String("namespace", namespace), zap.String("name", name), zap.String("resource", resource), zap.String("path", path), zap.String("paramName", paramName), zap.String("param", param))

	list, err := router.kubernetesClient.GetResources(ctx, namespace, name, path, resource, paramName, param)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not get resource", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}

	var resources map[string]any
	err = json.Unmarshal(list, &resources)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not unmarshal resources", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}

	render.JSON(w, r, resources)
}

// deleteResource handles the deletion of a resource. The resource can be identified by the given cluster, namespace,
// name, resource and path.
// When the user sets the "force" parameter to "true" we will set a body on the delete request, where we set the
// "gracePeriodSeconds" to 0. This will cause the same behaviour as "kubectl delete --force --grace-period 0".
func (router *Router) deleteResource(w http.ResponseWriter, r *http.Request) {
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")
	path := r.URL.Query().Get("path")
	force := r.URL.Query().Get("force")

	ctx, span := router.tracer.Start(r.Context(), "deleteResource")
	defer span.End()
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("resource").String(resource))
	span.SetAttributes(attribute.Key("path").String(path))
	span.SetAttributes(attribute.Key("force").String(force))
	log.Debug(ctx, "Delete resource", zap.String("namespace", namespace), zap.String("name", name), zap.String("resource", resource), zap.String("path", path), zap.String("force", force))

	parsedForce, err := strconv.ParseBool(force)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not parse force parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, err)
		return
	}

	var body []byte
	if parsedForce {
		body = []byte(`{"gracePeriodSeconds": 0}`)
	}

	err = router.kubernetesClient.DeleteResource(ctx, namespace, name, path, resource, body)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not delete resource", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}

	render.JSON(w, r, nil)
}

// patchResource hadnles patch operations for resources. The resource can be identified by the given cluster,
// namespace, name, resource and path. The patch operation must be provided in the request body.
func (router *Router) patchResource(w http.ResponseWriter, r *http.Request) {
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")
	path := r.URL.Query().Get("path")

	ctx, span := router.tracer.Start(r.Context(), "patchResource")
	defer span.End()
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("resource").String(resource))
	span.SetAttributes(attribute.Key("path").String(path))
	log.Debug(ctx, "Patch resource", zap.String("namespace", namespace), zap.String("name", name), zap.String("resource", resource), zap.String("path", path))

	body, err := io.ReadAll(r.Body)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, err)
		return
	}

	err = router.kubernetesClient.PatchResource(ctx, namespace, name, path, resource, body)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not patch resource", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}

	render.JSON(w, r, nil)
}

// createResource hadnles patch operations for resources. The resource can be identified by the given cluster,
// namespace, name, resource and path. The resource must be provided in the request body.
func (router *Router) createResource(w http.ResponseWriter, r *http.Request) {
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	resource := r.URL.Query().Get("resource")
	subResource := r.URL.Query().Get("subResource")
	path := r.URL.Query().Get("path")

	ctx, span := router.tracer.Start(r.Context(), "createResource")
	defer span.End()
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("resource").String(resource))
	span.SetAttributes(attribute.Key("path").String(path))
	log.Debug(ctx, "Create resource", zap.String("namespace", namespace), zap.String("name", name), zap.String("path", path), zap.String("resource", resource), zap.String("subResource", subResource))

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, err)
		return
	}

	err = router.kubernetesClient.CreateResource(ctx, namespace, name, path, resource, subResource, body)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not create resource", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}

	render.JSON(w, r, nil)
}

// getLogs returns the logs for the container of a pod in a cluster and namespace. A user can also set the time since
// when the logs should be returned.
func (router *Router) getLogs(w http.ResponseWriter, r *http.Request) {
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	regex := r.URL.Query().Get("regex")
	since := r.URL.Query().Get("since")
	tail := r.URL.Query().Get("tail")
	previous := r.URL.Query().Get("previous")
	follow := r.URL.Query().Get("follow")

	ctx, span := router.tracer.Start(r.Context(), "getLogs")
	defer span.End()
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("container").String(container))
	span.SetAttributes(attribute.Key("regex").String(regex))
	span.SetAttributes(attribute.Key("since").String(since))
	span.SetAttributes(attribute.Key("tail").String(tail))
	span.SetAttributes(attribute.Key("previous").String(previous))
	span.SetAttributes(attribute.Key("follow").String(follow))
	log.Debug(ctx, "Get logs", zap.String("namespace", namespace), zap.String("name", name), zap.String("container", container), zap.String("regex", regex), zap.String("since", since), zap.String("tail", tail), zap.String("previous", previous), zap.String("follow", follow))

	parsedSince, err := strconv.ParseInt(since, 10, 64)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not parse since parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, err)
		return
	}

	parsedTail, err := strconv.ParseInt(tail, 10, 64)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not parse tail parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, err)
		return
	}

	parsedPrevious, err := strconv.ParseBool(previous)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not parse previous parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, err)
		return
	}

	parsedFollow, err := strconv.ParseBool(follow)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not parse follow parameter", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, err)
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
			span.RecordError(err)
			span.SetStatus(codes.Error, err.Error())
			log.Error(ctx, "Could not upgrade connection", zap.Error(err))
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

		err = router.kubernetesClient.StreamLogs(ctx, c, namespace, name, container, parsedSince, parsedTail, parsedFollow)
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, err.Error())
			log.Error(ctx, "Could not stream logs", zap.Error(err))
			c.WriteMessage(websocket.TextMessage, []byte("Could not stream logs: "+err.Error()))
			return
		}

		log.Debug(ctx, "Logs stream was closed")
		return
	}

	logs, err := router.kubernetesClient.GetLogs(ctx, namespace, name, container, regex, parsedSince, parsedTail, parsedPrevious)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not get logs", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadGateway, err)
		return
	}

	log.Debug(ctx, "Get logs result", zap.Int("lineCount", len(logs)))
	render.JSON(w, r, struct {
		Logs string `json:"logs"`
	}{logs})
}

// getTerminal starts a new terminal session for a container in a pod. The user must provide the cluster, namespace, pod
// and container via the corresponding query parameter. It is also possible to specify the shell which should be used
// for the terminal.
func (router *Router) getTerminal(w http.ResponseWriter, r *http.Request) {
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	shell := r.URL.Query().Get("shell")

	ctx, span := router.tracer.Start(r.Context(), "getTerminal")
	defer span.End()
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("container").String(container))
	span.SetAttributes(attribute.Key("shell").String(shell))
	log.Debug(ctx, "Get terminal", zap.String("namespace", namespace), zap.String("name", name), zap.String("container", container), zap.String("shell", shell))

	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not upgrade connection", zap.Error(err))
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

	err = router.kubernetesClient.GetTerminal(ctx, c, namespace, name, container, shell)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not create terminal", zap.Error(err))
		msg, _ := json.Marshal(terminal.Message{
			Op:   "stdout",
			Data: fmt.Sprintf("Could not create terminal: %s", err.Error()),
		})
		c.WriteMessage(websocket.TextMessage, msg)
		return
	}

	log.Debug(ctx, "Terminal connection was closed")
}

// getFile allows a user to download a file from a given container. For that the file/folder which should be downloaded
// must be specified as source path (srcPath).
func (router *Router) getFile(w http.ResponseWriter, r *http.Request) {
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	srcPath := r.URL.Query().Get("srcPath")

	ctx, span := router.tracer.Start(r.Context(), "getFile")
	defer span.End()
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("container").String(container))
	span.SetAttributes(attribute.Key("srcPath").String(srcPath))
	log.Debug(ctx, "Get file", zap.String("namespace", namespace), zap.String("name", name), zap.String("container", container), zap.String("srcPath", srcPath))

	err := router.kubernetesClient.CopyFileFromPod(ctx, w, namespace, name, container, srcPath)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not copy file", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}
}

// postFile allows a user to upload a file to a given container. For that the file must be sent as form data, so that it
// can be created in the destination (destPath).
func (router *Router) postFile(w http.ResponseWriter, r *http.Request) {
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	container := r.URL.Query().Get("container")
	destPath := r.URL.Query().Get("destPath")

	ctx, span := router.tracer.Start(r.Context(), "postFile")
	defer span.End()
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("container").String(container))
	span.SetAttributes(attribute.Key("destPath").String(destPath))
	log.Debug(ctx, "Post file", zap.String("namespace", namespace), zap.String("name", name), zap.String("container", container), zap.String("destPath", destPath))

	f, h, err := r.FormFile("file")
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not read file", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, err)
		return
	}
	defer f.Close()

	destPath = destPath + "/" + h.Filename

	err = router.kubernetesClient.CopyFileToPod(ctx, namespace, name, container, f, destPath)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not copy file", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) getNamespaces(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getNamespaces")
	defer span.End()
	log.Debug(ctx, "Get namespaces")

	namespaces, err := router.kubernetesClient.GetNamespaces(ctx)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not get namespaces", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}

	render.JSON(w, r, namespaces)
}

func (router *Router) getCRDs(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getCRDs")
	defer span.End()
	log.Debug(ctx, "Get CRDs")

	crds, err := router.kubernetesClient.GetCRDs(ctx)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not get CRDs", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, err)
		return
	}

	render.JSON(w, r, crds)
}

func Mount(config Config, kubernetesClient kubernetes.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
		kubernetesClient,
		otel.Tracer("resources"),
	}

	router.Get("/", router.getResources)
	router.Delete("/", router.deleteResource)
	router.Put("/", router.patchResource)
	router.Post("/", router.createResource)
	router.Get("/logs", router.getLogs)
	router.HandleFunc("/terminal", router.getTerminal)
	router.Get("/file", router.getFile)
	router.Post("/file", router.postFile)
	router.Post("/namespaces", router.getNamespaces)
	router.Post("/crds", router.getCRDs)

	return router
}
