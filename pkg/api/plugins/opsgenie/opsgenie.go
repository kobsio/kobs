package opsgenie

import (
	"context"
	"fmt"

	opsgenieProto "github.com/kobsio/kobs/pkg/api/plugins/opsgenie/proto"
	pluginsProto "github.com/kobsio/kobs/pkg/api/plugins/plugins/proto"

	"github.com/opsgenie/opsgenie-go-sdk-v2/alert"
	"github.com/opsgenie/opsgenie-go-sdk-v2/client"
	"github.com/opsgenie/opsgenie-go-sdk-v2/team"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "opsgenie"})
)

// Config is the configuration for an Opsgenie instance. It contains a name, description and an API Key and URL for the
// Opsgenie API.
type Config struct {
	Name        string `yaml:"name"`
	Description string `yaml:"description"`
	ApiKey      string `yaml:"apiKey"`
	ApiUrl      string `yaml:"apiUrl"`
}

type Opsgenie struct {
	opsgenieProto.UnimplementedOpsgenieServer
	instances []*Instance
}

type Instance struct {
	name        string
	alertClient *alert.Client
	teamClient  *team.Client
}

func (o *Opsgenie) getInstance(name string) *Instance {
	for _, i := range o.instances {
		if i.name == name {
			return i
		}
	}

	return nil
}

// GetAlerts implements the GetAlerts function for the Opsgenie gRPC service. It returns a list of alert for the given
// query. Currently the list of results is limited to 100 alerts (Opsgenie API limit). Maybe we can implement a
// pageination logic later by using the offset parameter.
func (o *Opsgenie) GetAlerts(ctx context.Context, getAlertsRequest *opsgenieProto.GetAlertsRequest) (*opsgenieProto.GetAlertsResponse, error) {
	if getAlertsRequest == nil {
		return nil, fmt.Errorf("request data is missing")
	}

	instance := o.getInstance(getAlertsRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Opsgenie plugin")
	}

	res, err := instance.alertClient.List(ctx, &alert.ListAlertRequest{
		Limit: 100,
		Order: alert.Desc,
		Query: getAlertsRequest.Query,
		Sort:  alert.CreatedAt,
	})
	if err != nil {
		return nil, err
	}

	var alerts []*opsgenieProto.Alert
	for _, a := range res.Alerts {
		alerts = append(alerts, &opsgenieProto.Alert{
			Id:            a.Id,
			TinyId:        a.TinyID,
			Alias:         a.Alias,
			Message:       a.Message,
			Status:        a.Status,
			Acknowledged:  a.Acknowledged,
			IsSeen:        a.IsSeen,
			Tags:          a.Tags,
			Snoozed:       a.Snoozed,
			SnoozedUntil:  a.SnoozedUntil.Unix(),
			Count:         int64(a.Count),
			LastOccuredAt: a.LastOccurredAt.Unix(),
			CreatedAt:     a.CreatedAt.Unix(),
			UpdatedAt:     a.UpdatedAt.Unix(),
			Source:        a.Source,
			Owner:         a.Owner,
			Priority:      string(a.Priority),
		})
	}

	return &opsgenieProto.GetAlertsResponse{
		Alerts: alerts,
	}, nil
}

// GetAlert implements the GetAlert function of the Opsgenie gRPC service. It returns a single alert by it's id. When
// the alert was retrieved from the Opsgenie API, we also loop through the returned responders and add the names of the
// teams by using the team API of Opsgenie.
func (o *Opsgenie) GetAlert(ctx context.Context, getAlertRequest *opsgenieProto.GetAlertRequest) (*opsgenieProto.GetAlertResponse, error) {
	if getAlertRequest == nil {
		return nil, fmt.Errorf("request data is missing")
	}

	instance := o.getInstance(getAlertRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Opsgenie plugin")
	}

	res, err := instance.alertClient.Get(ctx, &alert.GetAlertRequest{
		IdentifierType:  alert.ALERTID,
		IdentifierValue: getAlertRequest.Id,
	})
	if err != nil {
		return nil, err
	}

	var responders []string

	for _, responder := range res.Responders {
		teamRes, err := instance.teamClient.Get(ctx, &team.GetTeamRequest{
			IdentifierType:  team.Id,
			IdentifierValue: responder.Id,
		})
		if err != nil {
			return nil, err
		}

		responders = append(responders, teamRes.Name)
	}

	return &opsgenieProto.GetAlertResponse{
		Alert: &opsgenieProto.Alert{
			Id:            res.Id,
			TinyId:        res.TinyId,
			Alias:         res.Alias,
			Message:       res.Message,
			Status:        res.Status,
			Acknowledged:  res.Acknowledged,
			IsSeen:        res.IsSeen,
			Tags:          res.Tags,
			Snoozed:       res.Snoozed,
			SnoozedUntil:  res.SnoozedUntil.Unix(),
			Count:         int64(res.Count),
			LastOccuredAt: res.LastOccurredAt.Unix(),
			CreatedAt:     res.CreatedAt.Unix(),
			UpdatedAt:     res.UpdatedAt.Unix(),
			Source:        res.Source,
			Owner:         res.Owner,
			Priority:      string(res.Priority),
			Responders:    responders,
			Description:   res.Description,
			Details:       res.Details,
		},
	}, nil
}

// Register is used to initialize the Opsgenie service and to register it at the given gRPC server.
func Register(cfg []Config, grpcServer *grpc.Server) ([]*pluginsProto.PluginShort, error) {
	log.Tracef("Register Opsgenie Plugin.")

	var pluginDetails []*pluginsProto.PluginShort
	var instances []*Instance

	for _, config := range cfg {
		alertClient, err := alert.NewClient(&client.Config{
			ApiKey:         config.ApiKey,
			OpsGenieAPIURL: client.ApiUrl(config.ApiUrl),
			Logger:         log.Logger,
		})
		if err != nil {
			return nil, err
		}

		teamClient, err := team.NewClient(&client.Config{
			ApiKey:         config.ApiKey,
			OpsGenieAPIURL: client.ApiUrl(config.ApiUrl),
			Logger:         log.Logger,
		})
		if err != nil {
			return nil, err
		}

		pluginDetails = append(pluginDetails, &pluginsProto.PluginShort{
			Name:        config.Name,
			Description: config.Description,
			Type:        "opsgenie",
		})
		instances = append(instances, &Instance{
			name:        config.Name,
			alertClient: alertClient,
			teamClient:  teamClient,
		})
	}

	opsgenieProto.RegisterOpsgenieServer(grpcServer, &Opsgenie{
		instances: instances,
	})

	return pluginDetails, nil
}
