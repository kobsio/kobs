package settings

import (
	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
)

type Settings struct {
	DefaultNavigation []userv1.Navigation     `json:"defaultNavigation"`
	DefaultDashboards []dashboardv1.Reference `json:"defaultDashboards"`
}

func (s *Settings) GetNavigation(user *userv1.UserSpec) []userv1.Navigation {
	if user != nil && len(user.Navigation) > 0 {
		return user.Navigation
	}
	return s.DefaultNavigation
}

func (s *Settings) GetDashboards(user *userv1.UserSpec) []dashboardv1.Reference {
	if user != nil && len(user.Dashboards) > 0 {
		return user.Dashboards
	}
	return s.DefaultDashboards
}
