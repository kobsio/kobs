package plugins

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	userv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/user/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	p "github.com/kobsio/kobs/pkg/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/golang/mock/gomock"
	"github.com/kobsio/kobs/pkg/hub/clusters/cluster"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"
)

func TestGetPlugins(t *testing.T) {
	t.Run("when get plugins fails", func(t *testing.T) {
		authUser := authContext.User{ID: "test@kobs.io"}
		ctrl := gomock.NewController(t)
		clusterClient := cluster.NewMockClient(ctrl)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetPlugins(gomock.Any()).Return(nil, fmt.Errorf("cant get plugins"))
		router := Router{chi.NewRouter(), clusterClient, dbClient}

		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authUser)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		w := httptest.NewRecorder()
		router.getPlugins(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error": "could not get plugins"}`, w)
	})

	t.Run("can get plugins", func(t *testing.T) {
		authUser := authContext.User{ID: "test@kobs.io"}
		plugin := p.Instance{ID: "myplugin", Cluster: "cluster-1", Name: "my plugin name", Description: "my plugin description", Type: "plugin type"}
		ctrl := gomock.NewController(t)
		clusterClient := cluster.NewMockClient(ctrl)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetPlugins(gomock.Any()).Return([]p.Instance{plugin}, nil)
		router := Router{chi.NewRouter(), clusterClient, dbClient}

		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authUser)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		w := httptest.NewRecorder()
		router.getPlugins(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, fmt.Sprintf(`{"plugins":[{"id":"%s","cluster":"%s","name":"%s","description":"%s","type":"%s","options":null,"frontendOptions":null,"updatedAt":0}],"version":"2"}`, plugin.ID, plugin.Cluster, plugin.Name, plugin.Description, plugin.Type), w)
	})
}

func TestProxyPlugin(t *testing.T) {
	t.Run("when user doesn't have the permission", func(t *testing.T) {
		authUser := authContext.User{ID: "test@kobs.io"}
		ctrl := gomock.NewController(t)
		clusterClient := cluster.NewMockClient(ctrl)
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), clusterClient, dbClient}

		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authUser)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		w := httptest.NewRecorder()

		router.proxyPlugins(w, req)

		utils.AssertStatusEq(t, http.StatusForbidden, w)
		utils.AssertJSONEq(t, `{"error": "you are not allowed to access the plugin"}`, w)
	})

	t.Run("can proxy", func(t *testing.T) {
		plugin := p.Instance{ID: "myplugin", Cluster: "cluster-1", Name: "my plugin name", Description: "my plugin description", Type: "plugin type"}
		authUser := authContext.User{ID: "test@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Type: plugin.Type, Name: plugin.Name}}}}
		ctrl := gomock.NewController(t)
		clusterClient := cluster.NewMockClient(ctrl)
		clusterClient.EXPECT().Proxy(gomock.Any(), gomock.Any()).Do(func(w http.ResponseWriter, r *http.Request) {
			render.JSON(w, r, struct {
				OK bool `json:"ok"`
			}{OK: true})
		})
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), clusterClient, dbClient}

		chiContext := chi.NewRouteContext()
		chiContext.URLParams.Add("type", plugin.Type)
		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chiContext)
		ctx = context.WithValue(ctx, authContext.UserKey, authUser)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)
		req.Header.Add("x-kobs-plugin", plugin.Name)

		w := httptest.NewRecorder()

		router.proxyPlugins(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `{"ok": true}`, w)
	})

	t.Run("can proxy when plugin name is in route", func(t *testing.T) {
		plugin := p.Instance{ID: "myplugin", Cluster: "cluster-1", Name: "my plugin name", Description: "my plugin description", Type: "plugin type"}
		authUser := authContext.User{ID: "test@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Type: plugin.Type, Name: plugin.Name}}}}
		ctrl := gomock.NewController(t)
		clusterClient := cluster.NewMockClient(ctrl)
		clusterClient.EXPECT().Proxy(gomock.Any(), gomock.Any()).Do(func(w http.ResponseWriter, r *http.Request) {
			render.JSON(w, r, struct {
				OK bool `json:"ok"`
			}{OK: true})
		})
		dbClient := db.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), clusterClient, dbClient}

		chiContext := chi.NewRouteContext()
		chiContext.URLParams.Add("type", plugin.Type)
		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chiContext)
		ctx = context.WithValue(ctx, authContext.UserKey, authUser)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/?x-kobs-plugin=%s", plugin.Name), nil)

		w := httptest.NewRecorder()

		router.proxyPlugins(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `{"ok": true}`, w)
	})
}

func TestMount(t *testing.T) {
	clusterClient, _ := cluster.NewClient(cluster.Config{})
	dbClient, _ := db.NewClient(db.Config{})
	router := Mount(Config{}, clusterClient, dbClient)
	require.NotNil(t, router)
}
