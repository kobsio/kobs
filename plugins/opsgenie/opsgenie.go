package opsgenie

import (
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/api/clusters"
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/opsgenie/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const (
	Route = "/opsgenie"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "opsgenie"})
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

	log.WithFields(logrus.Fields{"name": name, "query": query}).Tracef("getAlerts")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	alerts, err := i.GetAlerts(r.Context(), query)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alerts")
		return
	}

	render.JSON(w, r, alerts)
}

func (router *Router) getAlertDetails(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.WithFields(logrus.Fields{"name": name, "id": id}).Tracef("getAlertDetails")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	details, err := i.GetAlertDetails(r.Context(), id)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alert details")
		return
	}

	render.JSON(w, r, details)
}

func (router *Router) getAlertLogs(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.WithFields(logrus.Fields{"name": name, "id": id}).Tracef("getAlertLogs")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	logs, err := i.GetAlertLogs(r.Context(), id)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alert logs")
		return
	}

	render.JSON(w, r, logs)
}

func (router *Router) getAlertNotes(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.WithFields(logrus.Fields{"name": name, "id": id}).Tracef("getAlertNotes")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	notes, err := i.GetAlertNotes(r.Context(), id)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get alert notes")
		return
	}

	render.JSON(w, r, notes)
}

func (router *Router) getIncidents(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	query := r.URL.Query().Get("query")

	log.WithFields(logrus.Fields{"name": name, "query": query}).Tracef("getIncidents")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	incidents, err := i.GetIncidents(r.Context(), query)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incidents")
		return
	}

	render.JSON(w, r, incidents)
}

func (router *Router) getIncidentLogs(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.WithFields(logrus.Fields{"name": name, "id": id}).Tracef("getIncidentLogs")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	logs, err := i.GetIncidentLogs(r.Context(), id)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incident logs")
		return
	}

	render.JSON(w, r, logs)
}

func (router *Router) getIncidentNotes(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.WithFields(logrus.Fields{"name": name, "id": id}).Tracef("getIncidentNotes")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	notes, err := i.GetIncidentNotes(r.Context(), id)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incident notes")
		return
	}

	render.JSON(w, r, notes)
}

func (router *Router) getIncidentTimeline(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.WithFields(logrus.Fields{"name": name, "id": id}).Tracef("getIncidentTimeline")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	timeline, err := i.GetIncidentTimeline(r.Context(), id)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get incident timeline")
		return
	}

	render.JSON(w, r, timeline)
}

func (router *Router) acknowledgeAlert(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to acknowledge the alert")
		return
	}

	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.WithFields(logrus.Fields{"name": name, "id": id}).Tracef("acknowledgeAlert")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	if !i.Actions.Acknowledge {
		errresponse.Render(w, r, nil, http.StatusForbidden, "It is not allowed to acknowledge alerts")
		return
	}

	err = i.AcknowledgeAlert(r.Context(), id, user.ID)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not acknowledge alert")
		return
	}

	render.JSON(w, r, nil)
}

func (router *Router) snoozeAlert(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to snooze the alert")
		return
	}

	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")
	snooze := r.URL.Query().Get("snooze")

	log.WithFields(logrus.Fields{"name": name, "id": id}).Tracef("snoozeAlert")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	if !i.Actions.Snooze {
		errresponse.Render(w, r, nil, http.StatusForbidden, "It is not allowed to snooze alerts")
		return
	}

	snoozeParsed, err := time.ParseDuration(snooze)
	if err != nil {
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
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to close the alert")
		return
	}

	name := chi.URLParam(r, "name")
	id := r.URL.Query().Get("id")

	log.WithFields(logrus.Fields{"name": name, "id": id}).Tracef("closeAlert")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	if !i.Actions.Close {
		errresponse.Render(w, r, nil, http.StatusForbidden, "It is not allowed to close alerts")
		return
	}

	err = i.CloseAlert(r.Context(), id, user.ID)
	if err != nil {
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
			log.WithError(err).WithFields(logrus.Fields{"name": cfg.Name}).Fatalf("Could not create Opsgenie instance")
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

	router.Get("/alerts/{name}", router.getAlerts)
	router.Get("/alert/details/{name}", router.getAlertDetails)
	router.Get("/alert/logs/{name}", router.getAlertLogs)
	router.Get("/alert/notes/{name}", router.getAlertNotes)
	router.Get("/alert/acknowledge/{name}", router.acknowledgeAlert)
	router.Get("/alert/snooze/{name}", router.snoozeAlert)
	router.Get("/alert/close/{name}", router.closeAlert)
	router.Get("/incidents/{name}", router.getIncidents)
	router.Get("/incident/logs/{name}", router.getIncidentLogs)
	router.Get("/incident/notes/{name}", router.getIncidentNotes)
	router.Get("/incident/timeline/{name}", router.getIncidentTimeline)

	return router
}
