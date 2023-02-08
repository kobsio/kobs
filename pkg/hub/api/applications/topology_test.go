package applications

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/golang/mock/gomock"
	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"go.opentelemetry.io/otel"
)

func TestGetApplicationsTopology(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("handles users who have no access", func(t *testing.T) {
		_, router := newRouter(t)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/topology", nil)
		w := httptest.NewRecorder()

		router.getApplicationsTopology(w, req)

		utils.AssertStatusEq(t, http.StatusForbidden, w)
		utils.AssertJSONEq(t, `{"error": "you are not allowed to view all applications"}`, w)
	})

	t.Run("handles error in GetApplicationsByFilter", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("get applications by filter failed"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Teams: []string{"team@test.test"}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/topology?all=false", nil)
		w := httptest.NewRecorder()

		router.getApplicationsTopology(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error": "could not get applications"}`, w)
	})

	t.Run("handles error in GetTopologyByIDs (SourceID)", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)
		dbClient.EXPECT().GetTopologyByIDs(gomock.Any(), "SourceID", gomock.Any()).Return(nil, fmt.Errorf("get topology by ids failed for SourceID"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Teams: []string{"team@test.test"}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/topology?all=false", nil)
		w := httptest.NewRecorder()

		router.getApplicationsTopology(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error": "could not get source topology"}`, w)
	})

	t.Run("handles error in GetTopologyByIDs (TargetID)", func(t *testing.T) {
		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)
		dbClient.EXPECT().GetTopologyByIDs(gomock.Any(), "SourceID", gomock.Any()).Return(nil, nil)
		dbClient.EXPECT().GetTopologyByIDs(gomock.Any(), "TargetID", gomock.Any()).Return(nil, fmt.Errorf("get topology by ids failed for TargetID"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Teams: []string{"team@test.test"}})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/topology?all=false", nil)
		w := httptest.NewRecorder()

		router.getApplicationsTopology(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error": "could not get target topology"}`, w)
	})

	t.Run("can get Applications Topology", func(t *testing.T) {
		all := false
		clusterIDs := []string{"cluster1"}
		namespaceIDs := []string{"namespace1"}
		tags := []string{"mytag"}
		searchTerm := "searchterm"
		external := "false"
		teams := []string{"hello@test.test"}
		application := applicationv1.ApplicationSpec{ID: "applicationID"}

		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationsByFilter(gomock.Any(), teams, clusterIDs, namespaceIDs, tags, searchTerm, "false", 0, 0).Return([]applicationv1.ApplicationSpec{application}, nil)

		sourceTopology := []db.Topology{
			{
				SourceID:            "source ID",
				SourceName:          "source Name",
				SourceNamespace:     "source Namespace",
				SourceCluster:       "source Cluster",
				TopologyExternal:    true,
				TopologyDescription: "topology description",
				TargetID:            "target ID",
				TargetName:          "target Name",
				TargetNamespace:     "target Namespace",
				TargetCluster:       "target Cluster",
			},
		}
		dbClient.EXPECT().GetTopologyByIDs(gomock.Any(), "SourceID", []string{application.ID}).Return(sourceTopology, nil)
		targetTopology := []db.Topology{
			{
				SourceID:        "target ID",
				SourceNamespace: "target Namespace",
				SourceCluster:   "target Cluster",
				TargetID:        "source ID",
			},
		}
		dbClient.EXPECT().GetTopologyByIDs(gomock.Any(), "TargetID", []string{application.ID}).Return(targetTopology, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{Teams: teams})
		path := fmt.Sprintf(
			"/topology?all=%t&clusterID=%s&namespaceID=%s&tag=%s&searchTerm=%s&external=%s",
			all,
			strings.Join(clusterIDs, ","),
			strings.Join(namespaceIDs, ","),
			strings.Join(tags, ","),
			searchTerm,
			external,
		)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, path, nil)
		w := httptest.NewRecorder()

		router.getApplicationsTopology(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `{
			"edges": [
					{
							"data": {
									"id": "",
									"source": "source ID",
									"target": "target ID",
									"description": "topology description"
							}
					}
			],
			"nodes": [
					{
							"data": {
									"id": "source ID",
									"label": "source Name (source Name / source Cluster)",
									"cluster": "source Cluster",
									"namespace": "source Namespace",
									"name": "source Name",
									"external": "External"
							}
					},
					{
							"data": {
									"id": "target ID",
									"label": "target Name (target Name / target Cluster)",
									"cluster": "target Cluster",
									"namespace": "target Namespace",
									"name": "target Name",
									"external": ""
							}
					}
			]
		}`, w)
	})
}

func TestGetApplicationTopology(t *testing.T) {
	var newRouter = func(t *testing.T) (*db.MockClient, Router) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, otel.Tracer("applications")}

		return dbClient, router
	}

	t.Run("can get ApplicationTopology", func(t *testing.T) {
		application := &applicationv1.ApplicationSpec{
			ID: "application-id",
		}
		user := authContext.User{
			Permissions: userv1.Permissions{
				Applications: []userv1.ApplicationPermissions{
					{Type: "all"},
				},
			},
		}
		sourceTopology := []db.Topology{
			{
				SourceID:            "source ID",
				SourceName:          "source Name",
				SourceNamespace:     "source Namespace",
				SourceCluster:       "source Cluster",
				TopologyExternal:    true,
				TopologyDescription: "topology description",
				TargetID:            "target ID",
				TargetName:          "target Name",
				TargetNamespace:     "target Namespace",
				TargetCluster:       "target Cluster",
			},
		}
		targetTopology := []db.Topology{
			{
				SourceID:        "target ID",
				SourceNamespace: "target Namespace",
				SourceCluster:   "target Cluster",
				TargetID:        "source ID",
			},
		}

		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), application.ID).Return(application, nil)
		dbClient.EXPECT().GetTopologyByIDs(gomock.Any(), "SourceID", []string{application.ID}).Return(sourceTopology, nil)
		dbClient.EXPECT().GetTopologyByIDs(gomock.Any(), "TargetID", []string{application.ID}).Return(targetTopology, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/topology/application?id=%s", application.ID), nil)
		w := httptest.NewRecorder()

		router.getApplicationTopology(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `{
			"edges": [
					{
							"data": {
									"id": "",
									"source": "source ID",
									"target": "target ID",
									"description": "topology description"
							}
					}
			],
			"nodes": [
					{
							"data": {
									"id": "source ID",
									"label": "source Name (source Name / source Cluster)",
									"cluster": "source Cluster",
									"namespace": "source Namespace",
									"name": "source Name",
									"external": "External"
							}
					},
					{
							"data": {
									"id": "target ID",
									"label": "target Name (target Name / target Cluster)",
									"cluster": "target Cluster",
									"namespace": "target Namespace",
									"name": "target Name",
									"external": ""
							}
					}
			]
		}`, w)
	})

	t.Run("handles error in GetApplicationByID", func(t *testing.T) {
		application := &applicationv1.ApplicationSpec{
			ID: "application-id",
		}

		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), application.ID).Return(nil, fmt.Errorf("unexpected error when getting the application by id"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/topology/application?id=%s", application.ID), nil)
		w := httptest.NewRecorder()

		router.getApplicationTopology(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error":"could not get application"}`, w)
	})

	t.Run("handles when no applications are returned", func(t *testing.T) {
		application := &applicationv1.ApplicationSpec{
			ID: "application-id",
		}

		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), application.ID).Return(nil, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/topology/application?id=%s", application.ID), nil)
		w := httptest.NewRecorder()

		router.getApplicationTopology(w, req)

		utils.AssertStatusEq(t, http.StatusNotFound, w)
		utils.AssertJSONEq(t, `{"error":"application was not found"}`, w)
	})

	t.Run("handles users without access to application", func(t *testing.T) {
		application := &applicationv1.ApplicationSpec{
			ID: "application-id",
		}

		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), application.ID).Return(&applicationv1.ApplicationSpec{}, nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/topology/application?id=%s", application.ID), nil)
		w := httptest.NewRecorder()

		router.getApplicationTopology(w, req)

		utils.AssertStatusEq(t, http.StatusForbidden, w)
		utils.AssertJSONEq(t, `{"error":"you are not allowed to view the application"}`, w)
	})

	t.Run("handles error in GetTopologyByIDs (SourceID)", func(t *testing.T) {
		application := &applicationv1.ApplicationSpec{
			ID: "application-id",
		}
		user := authContext.User{
			Permissions: userv1.Permissions{
				Applications: []userv1.ApplicationPermissions{
					{Type: "all"},
				},
			},
		}

		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), application.ID).Return(&applicationv1.ApplicationSpec{}, nil)
		dbClient.EXPECT().GetTopologyByIDs(gomock.Any(), "SourceID", gomock.Any()).Return(nil, fmt.Errorf("get topology by ids failed for SourceID"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/topology/application?id=%s", application.ID), nil)
		w := httptest.NewRecorder()

		router.getApplicationTopology(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error": "could not get source topology"}`, w)
	})

	t.Run("handles error in GetTopologyByIDs (SourceID)", func(t *testing.T) {
		application := &applicationv1.ApplicationSpec{
			ID: "application-id",
		}
		user := authContext.User{
			Permissions: userv1.Permissions{
				Applications: []userv1.ApplicationPermissions{
					{Type: "all"},
				},
			},
		}

		dbClient, router := newRouter(t)
		dbClient.EXPECT().GetApplicationByID(gomock.Any(), application.ID).Return(&applicationv1.ApplicationSpec{}, nil)
		dbClient.EXPECT().GetTopologyByIDs(gomock.Any(), "SourceID", gomock.Any()).Return(nil, nil)
		dbClient.EXPECT().GetTopologyByIDs(gomock.Any(), "TargetID", gomock.Any()).Return(nil, fmt.Errorf("get topology by ids failed for TargetID"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, user)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/topology/application?id=%s", application.ID), nil)
		w := httptest.NewRecorder()

		router.getApplicationTopology(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error": "could not get target topology"}`, w)
	})
}
