package instance

import (
	"context"

	"github.com/kobsio/kobs/plugins/opsgenie/pkg/instance/timeline"

	"github.com/opsgenie/opsgenie-go-sdk-v2/alert"
	"github.com/opsgenie/opsgenie-go-sdk-v2/client"
	"github.com/opsgenie/opsgenie-go-sdk-v2/incident"
	"github.com/sirupsen/logrus"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "opsgenie"})
)

// Config is the structure of the configuration for a single Opsgenie instance.
type Config struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Description string `json:"description"`
	APIKey      string `json:"apiKey"`
	APIUrl      string `json:"apiUrl"`
	URL         string `json:"url"`
}

// Instance represents a single Jaeger instance, which can be added via the configuration file.
type Instance struct {
	Name           string
	alertClient    *alert.Client
	incidentClient *incident.Client
	timelineClient *timeline.Client
}

// GetAlerts returns a list of Opsgenie alerts for the given query.
func (i *Instance) GetAlerts(ctx context.Context, query string) ([]alert.Alert, error) {
	res, err := i.alertClient.List(ctx, &alert.ListAlertRequest{
		Limit: 100,
		Query: query,
		Order: alert.Desc,
		Sort:  alert.CreatedAt,
	})
	if err != nil {
		return nil, err
	}

	return res.Alerts, nil
}

// GetAlertDetails returns the details for single alert.
func (i *Instance) GetAlertDetails(ctx context.Context, id string) (*alert.GetAlertResult, error) {
	res, err := i.alertClient.Get(ctx, &alert.GetAlertRequest{
		IdentifierType:  alert.ALERTID,
		IdentifierValue: id,
	})
	if err != nil {
		return nil, err
	}

	return res, nil
}

// GetAlertLogs returns the logs for single alert.
func (i *Instance) GetAlertLogs(ctx context.Context, id string) ([]alert.AlertLog, error) {
	res, err := i.alertClient.ListAlertLogs(ctx, &alert.ListAlertLogsRequest{
		IdentifierType:  alert.ALERTID,
		IdentifierValue: id,
	})
	if err != nil {
		return nil, err
	}

	return res.AlertLog, nil
}

// GetAlertNotes returns the notes for single alert.
func (i *Instance) GetAlertNotes(ctx context.Context, id string) ([]alert.AlertNote, error) {
	res, err := i.alertClient.ListAlertNotes(ctx, &alert.ListAlertNotesRequest{
		IdentifierType:  alert.ALERTID,
		IdentifierValue: id,
	})
	if err != nil {
		return nil, err
	}

	return res.AlertLog, nil
}

// GetIncidents returns a list of Opsgenie incidents for the given query.
func (i *Instance) GetIncidents(ctx context.Context, query string) ([]incident.Incident, error) {
	res, err := i.incidentClient.List(ctx, &incident.ListRequest{
		Limit: 100,
		Query: query,
		Order: incident.Desc,
		Sort:  incident.CreatedAt,
	})
	if err != nil {
		return nil, err
	}

	return res.Incidents, nil
}

// GetIncidentLogs returns the logs for single incident.
func (i *Instance) GetIncidentLogs(ctx context.Context, id string) ([]incident.LogResult, error) {
	res, err := i.incidentClient.ListLogs(ctx, &incident.ListLogsRequest{
		Identifier: incident.Id,
		Id:         id,
	})
	if err != nil {
		return nil, err
	}

	return res.Logs, nil
}

// GetIncidentNotes returns the notes for single incident.
func (i *Instance) GetIncidentNotes(ctx context.Context, id string) ([]incident.NoteResult, error) {
	res, err := i.incidentClient.ListNotes(ctx, &incident.ListNotesRequest{
		Identifier: incident.Id,
		Id:         id,
	})
	if err != nil {
		return nil, err
	}

	return res.Notes, nil
}

// GetIncidentTimeline returns the timeline for single incident.
func (i *Instance) GetIncidentTimeline(ctx context.Context, id string) ([]timeline.Entry, error) {
	res, err := i.timelineClient.GetTimeline(ctx, id)
	if err != nil {
		return nil, err
	}

	return res, nil
}

// New returns a new Elasticsearch instance for the given configuration.
func New(config Config) (*Instance, error) {
	alertClient, err := alert.NewClient(&client.Config{
		ApiKey:         config.APIKey,
		OpsGenieAPIURL: client.ApiUrl(config.APIUrl),
		Logger:         log.Logger,
	})
	if err != nil {
		return nil, err
	}

	incidentClient, err := incident.NewClient(&client.Config{
		ApiKey:         config.APIKey,
		OpsGenieAPIURL: client.ApiUrl(config.APIUrl),
		Logger:         log.Logger,
	})
	if err != nil {
		return nil, err
	}

	timelineClient, err := timeline.NewClient(&client.Config{
		ApiKey:         config.APIKey,
		OpsGenieAPIURL: client.ApiUrl(config.APIUrl),
		Logger:         log.Logger,
	})
	if err != nil {
		return nil, err
	}

	return &Instance{
		Name:           config.Name,
		alertClient:    alertClient,
		incidentClient: incidentClient,
		timelineClient: timelineClient,
	}, nil
}
