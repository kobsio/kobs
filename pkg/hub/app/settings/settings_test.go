package settings

import (
	"testing"

	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"

	"github.com/stretchr/testify/require"
)

var settings = Settings{
	DefaultNavigation: []userv1.Navigation{{Name: "default"}},
	DefaultDashboards: []dashboardv1.Reference{{Title: "default"}},
}

func TestGetNavigation(t *testing.T) {
	t.Run("should return default navigation if user is nil", func(t *testing.T) {
		require.Equal(t, []userv1.Navigation{{Name: "default"}}, settings.GetNavigation(nil))
	})

	t.Run("should return default navigation if user navigation is empty", func(t *testing.T) {
		require.Equal(t, []userv1.Navigation{{Name: "default"}}, settings.GetNavigation(&userv1.UserSpec{Navigation: []userv1.Navigation{}}))
		require.Equal(t, []userv1.Navigation{{Name: "default"}}, settings.GetNavigation(&userv1.UserSpec{Navigation: nil}))
	})

	t.Run("should return user navigation", func(t *testing.T) {
		require.Equal(t, []userv1.Navigation{{Name: "user"}}, settings.GetNavigation(&userv1.UserSpec{Navigation: []userv1.Navigation{{Name: "user"}}}))
	})

	t.Run("should create link for page", func(t *testing.T) {
		require.Equal(t, []userv1.Navigation{{
			Name: "default",
			Items: []userv1.NavigationItem{{
				Link: "/dashboards/eyJ0aXRsZSI6IlBhZ2UgMSIsImRlc2NyaXB0aW9uIjoiRGVzY3JpcHRpb24gMSIsImRhc2hib2FyZHMiOlt7InRpdGxlIjoiVGl0bGUgMSJ9XX0=",
			}, {
				Items: []userv1.NavigationSubItems{{
					Name: "subdefault",
					Link: "/dashboards/eyJ0aXRsZSI6IlBhZ2UgMSIsImRlc2NyaXB0aW9uIjoiRGVzY3JpcHRpb24gMSIsImRhc2hib2FyZHMiOlt7InRpdGxlIjoiVGl0bGUgMSJ9XX0=",
				}},
			}},
		}}, settings.GetNavigation(&userv1.UserSpec{
			Navigation: []userv1.Navigation{{
				Name: "default",
				Items: []userv1.NavigationItem{{
					Page: &userv1.NavigationPage{
						Title:       "Page 1",
						Description: "Description 1",
						Dashboards:  []dashboardv1.Reference{{Title: "Title 1"}},
					},
				}, {
					Items: []userv1.NavigationSubItems{{
						Name: "subdefault",
						Page: &userv1.NavigationPage{
							Title:       "Page 1",
							Description: "Description 1",
							Dashboards:  []dashboardv1.Reference{{Title: "Title 1"}},
						},
					}},
				}},
			}},
		}))
	})
}

func TestGetDashboards(t *testing.T) {
	t.Run("should return default dashboards if user is nil", func(t *testing.T) {
		require.Equal(t, []dashboardv1.Reference{{Title: "default"}}, settings.GetDashboards(nil))
	})

	t.Run("should return default dashboards if user dashboards is empty", func(t *testing.T) {
		require.Equal(t, []dashboardv1.Reference{{Title: "default"}}, settings.GetDashboards(&userv1.UserSpec{Dashboards: []dashboardv1.Reference{}}))
		require.Equal(t, []dashboardv1.Reference{{Title: "default"}}, settings.GetDashboards(&userv1.UserSpec{Dashboards: nil}))
	})

	t.Run("should return user dashboards", func(t *testing.T) {
		require.Equal(t, []dashboardv1.Reference{{Title: "user"}}, settings.GetDashboards(&userv1.UserSpec{Dashboards: []dashboardv1.Reference{{Title: "user"}}}))
	})
}
