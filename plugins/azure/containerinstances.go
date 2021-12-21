package azure

import (
	"net/http"

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

	log.Debug(r.Context(), "Get container groups parameters.", zap.String("name", name), zap.Strings("resourceGroups", resourceGroups))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var containerGroups []*armcontainerinstance.ContainerGroup

	for _, resourceGroup := range resourceGroups {
		err := i.CheckPermissions(r, "containerinstances", resourceGroup)
		if err == nil {
			cgs, err := i.ContainerInstances.ListContainerGroups(r.Context(), resourceGroup)
			if err != nil {
				log.Error(r.Context(), "Could not list container groups.", zap.Error(err))
				errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not list container groups")
				return
			}

			containerGroups = append(containerGroups, cgs...)
		}
	}

	render.JSON(w, r, containerGroups)
}

func (router *Router) getContainerGroup(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	containerGroup := r.URL.Query().Get("containerGroup")

	log.Debug(r.Context(), "Get container group parameters.", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("containerGroup", containerGroup))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "containerinstances", resourceGroup)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the container instance.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the container instance")
		return
	}

	cg, err := i.ContainerInstances.GetContainerGroup(r.Context(), resourceGroup, containerGroup)
	if err != nil {
		log.Error(r.Context(), "Could not get container instances.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get container instances")
		return
	}

	render.JSON(w, r, cg)
}

func (router *Router) restartContainerGroup(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	containerGroup := r.URL.Query().Get("containerGroup")

	log.Debug(r.Context(), "Restart container group parameters.", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("containerGroup", containerGroup))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "containerinstances", resourceGroup)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the container instance.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to restart the container instance")
		return
	}

	err = i.ContainerInstances.RestartContainerGroup(r.Context(), resourceGroup, containerGroup)
	if err != nil {
		log.Error(r.Context(), "Could not restart container group.", zap.Error(err))
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

	log.Debug(r.Context(), "Get container logs.", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("containerGroup", containerGroup), zap.String("container", container))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "containerinstances", resourceGroup)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the container instance.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the logs of the container instance")
		return
	}

	tail := int32(10000)
	timestamps := false

	logs, err := i.ContainerInstances.GetContainerLogs(r.Context(), resourceGroup, containerGroup, container, &tail, &timestamps)
	if err != nil {
		log.Error(r.Context(), "Could not get container logs.", zap.Error(err))
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
