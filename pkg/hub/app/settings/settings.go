package settings

import (
	"encoding/base64"
	"encoding/json"
	"fmt"

	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
)

type Settings struct {
	DefaultNavigation []userv1.Navigation     `json:"defaultNavigation"`
	DefaultDashboards []dashboardv1.Reference `json:"defaultDashboards"`
	Integrations      Integrations            `json:"integrations"`
}

type Integrations struct {
	ResourcesIntegrations ResourcesIntegrations `json:"resources"`
}

type ResourcesIntegrations struct {
	Dashboards []Dashboard `json:"dashboards"`
}

type Dashboard struct {
	Resource  string                `json:"resource"`
	Labels    map[string]string     `json:"labels"`
	Dashboard dashboardv1.Reference `json:"dashboard"`
}

// convertNavigation converts the page in a navigation item to a link and removes the page property from the object, so
// that the we can just use the link in the frontend. The page must be stringified and base64 encoded for the frontend.
func convertNavigation(navigation []userv1.Navigation) []userv1.Navigation {
	for i := 0; i < len(navigation); i++ {
		for j := 0; j < len(navigation[i].Items); j++ {
			if navigation[i].Items[j].Page != nil {
				page, err := json.Marshal(navigation[i].Items[j].Page)
				if err == nil {
					navigation[i].Items[j].Link = fmt.Sprintf("/dashboards/%s", base64.StdEncoding.EncodeToString(page))
					navigation[i].Items[j].Page = nil
				}
			}

			for k := 0; k < len(navigation[i].Items[j].Items); k++ {
				page, err := json.Marshal(navigation[i].Items[j].Items[k].Page)
				if err == nil {
					navigation[i].Items[j].Items[k].Link = fmt.Sprintf("/dashboards/%s", base64.StdEncoding.EncodeToString(page))
					navigation[i].Items[j].Items[k].Page = nil
				}
			}
		}
	}

	return navigation
}

// GetNavigation returns the navigation for the current user. If the provided user contains a navigation the users
// navigation is returned. If the user doesn't contain a navigation the default navigation is returned.
func (s *Settings) GetNavigation(user *userv1.UserSpec) []userv1.Navigation {
	if user != nil && len(user.Navigation) > 0 {
		return convertNavigation(user.Navigation)
	}
	return convertNavigation(s.DefaultNavigation)
}

// GetDashboards returns the dashboards for the current user. If the provided user contains dashboards the users
// dashboards are returned. If the user doesn't contain dashboards the default dashboards are returned.
func (s *Settings) GetDashboards(user *userv1.UserSpec) []dashboardv1.Reference {
	if user != nil && len(user.Dashboards) > 0 {
		return user.Dashboards
	}
	return s.DefaultDashboards
}

func (s *Settings) GetDashboardsFromResourcesIntegrations(resource string) []Dashboard {
	var dashboards []Dashboard

	for _, dashboard := range s.Integrations.ResourcesIntegrations.Dashboards {
		if dashboard.Resource == resource {
			dashboards = append(dashboards, dashboard)
		}
	}

	return dashboards
}
