package api

import (
	"github.com/kobsio/kobs/pkg/satellite/api/applications"
	"github.com/kobsio/kobs/pkg/satellite/api/clusters"
	"github.com/kobsio/kobs/pkg/satellite/api/dashboards"
	"github.com/kobsio/kobs/pkg/satellite/api/resources"
	"github.com/kobsio/kobs/pkg/satellite/api/teams"
	"github.com/kobsio/kobs/pkg/satellite/api/users"
)

type Config struct {
	Clusters     clusters.Config     `json:"clusters"`
	Resources    resources.Config    `json:"resources"`
	Applications applications.Config `json:"applications"`
	Dashboards   dashboards.Config   `json:"dashboards"`
	Teams        teams.Config        `json:"teams"`
	Users        users.Config        `json:"users"`
}
