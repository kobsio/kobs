package applications

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	"github.com/kobsio/kobs/pkg/hub/app/settings"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
)

func TestGetApplications(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), settings.Settings{}, dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("should fail for invalid limit", func(t *testing.T) {
		_, router := newRouter(t)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications", nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse 'limit' parameter"]}`)
	})

	t.Run("should fail for invalid offset", func(t *testing.T) {
		_, router := newRouter(t)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications?limit=10", nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse 'offset' parameter"]}`)
	})

	t.Run("should fail when user is not authorized to view all applications", func(t *testing.T) {
		_, router := newRouter(t)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		utils.AssertStatusEq(t, w, http.StatusForbidden)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to view all applications"]}`)
	})

	t.Run("should handle error from db client for applications", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("could not get applications"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get applications"]}`)
	})

	t.Run("should handle error from db client for count", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]applicationv1.ApplicationSpec{
			{
				Name:      "foo",
				Namespace: "bar",
			},
		}, nil)
		dbClient.EXPECT().GetApplicationsByFilterCount(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(0, fmt.Errorf("could not get applications count"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get applications count"]}`)
	})

	t.Run("should return all applications", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]applicationv1.ApplicationSpec{
			{
				Name:      "foo",
				Namespace: "bar",
			},
		}, nil)
		dbClient.EXPECT().GetApplicationsByFilterCount(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(1, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications?all=true&limit=10&offset=0", nil)

		w := httptest.NewRecorder()
		router.getApplications(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"applications": [{"name":"foo", "namespace":"bar", "topology": {}}], "count": 1}`)
	})
}

func TestGetTags(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), settings.Settings{}, dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("should handle error from db client", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetTags(gomock.Any()).Return(nil, fmt.Errorf("could not get tags"))

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/tags", nil)
		w := httptest.NewRecorder()

		router.getTags(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get tags"]}`)
	})

	t.Run("should return tags", func(t *testing.T) {
		dbClient, router := newRouter(t)
		tags := []db.Tag{{
			ID:        "foo",
			Tag:       "some tag",
			UpdatedAt: 0,
		}}

		dbClient.EXPECT().GetTags(gomock.Any()).Return(tags, nil)

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/tags", nil)
		w := httptest.NewRecorder()

		router.getTags(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `["some tag"]`)
	})
}

func TestGetApplication(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), settings.Settings{}, dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("should handle error from db client", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), "id1").Return(nil, fmt.Errorf("could not get application"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications/application?id=id1", nil)
		w := httptest.NewRecorder()
		router.getApplication(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get application"]}`)
	})

	t.Run("should return error when application was not found", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), "id1").Return(nil, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications/application?id=id1", nil)
		w := httptest.NewRecorder()
		router.getApplication(w, req)

		utils.AssertStatusEq(t, w, http.StatusNotFound)
		utils.AssertJSONEq(t, w, `{"errors": ["Application was not found"]}`)
	})

	t.Run("should return error when user does not have the permissions to view an application", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), "id1").Return(&applicationv1.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1"}, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications/application?id=id1", nil)
		w := httptest.NewRecorder()
		router.getApplication(w, req)

		utils.AssertStatusEq(t, w, http.StatusForbidden)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to view the application"]}`)
	})

	t.Run("should return application", func(t *testing.T) {
		application := &applicationv1.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Teams: []string{"myteam"}}
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), "id1").Return(application, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Teams: []string{"myteam"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications/application?id=id1", nil)
		w := httptest.NewRecorder()
		router.getApplication(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w,
			fmt.Sprintf(`{
				"cluster": "%s",
				"namespace": "%s",
				"topology": {},
				"teams": ["%s"]
			}`, application.Cluster, application.Namespace, application.Teams[0]),
		)
	})
}

func TestGetApplicationsByTeam(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), settings.Settings{}, dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("should fail for invalid limit", func(t *testing.T) {
		_, router := newRouter(t)
		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team", nil)
		w := httptest.NewRecorder()
		router.getApplicationsByTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse 'limit' parameter"]}`)
	})

	t.Run("should fail for invalid offset", func(t *testing.T) {
		_, router := newRouter(t)
		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team?limit=10", nil)
		w := httptest.NewRecorder()
		router.getApplicationsByTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse 'offset' parameter"]}`)
	})

	t.Run("should fail when user is not authorized to view applications for a team", func(t *testing.T) {
		_, router := newRouter(t)
		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team?team=team1&limit=10&offset=0", nil)
		w := httptest.NewRecorder()
		router.getApplicationsByTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusForbidden)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to view the applications of this team"]}`)
	})

	t.Run("should handle error from db client", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("could not get applications"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team?team=team1&limit=10&offset=0", nil)
		w := httptest.NewRecorder()
		router.getApplicationsByTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get applications"]}`)
	})

	t.Run("should handle error from db client for applications count", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)
		dbClient.EXPECT().GetApplicationsByFilterCount(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(0, fmt.Errorf("could not get applications count"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team?team=team1&limit=10&offset=0", nil)
		w := httptest.NewRecorder()
		router.getApplicationsByTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get applications count"]}`)
	})

	t.Run("should return applications", func(t *testing.T) {
		dbClient, router := newRouter(t)
		application := applicationv1.ApplicationSpec{
			Cluster:   "cluster1",
			Namespace: "namespace1",
			Teams:     []string{"team1"},
		}
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]applicationv1.ApplicationSpec{application}, nil)
		dbClient.EXPECT().GetApplicationsByFilterCount(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(20, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team?team=team1&limit=10&offset=0", nil)
		w := httptest.NewRecorder()
		router.getApplicationsByTeam(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, fmt.Sprintf(`{
				"count": 20,
				"applications": [{
					"cluster": "%s",
					"namespace": "%s",
					"topology": {},
					"teams": ["%s"]
				}]
			}`, application.Cluster, application.Namespace, application.Teams[0]),
		)
	})
}

func TestSaveApplication(t *testing.T) {
	var newRouter = func(t *testing.T, saveEnabled bool) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), settings.Settings{Save: struct {
			Enabled bool `json:"enabled"`
		}{Enabled: saveEnabled}}, dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("should return error when save is disabled", func(t *testing.T) {
		_, router := newRouter(t, false)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/application", nil)
		w := httptest.NewRecorder()
		router.saveApplication(w, req)

		utils.AssertStatusEq(t, w, http.StatusMethodNotAllowed)
		utils.AssertJSONEq(t, w, `{"errors": ["Save is disabled"]}`)
	})

	t.Run("should return error for invalid request body", func(t *testing.T) {
		_, router := newRouter(t, true)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/application", strings.NewReader(`[]`))
		w := httptest.NewRecorder()
		router.saveApplication(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to decode request body"]}`)
	})

	t.Run("should return error for invalid application", func(t *testing.T) {
		_, router := newRouter(t, true)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/application", strings.NewReader(`{"id": "/cluster/test/namespace/test/name/test", "cluster": "test", "namespace": "default", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveApplication(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid application data"]}`)
	})

	t.Run("should return error when user is not authorized to edit the application", func(t *testing.T) {
		_, router := newRouter(t, true)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/application", strings.NewReader(`{"id": "/cluster/test/namespace/test/name/test", "cluster": "test", "namespace": "test", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveApplication(w, req)

		utils.AssertStatusEq(t, w, http.StatusForbidden)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to edit the application"]}`)
	})

	t.Run("should return error on db error", func(t *testing.T) {
		dbClient, router := newRouter(t, true)
		dbClient.EXPECT().SaveApplication(gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/application", strings.NewReader(`{"id": "/cluster/test/namespace/test/name/test", "cluster": "test", "namespace": "test", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveApplication(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to save application"]}`)
	})

	t.Run("should save application", func(t *testing.T) {
		dbClient, router := newRouter(t, true)
		dbClient.EXPECT().SaveApplication(gomock.Any(), gomock.Any()).Return(nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/application", strings.NewReader(`{"id": "/cluster/test/namespace/test/name/test", "cluster": "test", "namespace": "test", "name": "test"}`))
		w := httptest.NewRecorder()
		router.saveApplication(w, req)

		utils.AssertStatusEq(t, w, http.StatusNoContent)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetApplicationGroups(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), settings.Settings{}, dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("should handle authorization error", func(t *testing.T) {
		_, router := newRouter(t)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Teams: []string{"team1"}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/groups?team=team1&group=group1&group=group2", nil)
		w := httptest.NewRecorder()
		router.getApplicationGroups(w, req)

		utils.AssertStatusEq(t, w, http.StatusForbidden)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to view the application groups"]}`)
	})

	t.Run("should handle error from db client", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByGroup(gomock.Any(), []string{"team1"}, []string{"group1", "group2"}).Return(nil, fmt.Errorf("could not get groups"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Teams: []string{"team1"}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/groups?group=group1&group=group2", nil)
		w := httptest.NewRecorder()
		router.getApplicationGroups(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get application groups"]}`)
	})

	t.Run("should return application groups", func(t *testing.T) {
		dbClient, router := newRouter(t)
		applicationsGroups := []db.ApplicationGroup{{
			ID: db.ApplicationGroupID{
				Name:      "name1",
				Namespace: "namespace1",
			},
			Clusters: []string{"cluster1", "cluster2"},
		}}
		dbClient.EXPECT().GetApplicationsByGroup(gomock.Any(), []string{"team1"}, []string{"group1", "group2"}).Return(applicationsGroups, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Teams: []string{"team1"}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/groups?group=group1&group=group2", nil)
		w := httptest.NewRecorder()
		router.getApplicationGroups(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[{
			"id": {
				"namespace": "namespace1",
				"name": "name1"
			},
			"clusters": ["cluster1", "cluster2"],
			"description": "",
			"topology": {}
		}]`)
	})
}

func TestMount(t *testing.T) {
	router := Mount(settings.Settings{}, nil)
	require.NotNil(t, router)
}
