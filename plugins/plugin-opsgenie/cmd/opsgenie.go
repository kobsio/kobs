package main

import (
	"net/http"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-opsgenie/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Router implements the router for the Opsgenie plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a Opsgenie instance by it's name. If we couldn't found an instance with the provided name and
// the provided name is "default" we return the first instance from the list. The first instance in the list is also the
// first one configured by the user and can be used as default one.
func (router *Router) getInstance(name string) instance.Instance {
	for _, i := range router.instances {
		if i.GetName() == name {
			return i
		}
	}

	if name == "default" && len(router.instances) > 0 {
		return router.instances[0]
	}

	return nil
}

func (router *Router) getAlerts(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")

	log.Debug(r.Context(), "Get alerts parameters", zap.String("name", name), zap.String("query", query))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	alerts, err := i.GetAlerts(r.Context(), query)
	if err != nil {
		log.Error(r.Context(), "Could not get alerts", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alerts")
		return
	}

	render.JSON(w, r, alerts)
}

func (router *Router) getAlertDetails(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get alert details parameters", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	details, err := i.GetAlertDetails(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get alert details", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alert details")
		return
	}

	render.JSON(w, r, details)
}

func (router *Router) getAlertLogs(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get alert logs parameters", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	logs, err := i.GetAlertLogs(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get alert logs", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alert logs")
		return
	}

	render.JSON(w, r, logs)
}

func (router *Router) getAlertNotes(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get alert notes parameters", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	notes, err := i.GetAlertNotes(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get alert notes", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alert notes")
		return
	}

	render.JSON(w, r, notes)
}

func (router *Router) getIncidents(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")

	log.Debug(r.Context(), "Get incidents parameters", zap.String("name", name), zap.String("query", query))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	incidents, err := i.GetIncidents(r.Context(), query)
	if err != nil {
		log.Error(r.Context(), "Could not get incidents", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incidents")
		return
	}

	render.JSON(w, r, incidents)
}

func (router *Router) getIncidentLogs(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get incident logs parameters", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	logs, err := i.GetIncidentLogs(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get incident logs", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incident logs")
		return
	}

	render.JSON(w, r, logs)
}

func (router *Router) getIncidentNotes(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get incident notes parameters", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	notes, err := i.GetIncidentNotes(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get incident notes", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incident notes")
		return
	}

	render.JSON(w, r, notes)
}

func (router *Router) getIncidentTimeline(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get incident timeline parameters", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	timeline, err := i.GetIncidentTimeline(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get incident timeline", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incident timeline")
		return
	}

	render.JSON(w, r, timeline)
}

func (router *Router) acknowledgeAlert(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Acknowlege alert parameters", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to acknowledge the alert", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to acknowledge the alert")
		return
	}

	if err := i.CheckPermissions(name, user, "acknowledgeAlert"); err != nil {
		log.Warn(r.Context(), "User is not allowed to acknowledge alerts", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to acknowledge alerts")
		return
	}

	err = i.AcknowledgeAlert(r.Context(), id, user.Email)
	if err != nil {
		log.Error(r.Context(), "Could not acknowledge alert", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not acknowledge alert")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) snoozeAlert(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")
	snooze := r.URL.Query().Get("snooze")

	log.Debug(r.Context(), "Snooze alert parameters", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to snooze the alert", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to snooze the alert")
		return
	}

	if err := i.CheckPermissions(name, user, "snoozeAlert"); err != nil {
		log.Warn(r.Context(), "User is not allowed to snooze alerts", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to snooze alerts")
		return
	}

	snoozeParsed, err := time.ParseDuration(snooze)
	if err != nil {
		log.Error(r.Context(), "Could not snooze alert", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not parse snooze parameter")
		return
	}

	err = i.SnoozeAlert(r.Context(), id, user.Email, snoozeParsed)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not snooze alert")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) closeAlert(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Close alert parameters", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to close the alert", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to close the alert")
		return
	}

	if err := i.CheckPermissions(name, user, "closeAlert"); err != nil {
		log.Warn(r.Context(), "User is not allowed to close alerts", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to close alerts")
		return
	}

	err = i.CloseAlert(r.Context(), id, user.Email)
	if err != nil {
		log.Error(r.Context(), "Could not close alert", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not close alert")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) resolveIncident(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Resolve incident parameters", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to resolve the incident", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to resolve the incident")
		return
	}

	if err := i.CheckPermissions(name, user, "resolveIncident"); err != nil {
		log.Warn(r.Context(), "User is not allowed to resolve incidents", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to resolve incidents")
		return
	}

	err = i.ResolveIncident(r.Context(), id, user.Email)
	if err != nil {
		log.Error(r.Context(), "Could not resolve incidents", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not resolve incident")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) closeIncident(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Close incident parameters", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to close the incident", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to close the incident")
		return
	}

	if err := i.CheckPermissions(name, user, "closeIncident"); err != nil {
		log.Warn(r.Context(), "User is not allowed to close incidents", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to close incidents")
		return
	}

	err = i.CloseIncident(r.Context(), id, user.Email)
	if err != nil {
		log.Error(r.Context(), "Could not close incident", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not close incident")
		return
	}

	render.JSON(w, r, nil)
}

// Mount mounts the Opsgenie plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var opsgenieInstances []instance.Instance

	for _, i := range instances {
		opsgenieInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}

		opsgenieInstances = append(opsgenieInstances, opsgenieInstance)
	}

	router := Router{
		chi.NewRouter(),
		opsgenieInstances,
	}

	router.Get("/alerts", router.getAlerts)
	router.Get("/alert/details", router.getAlertDetails)
	router.Get("/alert/logs", router.getAlertLogs)
	router.Get("/alert/notes", router.getAlertNotes)
	router.Get("/alert/acknowledge", router.acknowledgeAlert)
	router.Get("/alert/snooze", router.snoozeAlert)
	router.Get("/alert/close", router.closeAlert)
	router.Get("/incidents", router.getIncidents)
	router.Get("/incident/logs", router.getIncidentLogs)
	router.Get("/incident/notes", router.getIncidentNotes)
	router.Get("/incident/timeline", router.getIncidentTimeline)
	router.Get("/incident/resolve", router.resolveIncident)
	router.Get("/incident/close", router.closeIncident)

	return router, nil
}
