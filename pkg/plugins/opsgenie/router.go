package opsgenie

import (
	"net/http"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/opsgenie/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

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

	log.Debug(r.Context(), "getAlerts", zap.String("name", name), zap.String("query", query))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	alerts, err := i.GetAlerts(r.Context(), query)
	if err != nil {
		log.Error(r.Context(), "Failed to get alerts", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get alerts")
		return
	}

	render.JSON(w, r, alerts.Alerts)
}

func (router *Router) getAlertDetails(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "getAlertDetails", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	details, err := i.GetAlertDetails(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Failed to get alert details", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get alert details")
		return
	}

	render.JSON(w, r, details)
}

func (router *Router) getAlertLogs(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "getAlertLogs", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	logs, err := i.GetAlertLogs(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Failed to get alert logs", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get alert logs")
		return
	}

	render.JSON(w, r, logs.AlertLog)
}

func (router *Router) getAlertNotes(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "getAlertNotes", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	notes, err := i.GetAlertNotes(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Failed to get alert notes", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get alert notes")
		return
	}

	render.JSON(w, r, notes.AlertLog)
}

func (router *Router) getIncidents(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	query := r.URL.Query().Get("query")

	log.Debug(r.Context(), "getIncidents", zap.String("name", name), zap.String("query", query))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	incidents, err := i.GetIncidents(r.Context(), query)
	if err != nil {
		log.Error(r.Context(), "Failed to get incidents", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get incidents")
		return
	}

	render.JSON(w, r, incidents.Incidents)
}

func (router *Router) getIncidentLogs(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "getIncidentLogs", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	logs, err := i.GetIncidentLogs(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Failed to get incident logs", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get incident logs")
		return
	}

	render.JSON(w, r, logs.Logs)
}

func (router *Router) getIncidentNotes(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "getIncidentNotes", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	notes, err := i.GetIncidentNotes(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Failed to get incident notes", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get incident notes")
		return
	}

	render.JSON(w, r, notes.Notes)
}

func (router *Router) getIncidentTimeline(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "getIncidentTimeline", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	timeline, err := i.GetIncidentTimeline(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Failed to get incident timeline", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get incident timeline")
		return
	}

	render.JSON(w, r, timeline)
}

func (router *Router) acknowledgeAlert(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "acknowledgeAlert", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	user := authContext.MustGetUser(r.Context())
	err := i.AcknowledgeAlert(r.Context(), id, user.ID)
	if err != nil {
		log.Error(r.Context(), "Failed to acknowledge alert", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to acknowledge alert")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) snoozeAlert(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")
	snooze := r.URL.Query().Get("snooze")

	log.Debug(r.Context(), "snoozeAlert", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	snoozeParsed, err := time.ParseDuration(snooze)
	if err != nil {
		log.Error(r.Context(), "Failed to snooze alert", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse snooze parameter")
		return
	}

	user := authContext.MustGetUser(r.Context())
	err = i.SnoozeAlert(r.Context(), id, user.ID, snoozeParsed)
	if err != nil {
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to snooze alert")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) closeAlert(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "closeAlert", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	user := authContext.MustGetUser(r.Context())
	err := i.CloseAlert(r.Context(), id, user.ID)
	if err != nil {
		log.Error(r.Context(), "Failed to close alert", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to close alert")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) resolveIncident(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "resolveIncident", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	user := authContext.MustGetUser(r.Context())
	err := i.ResolveIncident(r.Context(), id, user.ID)
	if err != nil {
		log.Error(r.Context(), "Failed to resolve incidents", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to resolve incident")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) closeIncident(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "closeIncident", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	user := authContext.MustGetUser(r.Context())
	err := i.CloseIncident(r.Context(), id, user.ID)
	if err != nil {
		log.Error(r.Context(), "Failed to close incident", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to close incident")
		return
	}

	render.JSON(w, r, nil)
}

func Mount(instances []plugin.Instance) (chi.Router, error) {
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
