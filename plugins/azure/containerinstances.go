package azure

import (
	"net/http"
	"strconv"

	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/log"

	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/containerinstance/armcontainerinstance"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func (router *Router) getContainerGroups(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroups := r.URL.Query()["resourceGroup"]

	log.Debug(r.Context(), "Get container groups parameters", zap.String("name", name), zap.Strings("resourceGroups", resourceGroups))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get container groups", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get container groups")
		return
	}

	var containerGroups []*armcontainerinstance.ContainerGroup

	for _, resourceGroup := range resourceGroups {
		err := i.CheckPermissions(name, user, "containerinstances", resourceGroup, r.Method)
		if err == nil {
			cgs, err := i.ContainerInstancesClient().ListContainerGroups(r.Context(), resourceGroup)
			if err != nil {
				log.Error(r.Context(), "Could not list container groups", zap.Error(err))
				errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not list container groups")
				return
			}

			containerGroups = append(containerGroups, cgs...)
		} else {
			log.Warn(r.Context(), "User is not authorized to get container groups", zap.String("resourceGroup", resourceGroup), zap.String("name", name), zap.String("user", user.ID), zap.String("method", r.Method), zap.Error(err))
		}
	}

	render.JSON(w, r, containerGroups)
}

func (router *Router) getContainerGroup(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	containerGroup := r.URL.Query().Get("containerGroup")

	log.Debug(r.Context(), "Get container group parameters", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("containerGroup", containerGroup))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get container group", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get container group")
		return
	}

	err = i.CheckPermissions(name, user, "containerinstances", resourceGroup, r.Method)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the container instance", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the container instance")
		return
	}

	cg, err := i.ContainerInstancesClient().GetContainerGroup(r.Context(), resourceGroup, containerGroup)
	if err != nil {
		log.Error(r.Context(), "Could not get container instances", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get container instances")
		return
	}

	render.JSON(w, r, cg)
}

func (router *Router) restartContainerGroup(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	containerGroup := r.URL.Query().Get("containerGroup")

	log.Debug(r.Context(), "Restart container group parameters", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("containerGroup", containerGroup))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to restart container group", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to restart container group")
		return
	}

	err = i.CheckPermissions(name, user, "containerinstances", resourceGroup, r.Method)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the container instance", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to restart the container instance")
		return
	}

	err = i.ContainerInstancesClient().RestartContainerGroup(r.Context(), resourceGroup, containerGroup)
	if err != nil {
		log.Error(r.Context(), "Could not restart container group", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get restart container group")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) getContainerLogs(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	containerGroup := r.URL.Query().Get("containerGroup")
	container := r.URL.Query().Get("container")
	tail := r.URL.Query().Get("tail")
	timestamps := r.URL.Query().Get("timestamps")

	log.Debug(r.Context(), "Get container logs", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("containerGroup", containerGroup), zap.String("container", container))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	parsedTail, err := strconv.ParseInt(tail, 10, 32)
	if err != nil {
		log.Error(r.Context(), "Could not parse tail", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse tail")
		return
	}
	parsedTailInt32 := int32(parsedTail)

	parsedTimestamps, err := strconv.ParseBool(timestamps)
	if err != nil {
		log.Error(r.Context(), "Could not parse timestamps", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse timestamps")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get container logs", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get container logs")
		return
	}

	err = i.CheckPermissions(name, user, "containerinstances", resourceGroup, r.Method)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the container instance", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the logs of the container instance")
		return
	}

	logs, err := i.ContainerInstancesClient().GetContainerLogs(r.Context(), resourceGroup, containerGroup, container, &parsedTailInt32, &parsedTimestamps)
	if err != nil {
		log.Error(r.Context(), "Could not get container logs", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get container logs")
		return
	}

	data := struct {
		Logs *string `json:"logs"`
	}{
		logs,
	}

	render.JSON(w, r, data)
}
