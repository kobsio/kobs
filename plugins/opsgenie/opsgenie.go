package opsgenie

import (
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/api/clusters"
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/opsgenie/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const (
	Route = "/opsgenie"
)

// Config is the structure of the configuration for the opsgenie plugin.
type Config []instance.Config

// Router implements the router for the resources plugin, which can be registered in the router for our rest api.
type Router struct {
	*chi.Mux
	clusters  *clusters.Clusters
	instances []*instance.Instance
}

func (router *Router) getInstance(name string) *instance.Instance {
	for _, i := range router.instances {
		if i.Name == name {
			return i
		}
	}

	return nil
}

func (router *Router) getAlerts(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	query := r.URL.Query().Get("query")

	log.Debug(r.Context(), "Get alerts parameters.", zap.String("name", name), zap.String("query", query))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	alerts, err := i.GetAlerts(r.Context(), query)
	if err != nil {
		log.Error(r.Context(), "Could not get alerts.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alerts")
		return
	}

	render.JSON(w, r, alerts)
}

func (router *Router) getAlertDetails(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get alert details parameters.", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	details, err := i.GetAlertDetails(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get alert details.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alert details")
		return
	}

	render.JSON(w, r, details)
}

func (router *Router) getAlertLogs(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get alert logs parameters.", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	logs, err := i.GetAlertLogs(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get alert logs.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alert logs")
		return
	}

	render.JSON(w, r, logs)
}

func (router *Router) getAlertNotes(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get alert notes parameters.", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	notes, err := i.GetAlertNotes(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get alert notes.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alert notes")
		return
	}

	render.JSON(w, r, notes)
}

func (router *Router) getIncidents(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	query := r.URL.Query().Get("query")

	log.Debug(r.Context(), "Get incidents parameters.", zap.String("name", name), zap.String("query", query))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	incidents, err := i.GetIncidents(r.Context(), query)
	if err != nil {
		log.Error(r.Context(), "Could not get incidents.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incidents")
		return
	}

	render.JSON(w, r, incidents)
}

func (router *Router) getIncidentLogs(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get incident logs parameters.", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	logs, err := i.GetIncidentLogs(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get incident logs.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incident logs")
		return
	}

	render.JSON(w, r, logs)
}

func (router *Router) getIncidentNotes(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get incident notes parameters.", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	notes, err := i.GetIncidentNotes(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get incident notes.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incident notes")
		return
	}

	render.JSON(w, r, notes)
}

func (router *Router) getIncidentTimeline(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Get incident timeline parameters.", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	timeline, err := i.GetIncidentTimeline(r.Context(), id)
	if err != nil {
		log.Error(r.Context(), "Could not get incident timeline.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incident timeline")
		return
	}

	render.JSON(w, r, timeline)
}

func (router *Router) acknowledgeAlert(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to acknowledge the alert.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to acknowledge the alert")
		return
	}

	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Acknowlege alert parameters.", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	if !i.Actions.Acknowledge {
		log.Warn(r.Context(), "It is not allowed to acknowledge alerts.")
		errresponse.Render(w, r, nil, http.StatusForbidden, "It is not allowed to acknowledge alerts")
		return
	}

	err = i.AcknowledgeAlert(r.Context(), id, user.ID)
	if err != nil {
		log.Error(r.Context(), "Could not acknowledge alert.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not acknowledge alert")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) snoozeAlert(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to snooze the alert.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to snooze the alert")
		return
	}

	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")
	snooze := r.URL.Query().Get("snooze")

	log.Debug(r.Context(), "Snooze alert parameters.", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	if !i.Actions.Snooze {
		log.Warn(r.Context(), "It is not allowed to snooze alerts.")
		errresponse.Render(w, r, nil, http.StatusForbidden, "It is not allowed to snooze alerts")
		return
	}

	snoozeParsed, err := time.ParseDuration(snooze)
	if err != nil {
		log.Error(r.Context(), "Could not snooze alert.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not parse snooze parameter")
		return
	}

	err = i.SnoozeAlert(r.Context(), id, user.ID, snoozeParsed)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not snooze alert")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) closeAlert(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to close the alert.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to close the alert")
		return
	}

	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.Debug(r.Context(), "Close alert parameters.", zap.String("name", name), zap.String("id", id))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	if !i.Actions.Close {
		log.Warn(r.Context(), "It is not allowed to close alerts.")
		errresponse.Render(w, r, nil, http.StatusForbidden, "It is not allowed to close alerts")
		return
	}

	err = i.CloseAlert(r.Context(), id, user.ID)
	if err != nil {
		log.Error(r.Context(), "Could not close alert.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not close alert")
		return
	}

	render.JSON(w, r, nil)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(clusters *clusters.Clusters, plugins *plugin.Plugins, config Config) chi.Router {
	var instances []*instance.Instance

	for _, cfg := range config {
		instance, err := instance.New(cfg)
		if err != nil {
			log.Fatal(nil, "Could not create Opsgenie instance.", zap.Error(err), zap.String("name", cfg.Name))
		}

		instances = append(instances, instance)

		var options map[string]interface{}
		options = make(map[string]interface{})
		options["url"] = cfg.URL
		options["actions"] = cfg.Actions

		plugins.Append(plugin.Plugin{
			Name:        cfg.Name,
			DisplayName: cfg.DisplayName,
			Description: cfg.Description,
			Type:        "opsgenie",
			Options:     options,
		})
	}

	router := Router{
		chi.NewRouter(),
		clusters,
		instances,
	}

	router.Route("/{name}", func(r chi.Router) {
		r.Get("/alerts", router.getAlerts)
		r.Get("/alert/details", router.getAlertDetails)
		r.Get("/alert/logs", router.getAlertLogs)
		r.Get("/alert/notes", router.getAlertNotes)
		r.Get("/alert/acknowledge", router.acknowledgeAlert)
		r.Get("/alert/snooze", router.snoozeAlert)
		r.Get("/alert/close", router.closeAlert)
		r.Get("/incidents", router.getIncidents)
		r.Get("/incident/logs", router.getIncidentLogs)
		r.Get("/incident/notes", router.getIncidentNotes)
		r.Get("/incident/timeline", router.getIncidentTimeline)
	})

	return router
}
