package mongodb

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/mongodb/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/orlangure/gnomock"
	"github.com/orlangure/gnomock/preset/mongo"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("mongodb")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("mongodb")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("mongodb")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("mongodb")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestGetStats(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/stats", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getStats(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().GetDBStats(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/stats", nil)
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.getStats(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to fetch database statistics"]}`)
	})

	t.Run("should return db stats", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().GetDBStats(gomock.Any()).Return(&instance.DBStats{Collections: 2}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/stats", nil)
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.getStats(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"avgObjSize":0, "collections":2, "dataSize":0, "db":"", "freeStorageSize":0, "fsTotalSize":0, "fsUsedSize":0, "indexFreeStorageSize":0, "indexSize":0, "indexes":0, "objects":0, "scaleFactor":0, "storageSize":0, "totalFreeStorageSize":0, "totalSize":0, "views":0}`)
	})
}

func TestGetCollectionNames(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/collections", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getCollectionNames(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().GetDBCollectionNames(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/collections", nil)
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.getCollectionNames(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to fetch collection names"]}`)
	})

	t.Run("should return collections", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().GetDBCollectionNames(gomock.Any()).Return([]string{"applications"}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/collections", nil)
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.getCollectionNames(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `["applications"]`)
	})
}

func TestGetCollectionStats(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/collections/stats", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getCollectionStats(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().GetDBCollectionStats(gomock.Any(), "applications").Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/collections/stats?collectionName=applications", nil)
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.getCollectionStats(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to fetch collection statistics"]}`)
	})

	t.Run("should return collection stats", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().GetDBCollectionStats(gomock.Any(), "applications").Return(&instance.CollectionStats{Count: 5}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/collections/stats?collectionName=applications", nil)
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.getCollectionStats(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"avgObjSize":0, "count":5, "freeStorageSize":0, "nindexes":0, "ns":"", "numOrphanDocs":0, "size":0, "storageSize":0, "totalIndexSize":0, "totalSize":0}`)
	})
}

func TestFind(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/find", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.find(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail for invalid request body", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/find", strings.NewReader(`[]`))
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.find(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to decode request body"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().Find(gomock.Any(), "applications", gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/find?collectionName=applications&limit=5", strings.NewReader(`{"filter": "{\"name\": \"app1\"}"}`))
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.find(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to run 'find' query"]}`)
	})

	t.Run("should return documents", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().Find(gomock.Any(), "applications", gomock.Any(), gomock.Any(), gomock.Any()).Return([]primitive.D{{primitive.E{Key: "name", Value: "app1"}}}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/find?collectionName=applications&limit=5", strings.NewReader(`{"filter": "{\"name\": \"app1\"}"}`))
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.find(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[{"name":"app1"}]`)
	})
}

func TestCount(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/count", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.count(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail for invalid request body", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/count", strings.NewReader(`[]`))
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.count(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to decode request body"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().Count(gomock.Any(), "applications", gomock.Any()).Return(int64(0), fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/count?collectionName=applications", strings.NewReader(`{"filter": "{\"name\": \"app1\"}"}`))
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.count(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to run 'count' query"]}`)
	})

	t.Run("should return count", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().Count(gomock.Any(), "applications", gomock.Any()).Return(int64(2), nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/count?collectionName=applications", strings.NewReader(`{"filter": "{\"name\": \"app1\"}"}`))
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.count(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"count":2}`)
	})
}

func TestFindOne(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/findone", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.findOne(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail for invalid request body", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/findone", strings.NewReader(`[]`))
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.findOne(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to decode request body"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().FindOne(gomock.Any(), "applications", gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/findone?collectionName=applications", strings.NewReader(`{"filter": "{\"name\": \"app1\"}"}`))
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.findOne(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to run 'findOne' query"]}`)
	})

	t.Run("should return document", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("mongodb")
		i.EXPECT().FindOne(gomock.Any(), "applications", gomock.Any()).Return(&primitive.M{"name": "app1"}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/collections/findone?collectionName=applications", strings.NewReader(`{"filter": "{\"name\": \"app1\"}"}`))
		req.Header.Set("x-kobs-plugin", "mongodb")
		w := httptest.NewRecorder()

		router.findOne(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"name":"app1"}`)
	})
}

func TestMount(t *testing.T) {
	t.Run("should return error for invalid instance", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "mongodb", Options: map[string]any{"address": []string{"localhost"}}}}, nil)
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should work", func(t *testing.T) {
		p := mongo.Preset(mongo.WithData("./instance/testdata/"))
		c, err := gnomock.Start(p)
		if err != nil {
			t.Fatal(err)
		}
		defer gnomock.Stop(c)

		router, err := Mount([]plugin.Instance{{Name: "mongodb", Options: map[string]any{"connectionString": fmt.Sprintf("mongodb://%s", c.DefaultAddress())}}}, nil)
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
