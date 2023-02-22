package applications

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
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
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

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

	t.Run("should handle error from db client", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("could not get applications"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get applications"]}`)
	})

	t.Run("should return all applications", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]applicationv1.ApplicationSpec{
			{
				Name:      "foo",
				Namespace: "bar",
			},
		}, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications?all=true&limit=10&offset=0", nil)

		w := httptest.NewRecorder()
		router.getApplications(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[{"name":"foo", "namespace":"bar", "topology": {}}]`)
	})
}

func TestGetApplicationsCount(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("should fail when user is not authorized to view all applications", func(t *testing.T) {
		_, router := newRouter(t)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/count?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplicationsCount(w, req)

		utils.AssertStatusEq(t, w, http.StatusForbidden)
		utils.AssertJSONEq(t, w, `{"errors": ["You are not allowed to view all applications"]}`)
	})

	t.Run("should handle error from db client", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilterCount(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(0, fmt.Errorf("could not get count"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/count?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplicationsCount(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get applications count"]}`)

	})

	t.Run("should return count", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilterCount(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(100, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/count?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplicationsCount(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"count": 100}`)
	})
}

func TestGetTags(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

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
		utils.AssertJSONEq(t, w, `[{"id":"foo", "tag":"some tag", "updatedAt":0}]`)
	})
}

func TestGetApplication(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

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
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

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
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("could not get applications"))

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
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)
		dbClient.EXPECT().GetApplicationsByFilterCount(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(0, fmt.Errorf("could not get applications count"))

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
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]applicationv1.ApplicationSpec{application}, nil)
		dbClient.EXPECT().GetApplicationsByFilterCount(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(20, nil)

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

func TestMount(t *testing.T) {
	router := Mount(nil)
	require.NotNil(t, router)
}
