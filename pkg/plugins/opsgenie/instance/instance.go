package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"context"
	"fmt"
	"net/http"
	"time"

	extendedIncident "github.com/kobsio/kobs/pkg/plugins/opsgenie/instance/incident"
	"github.com/kobsio/kobs/pkg/utils/middleware/roundtripper"

	"github.com/mitchellh/mapstructure"
	"github.com/opsgenie/opsgenie-go-sdk-v2/alert"
	"github.com/opsgenie/opsgenie-go-sdk-v2/client"
	"github.com/opsgenie/opsgenie-go-sdk-v2/incident"
)

// Config is the structure of the configuration for a single Opsgenie instance. The user can set some general
// information like the name and descriptions of the Opsgenie instance. The user must also set the api key and api url
// to authenticate against the Opsgenie api. The url field can be used to set the public url of the Opsgenie instance,
// so that users can go from the kobs ui to the Opsgenie ui.
type Config struct {
	APIKey string `json:"apiKey"`
	APIUrl string `json:"apiUrl"`
}

// Instance is the interface, which must be implemented by an Opsgenie instance. It contains all the functions to
// interact with the Opsgenie API.
type Instance interface {
	GetName() string
	GetAlerts(ctx context.Context, query string) (*alert.ListAlertResult, error)
	GetAlertDetails(ctx context.Context, id string) (*alert.GetAlertResult, error)
	GetAlertLogs(ctx context.Context, id string) (*alert.ListAlertLogsResult, error)
	GetAlertNotes(ctx context.Context, id string) (*alert.ListAlertNotesResult, error)
	GetIncidents(ctx context.Context, query string) (*incident.ListResult, error)
	GetIncidentLogs(ctx context.Context, id string) (*incident.ListLogsResult, error)
	GetIncidentNotes(ctx context.Context, id string) (*incident.ListNotesResult, error)
	GetIncidentTimeline(ctx context.Context, id string) ([]extendedIncident.Entry, error)
	AcknowledgeAlert(ctx context.Context, id, user string) error
	SnoozeAlert(ctx context.Context, id, user string, duration time.Duration) error
	CloseAlert(ctx context.Context, id, user string) error
	ResolveIncident(ctx context.Context, id, user string) error
	CloseIncident(ctx context.Context, id, user string) error
}

type instance struct {
	name                   string
	alertClient            *alert.Client
	incidentClient         *incident.Client
	extendedIncidentClient *extendedIncident.Client
}

// GetName returns the name of the current Opsgenie instance.
func (i *instance) GetName() string {
	return i.name
}

// GetAlerts returns a list of Opsgenie alerts for the given query.
func (i *instance) GetAlerts(ctx context.Context, query string) (*alert.ListAlertResult, error) {
	return i.alertClient.List(ctx, &alert.ListAlertRequest{
		Limit: 100,
		Query: query,
		Order: alert.Desc,
		Sort:  alert.CreatedAt,
	})
}

// GetAlertDetails returns the details for single alert.
func (i *instance) GetAlertDetails(ctx context.Context, id string) (*alert.GetAlertResult, error) {
	return i.alertClient.Get(ctx, &alert.GetAlertRequest{
		IdentifierType:  alert.ALERTID,
		IdentifierValue: id,
	})
}

// GetAlertLogs returns the logs for single alert.
func (i *instance) GetAlertLogs(ctx context.Context, id string) (*alert.ListAlertLogsResult, error) {
	return i.alertClient.ListAlertLogs(ctx, &alert.ListAlertLogsRequest{
		IdentifierType:  alert.ALERTID,
		IdentifierValue: id,
	})
}

// GetAlertNotes returns the notes for single alert.
func (i *instance) GetAlertNotes(ctx context.Context, id string) (*alert.ListAlertNotesResult, error) {
	return i.alertClient.ListAlertNotes(ctx, &alert.ListAlertNotesRequest{
		IdentifierType:  alert.ALERTID,
		IdentifierValue: id,
	})
}

// GetIncidents returns a list of Opsgenie incidents for the given query.
func (i *instance) GetIncidents(ctx context.Context, query string) (*incident.ListResult, error) {
	return i.incidentClient.List(ctx, &incident.ListRequest{
		Limit: 100,
		Query: query,
		Order: incident.Desc,
		Sort:  incident.CreatedAt,
	})
}

// GetIncidentLogs returns the logs for single incident.
func (i *instance) GetIncidentLogs(ctx context.Context, id string) (*incident.ListLogsResult, error) {
	return i.incidentClient.ListLogs(ctx, &incident.ListLogsRequest{
		Identifier: incident.Id,
		Id:         id,
	})
}

// GetIncidentNotes returns the notes for single incident.
func (i *instance) GetIncidentNotes(ctx context.Context, id string) (*incident.ListNotesResult, error) {
	return i.incidentClient.ListNotes(ctx, &incident.ListNotesRequest{
		Identifier: incident.Id,
		Id:         id,
	})
}

// GetIncidentTimeline returns the timeline for single incident.
func (i *instance) GetIncidentTimeline(ctx context.Context, id string) ([]extendedIncident.Entry, error) {
	return i.extendedIncidentClient.GetTimeline(ctx, id)
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
	_, err := i.incidentClient.Resolve(ctx, &incident.ResolveRequest{
		Id:   id,
		Note: fmt.Sprintf("Incident was resolved by %s.", user),
	})

	return err
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
func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	opsgenieConfig := &client.Config{
		ApiKey:         config.APIKey,
		OpsGenieAPIURL: client.ApiUrl(config.APIUrl),
		HttpClient: &http.Client{
			Transport: roundtripper.DefaultRoundTripper,
		},
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
		name:                   name,
		alertClient:            alertClient,
		incidentClient:         incidentClient,
		extendedIncidentClient: extendedIncidentClient,
	}, nil
}
