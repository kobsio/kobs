package api

import (
	"github.com/kobsio/kobs/pkg/hub/api/applications"
	"github.com/kobsio/kobs/pkg/hub/api/clusters"
	"github.com/kobsio/kobs/pkg/hub/api/dashboards"
	"github.com/kobsio/kobs/pkg/hub/api/navigation"
	"github.com/kobsio/kobs/pkg/hub/api/notifications"
	"github.com/kobsio/kobs/pkg/hub/api/plugins"
	"github.com/kobsio/kobs/pkg/hub/api/resources"
	"github.com/kobsio/kobs/pkg/hub/api/teams"
	"github.com/kobsio/kobs/pkg/hub/api/users"
)

type Config struct {
	Applications  applications.Config  `json:"applications"`
	Clusters      clusters.Config      `json:"clusters"`
	Dashboards    dashboards.Config    `json:"dashboards"`
	Navigation    navigation.Config    `json:"navigation"`
	Notifications notifications.Config `json:"notifications"`
	Plugins       plugins.Config       `json:"plugins"`
	Resources     resources.Config     `json:"resources"`
	Teams         teams.Config         `json:"teams"`
	Users         users.Config         `json:"users"`
}
