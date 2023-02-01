package applications

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/kobsio/kobs/pkg/client/api/testutil"
	applicationv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/application/v1"
	userv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/user/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/stretchr/testify/require"

	"github.com/go-chi/chi/v5"
	"go.opentelemetry.io/otel"
)

func TestGetApplications(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("parse limit fails", func(t *testing.T) {
		_, router := newRouter(t)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications", nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		testutil.AssertStatusEq(t, http.StatusBadRequest, w)
		testutil.AssertJSONEq(t, `{"error": "could not parse limit parameter"}`, w)
	})

	t.Run("parse offset fails", func(t *testing.T) {
		_, router := newRouter(t)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications?limit=10", nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		testutil.AssertStatusEq(t, http.StatusBadRequest, w)
		testutil.AssertJSONEq(t, `{"error": "could not parse offset parameter"}`, w)
	})

	t.Run("get all applications fails, because user is not authorized to view all applications", func(t *testing.T) {
		_, router := newRouter(t)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		testutil.AssertStatusEq(t, http.StatusForbidden, w)
		testutil.AssertJSONEq(t, `{"error": "you are not allowed to view all applications"}`, w)
	})

	t.Run("get all applications fails", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("could not get applications"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplications(w, req)

		testutil.AssertStatusEq(t, http.StatusInternalServerError, w)
		testutil.AssertJSONEq(t, `{"error": "could not get applications"}`, w)
	})

	t.Run("get all applications", func(t *testing.T) {
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

		testutil.AssertStatusEq(t, http.StatusOK, w)
		testutil.AssertJSONEq(t, `[{"name":"foo", "namespace":"bar", "topology": {}}]`, w)
	})
}

func TestGetApplicationsCount(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("get all applications fails, because user is not authorized to view all applications", func(t *testing.T) {
		_, router := newRouter(t)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/count?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplicationsCount(w, req)

		testutil.AssertStatusEq(t, http.StatusForbidden, w)
		testutil.AssertJSONEq(t, `{"error": "you are not allowed to view all applications"}`, w)
	})

	t.Run("get all applications fails", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilterCount(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(0, fmt.Errorf("could not get count"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/count?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplicationsCount(w, req)

		testutil.AssertStatusEq(t, http.StatusInternalServerError, w)
		testutil.AssertJSONEq(t, `{"error": "could not get applications count"}`, w)

	})
	t.Run("count all applications", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilterCount(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(100, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/count?all=true&limit=10&offset=0", nil)
		w := httptest.NewRecorder()

		router.getApplicationsCount(w, req)

		testutil.AssertStatusEq(t, http.StatusOK, w)
		testutil.AssertJSONEq(t, `{"count": 100}`, w)
	})
}

func TestGetTags(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

		return dbClient, router
	}
	t.Run("get tags fails", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetTags(gomock.Any()).Return(nil, fmt.Errorf("could not get tags"))

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/tags", nil)
		w := httptest.NewRecorder()

		router.getTags(w, req)

		testutil.AssertStatusEq(t, http.StatusInternalServerError, w)
		testutil.AssertJSONEq(t, `{"error": "could not get tags"}`, w)
	})

	t.Run("get tags", func(t *testing.T) {
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

		testutil.AssertStatusEq(t, http.StatusOK, w)
		testutil.AssertJSONEq(t, `[{"id":"foo", "tag":"some tag", "updatedAt":0}]`, w)
	})
}

func TestGetApplication(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("get application fails", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), "id1").Return(nil, fmt.Errorf("could not get application"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications/application?id=id1", nil)
		w := httptest.NewRecorder()
		router.getApplication(w, req)

		testutil.AssertStatusEq(t, http.StatusInternalServerError, w)
		testutil.AssertJSONEq(t, `{"error": "could not get application"}`, w)
	})
	t.Run("application not found", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), "id1").Return(nil, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications/application?id=id1", nil)
		w := httptest.NewRecorder()
		router.getApplication(w, req)

		testutil.AssertStatusEq(t, http.StatusNotFound, w)
		testutil.AssertJSONEq(t, `{"error": "application was not found"}`, w)
	})
	t.Run("user does not have permissions to view application", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), "id1").Return(&applicationv1.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1"}, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications/application?id=id1", nil)
		w := httptest.NewRecorder()
		router.getApplication(w, req)

		testutil.AssertStatusEq(t, http.StatusForbidden, w)
		testutil.AssertJSONEq(t, `{"error": "you are not allowed to view the application"}`, w)
	})
	t.Run("can get application", func(t *testing.T) {
		application := &applicationv1.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Teams: []string{"myteam"}}
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), "id1").Return(application, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Teams: []string{"myteam"}, Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/applications/application?id=id1", nil)
		w := httptest.NewRecorder()
		router.getApplication(w, req)

		testutil.AssertStatusEq(t, http.StatusOK, w)
		testutil.AssertJSONEq(t,
			fmt.Sprintf(`{
				"cluster": "%s",
				"namespace": "%s",
				"topology": {},
				"teams": ["%s"]
			}`, application.Cluster, application.Namespace, application.Teams[0]), w)
	})
}

func TestGetApplicationsByTeam(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("parse limit fails", func(t *testing.T) {
		_, router := newRouter(t)
		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team", nil)
		w := httptest.NewRecorder()
		router.getApplicationsByTeam(w, req)

		testutil.AssertStatusEq(t, http.StatusBadRequest, w)
		testutil.AssertJSONEq(t, `{"error": "could not parse limit parameter"}`, w)
	})

	t.Run("parse offset fails", func(t *testing.T) {
		_, router := newRouter(t)
		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team?limit=10", nil)
		w := httptest.NewRecorder()
		router.getApplicationsByTeam(w, req)

		testutil.AssertStatusEq(t, http.StatusBadRequest, w)
		testutil.AssertJSONEq(t, `{"error": "could not parse offset parameter"}`, w)
	})

	t.Run("get team applications fails, because user is not authorized", func(t *testing.T) {
		_, router := newRouter(t)
		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team?team=team1&limit=10&offset=0", nil)
		w := httptest.NewRecorder()
		router.getApplicationsByTeam(w, req)

		testutil.AssertStatusEq(t, http.StatusForbidden, w)
		testutil.AssertJSONEq(t, `{"error": "you are not allowed to view the applications of this team"}`, w)
	})

	t.Run("get team applications fails", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("could not get applications"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team?team=team1&limit=10&offset=0", nil)
		w := httptest.NewRecorder()
		router.getApplicationsByTeam(w, req)

		testutil.AssertStatusEq(t, http.StatusInternalServerError, w)
		testutil.AssertJSONEq(t, `{"error": "could not get applications"}`, w)
	})

	t.Run("get all applications count fails", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)
		dbClient.EXPECT().GetApplicationsByFilterCount(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(0, fmt.Errorf("could not get applications count"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/team?team=team1&limit=10&offset=0", nil)
		w := httptest.NewRecorder()
		router.getApplicationsByTeam(w, req)

		testutil.AssertStatusEq(t, http.StatusInternalServerError, w)
		testutil.AssertJSONEq(t, `{"error": "could not get applications count"}`, w)
	})
	t.Run("can get all applications", func(t *testing.T) {
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

		testutil.AssertStatusEq(t, http.StatusOK, w)
		testutil.AssertJSONEq(t, fmt.Sprintf(`{
				"count": 20,
				"applications": [{
					"cluster": "%s",
					"namespace": "%s",
					"topology": {},
					"teams": ["%s"]
				}]
			}`, application.Cluster, application.Namespace, application.Teams[0]), w)
	})
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil)
	require.NotNil(t, router)
}
