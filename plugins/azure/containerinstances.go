package azure

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

func (router *Router) getContainerGroups(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroups := r.URL.Query()["resourceGroup"]

	log.WithFields(logrus.Fields{"name": name, "resourceGroups": resourceGroups}).Tracef("getContainerGroups")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var containerGroups []map[string]interface{}

	for _, resourceGroup := range resourceGroups {
		err := i.CheckPermissions(r, "containerinstances", resourceGroup)
		if err == nil {
			cgs, err := i.ContainerInstances.ListContainerGroups(r.Context(), resourceGroup)
			if err != nil {
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

	log.WithFields(logrus.Fields{"name": name, "resourceGroup": resourceGroup, "containerGroup": containerGroup}).Tracef("getContainerGroup")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "containerinstances", resourceGroup)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the container instance")
		return
	}

	cg, err := i.ContainerInstances.GetContainerGroup(r.Context(), resourceGroup, containerGroup)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get container instances")
		return
	}

	render.JSON(w, r, cg)
}

func (router *Router) getContainerMetrics(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	containerGroup := r.URL.Query().Get("containerGroup")
	metricName := r.URL.Query().Get("metricName")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.WithFields(logrus.Fields{"name": name, "resourceGroup": resourceGroup, "containerGroup": containerGroup, "metricName": metricName, "timeStart": timeStart, "timeEnd": timeEnd}).Tracef("getContainerMetrics")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "containerinstances", resourceGroup)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the metrics of the container instance")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	metrics, err := i.ContainerInstances.GetContainerGroupMetrics(r.Context(), resourceGroup, containerGroup, metricName, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get container group metrics")
		return
	}

	render.JSON(w, r, metrics)
}

func (router *Router) restartContainerGroup(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	containerGroup := r.URL.Query().Get("containerGroup")

	log.WithFields(logrus.Fields{"name": name, "resourceGroup": resourceGroup, "containerGroup": containerGroup}).Tracef("restartContainerGroup")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "containerinstances", resourceGroup)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to restart the container instance")
		return
	}

	err = i.ContainerInstances.RestartContainerGroup(r.Context(), resourceGroup, containerGroup)
	if err != nil {
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

	log.WithFields(logrus.Fields{"name": name, "resourceGroup": resourceGroup, "containerGroup": containerGroup, "container": container}).Tracef("getContainerLogs")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "containerinstances", resourceGroup)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to get the logs of the container instance")
		return
	}

	tail := int32(10000)
	timestamps := false

	logs, err := i.ContainerInstances.GetContainerLogs(r.Context(), resourceGroup, containerGroup, container, &tail, &timestamps)
	if err != nil {
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
