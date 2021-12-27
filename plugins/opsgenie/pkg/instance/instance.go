package instance

import (
	"context"
	"fmt"
	"time"

	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	extendedIncident "github.com/kobsio/kobs/plugins/opsgenie/pkg/instance/incident"

	"github.com/opsgenie/opsgenie-go-sdk-v2/alert"
	"github.com/opsgenie/opsgenie-go-sdk-v2/client"
	"github.com/opsgenie/opsgenie-go-sdk-v2/incident"
)

// Config is the structure of the configuration for a single Opsgenie instance. The user can set some general
// information like the name and descriptions of the Opsgenie instance. The user must also set the api key and api url
// to authenticate against the Opsgenie api. The url field can be used to set the public url of the Opsgenie instance,
// so that users can go from the kobs ui to the Opsgenie ui.
type Config struct {
	Name               string `json:"name"`
	DisplayName        string `json:"displayName"`
	Description        string `json:"description"`
	APIKey             string `json:"apiKey"`
	APIUrl             string `json:"apiUrl"`
	URL                string `json:"url"`
	PermissionsEnabled bool   `json:"permissionsEnabled"`
}

// Instance is the interface, which must be implemented by an Opsgenie instance. It contains all the functions to
// interact with the Opsgenie API.
type Instance interface {
	GetName() string
	GetAlerts(ctx context.Context, query string) ([]alert.Alert, error)
	GetAlertDetails(ctx context.Context, id string) (*alert.GetAlertResult, error)
	GetAlertLogs(ctx context.Context, id string) ([]alert.AlertLog, error)
	GetAlertNotes(ctx context.Context, id string) ([]alert.AlertNote, error)
	GetIncidents(ctx context.Context, query string) ([]incident.Incident, error)
	GetIncidentLogs(ctx context.Context, id string) ([]incident.LogResult, error)
	GetIncidentNotes(ctx context.Context, id string) ([]incident.NoteResult, error)
	GetIncidentTimeline(ctx context.Context, id string) ([]extendedIncident.Entry, error)
	AcknowledgeAlert(ctx context.Context, id, user string) error
	SnoozeAlert(ctx context.Context, id, user string, duration time.Duration) error
	CloseAlert(ctx context.Context, id, user string) error
	ResolveIncident(ctx context.Context, id, user string) error
	CloseIncident(ctx context.Context, id, user string) error
	CheckPermissions(pluginName string, user *authContext.User, action string) error
}

type instance struct {
	name                   string
	permissionsEnabled     bool
	alertClient            *alert.Client
	incidentClient         *incident.Client
	extendedIncidentClient *extendedIncident.Client
}

// GetName returns the name of the current Opsgenie instance.
func (i *instance) GetName() string {
	return i.name
}

// GetAlerts returns a list of Opsgenie alerts for the given query.
func (i *instance) GetAlerts(ctx context.Context, query string) ([]alert.Alert, error) {
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
func (i *instance) GetAlertDetails(ctx context.Context, id string) (*alert.GetAlertResult, error) {
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
func (i *instance) GetAlertLogs(ctx context.Context, id string) ([]alert.AlertLog, error) {
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
func (i *instance) GetAlertNotes(ctx context.Context, id string) ([]alert.AlertNote, error) {
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
func (i *instance) GetIncidents(ctx context.Context, query string) ([]incident.Incident, error) {
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
func (i *instance) GetIncidentLogs(ctx context.Context, id string) ([]incident.LogResult, error) {
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
func (i *instance) GetIncidentNotes(ctx context.Context, id string) ([]incident.NoteResult, error) {
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
func (i *instance) GetIncidentTimeline(ctx context.Context, id string) ([]extendedIncident.Entry, error) {
	res, err := i.extendedIncidentClient.GetTimeline(ctx, id)
	if err != nil {
		return nil, err
	}

	return res, nil
}

// AcknowledgeAlert acknowledges an alert.
func (i *instance) AcknowledgeAlert(ctx context.Context, id, user string) error {
	_, err := i.alertClient.Acknowledge(ctx, &alert.AcknowledgeAlertRequest{
		IdentifierType:  alert.ALERTID,
		IdentifierValue: id,
		User:            user,
	})

	return err
}

// SnoozeAlert snoozes an alert.
func (i *instance) SnoozeAlert(ctx context.Context, id, user string, duration time.Duration) error {
	_, err := i.alertClient.Snooze(ctx, &alert.SnoozeAlertRequest{
		IdentifierType:  alert.ALERTID,
		IdentifierValue: id,
		EndTime:         time.Now().Add(duration),
		User:            user,
	})

	return err
}

// CloseAlert closes an alert.
func (i *instance) CloseAlert(ctx context.Context, id, user string) error {
	_, err := i.alertClient.Close(ctx, &alert.CloseAlertRequest{
		IdentifierType:  alert.ALERTID,
		IdentifierValue: id,
		User:            user,
	})

	return err
}

// ResolveIncident resolves an incident.
func (i *instance) ResolveIncident(ctx context.Context, id, user string) error {
	return i.extendedIncidentClient.Resolve(ctx, id, fmt.Sprintf("Incident was resolved by %s.", user))
}

// CloseIncident closes an incident.
func (i *instance) CloseIncident(ctx context.Context, id, user string) error {
	_, err := i.incidentClient.Close(ctx, &incident.CloseRequest{
		Id:         id,
		Identifier: incident.Id,
		Note:       fmt.Sprintf("Incident was closed by %s.", user),
	})

	return err
}

// New returns a new Elasticsearch instance for the given configuration.
func New(config Config) (Instance, error) {
	opsgenieConfig := &client.Config{
		ApiKey:         config.APIKey,
		OpsGenieAPIURL: client.ApiUrl(config.APIUrl),
	}
	opsgenieConfig.ConfigureLogLevel("error")

	alertClient, err := alert.NewClient(opsgenieConfig)
	if err != nil {
		return nil, err
	}

	incidentClient, err := incident.NewClient(opsgenieConfig)
	if err != nil {
		return nil, err
	}

	extendedIncidentClient, err := extendedIncident.NewClient(opsgenieConfig)
	if err != nil {
		return nil, err
	}

	return &instance{
		name:                   config.Name,
		permissionsEnabled:     config.PermissionsEnabled,
		alertClient:            alertClient,
		incidentClient:         incidentClient,
		extendedIncidentClient: extendedIncidentClient,
	}, nil
}
