package instance

import (
	"context"
	"fmt"
	"testing"

	"github.com/orlangure/gnomock"
	"github.com/orlangure/gnomock/preset/mongo"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func setupDatabase(t *testing.T) (string, *gnomock.Container) {
	p := mongo.Preset(mongo.WithData("./testdata/"))
	c, err := gnomock.Start(p)
	if err != nil {
		t.Fatal(err)
	}

	return fmt.Sprintf("mongodb://%s", c.DefaultAddress()), c
}

func TestGetName(t *testing.T) {
	instance := &instance{
		name: "mongodb",
	}

	require.Equal(t, "mongodb", instance.GetName())
}

func TestGetDBStats(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	stats, err := instance.GetDBStats(context.Background())
	require.NoError(t, err)
	require.NotNil(t, stats)
}

func TestGetDBCollectionNames(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	collectionNames, err := instance.GetDBCollectionNames(context.Background())
	require.NoError(t, err)
	require.Equal(t, []string{"applications"}, collectionNames)
}

func TestGetDBCollectionStats(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	stats, err := instance.GetDBCollectionStats(context.Background(), "applications")
	require.NoError(t, err)
	require.Equal(t, int64(5), stats.Count)
}

func TestGetDBCollectionIndexes(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	indexes, err := instance.GetDBCollectionIndexes(context.Background(), "applications")
	require.NoError(t, err)
	require.Equal(t, []primitive.D{{primitive.E{Key: "v", Value: int32(2)}, primitive.E{Key: "key", Value: primitive.D{primitive.E{Key: "_id", Value: int32(1)}}}, primitive.E{Key: "name", Value: "_id_"}}}, indexes)
}

func TestFind(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	t.Run("should return error for invalid filter", func(t *testing.T) {
		_, err := instance.Find(context.Background(), "applications", `invalid filter`, "", 50)
		require.Error(t, err)
	})

	t.Run("should return error for invalid sort", func(t *testing.T) {
		_, err := instance.Find(context.Background(), "applications", `{"name": "app1"}`, "invalid sort", 50)
		require.Error(t, err)
	})

	t.Run("should return documents", func(t *testing.T) {
		documents, err := instance.Find(context.Background(), "applications", `{"name": "app1"}`, `{"_id" : -1}`, 50)
		require.NoError(t, err)
		require.Equal(t, []primitive.D{
			{primitive.E{Key: "_id", Value: "/cluster/cluster2/namespace/default/name/app1"}, primitive.E{Key: "cluster", Value: "cluster2"}, primitive.E{Key: "namespace", Value: "default"}, primitive.E{Key: "name", Value: "app1"}, primitive.E{Key: "tags", Value: primitive.A{"tag1", "tag2"}}, primitive.E{Key: "teams", Value: primitive.A{"team1"}}},
			{primitive.E{Key: "_id", Value: "/cluster/cluster1/namespace/default/name/app1"}, primitive.E{Key: "cluster", Value: "cluster1"}, primitive.E{Key: "namespace", Value: "default"}, primitive.E{Key: "name", Value: "app1"}, primitive.E{Key: "tags", Value: primitive.A{"tag1", "tag2"}}, primitive.E{Key: "teams", Value: primitive.A{"team1"}}},
		}, documents)
	})
}

func TestCount(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	t.Run("should return error for invalid filter", func(t *testing.T) {
		_, err := instance.Count(context.Background(), "applications", `invalid filter`)
		require.Error(t, err)
	})

	t.Run("should return count", func(t *testing.T) {
		count, err := instance.Count(context.Background(), "applications", `{"name": "app1"}`)
		require.NoError(t, err)
		require.Equal(t, int64(2), count)
	})
}

func TestFindOne(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	t.Run("should return error for invalid filter", func(t *testing.T) {
		_, err := instance.FindOne(context.Background(), "applications", `invalid filter`)
		require.Error(t, err)
	})

	t.Run("should return document", func(t *testing.T) {
		douments, err := instance.FindOne(context.Background(), "applications", `{"name": "app1"}`)
		require.NoError(t, err)
		require.Equal(t, &primitive.M{"_id": "/cluster/cluster1/namespace/default/name/app1", "cluster": "cluster1", "name": "app1", "namespace": "default", "tags": primitive.A{"tag1", "tag2"}, "teams": primitive.A{"team1"}}, douments)
	})
}

func TestFindOneAndUpdate(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	t.Run("should return error for invalid filter", func(t *testing.T) {
		_, err := instance.FindOneAndUpdate(context.Background(), "applications", `invalid filter`, ``)
		require.Error(t, err)
	})

	t.Run("should return error for invalid update", func(t *testing.T) {
		_, err := instance.FindOneAndUpdate(context.Background(), "applications", `{"_id": "/cluster/cluster1/namespace/default/name/app1"}`, `invalid update`)
		require.Error(t, err)
	})

	t.Run("should return document", func(t *testing.T) {
		douments, err := instance.FindOneAndUpdate(context.Background(), "applications", `{"_id": "/cluster/cluster1/namespace/default/name/app1"}`, `{"$set": {"name": "newapp1"}}`)
		require.NoError(t, err)
		require.Equal(t, &primitive.M{"_id": "/cluster/cluster1/namespace/default/name/app1", "cluster": "cluster1", "name": "newapp1", "namespace": "default", "tags": primitive.A{"tag1", "tag2"}, "teams": primitive.A{"team1"}}, douments)
	})
}

func TestFindOneAnddelete(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	t.Run("should return error for invalid filter", func(t *testing.T) {
		_, err := instance.FindOneAndDelete(context.Background(), "applications", `invalid filter`)
		require.Error(t, err)
	})

	t.Run("should return document", func(t *testing.T) {
		douments, err := instance.FindOneAndDelete(context.Background(), "applications", `{"_id": "/cluster/cluster1/namespace/default/name/app1"}`)
		require.NoError(t, err)
		require.Equal(t, &primitive.M{"_id": "/cluster/cluster1/namespace/default/name/app1", "cluster": "cluster1", "name": "app1", "namespace": "default", "tags": primitive.A{"tag1", "tag2"}, "teams": primitive.A{"team1"}}, douments)
	})
}

func TestUpdateMany(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	t.Run("should return error for invalid filter", func(t *testing.T) {
		_, _, err := instance.UpdateMany(context.Background(), "applications", `invalid filter`, ``)
		require.Error(t, err)
	})

	t.Run("should return error for invalid update", func(t *testing.T) {
		_, _, err := instance.UpdateMany(context.Background(), "applications", `{"name": "app1"}`, `invalid update`)
		require.Error(t, err)
	})

	t.Run("should return document", func(t *testing.T) {
		matchedCount, modifiedCount, err := instance.UpdateMany(context.Background(), "applications", `{"name": "app1"}`, `{"$set": {"name": "newapp1"}}`)
		require.NoError(t, err)
		require.Equal(t, int64(2), matchedCount)
		require.Equal(t, int64(2), modifiedCount)
	})
}

func TestDeleteMany(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	t.Run("should return error for invalid filter", func(t *testing.T) {
		_, err := instance.DeleteMany(context.Background(), "applications", `invalid filter`)
		require.Error(t, err)
	})

	t.Run("should return document", func(t *testing.T) {
		count, err := instance.DeleteMany(context.Background(), "applications", `{"name": "app1"}`)
		require.NoError(t, err)
		require.Equal(t, int64(2), count)
	})
}

func TestAggregate(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)

	instance, err := New("mongodb", map[string]any{"connectionString": uri, "databaseName": "db1"})
	require.NoError(t, err)

	t.Run("should return error for invalid pipeline", func(t *testing.T) {
		_, err := instance.Aggregate(context.Background(), "applications", `invalid pipeline`)
		require.Error(t, err)
	})

	t.Run("should return documents", func(t *testing.T) {
		documents, err := instance.Aggregate(context.Background(), "applications", `[{"$match": {"teams": "team1"}}, {"$group": {"_id": [{"name": "$name"},{"namespace": "$namespace"}]}}, {"$sort":{"_id": 1}}]`)
		require.NoError(t, err)
		require.Equal(t, []primitive.D{
			{primitive.E{Key: "_id", Value: primitive.A{primitive.D{primitive.E{Key: "name", Value: "app1"}}, primitive.D{primitive.E{Key: "namespace", Value: "default"}}}}},
			{primitive.E{Key: "_id", Value: primitive.A{primitive.D{primitive.E{Key: "name", Value: "app3"}}, primitive.D{primitive.E{Key: "namespace", Value: "default"}}}}},
		}, documents)
	})
}

func TestNew(t *testing.T) {
	t.Run("should return error for invalid options", func(t *testing.T) {
		instance, err := New("mongodb", map[string]any{"connectionString": []string{"localhost"}})
		require.Error(t, err)
		require.Nil(t, instance)
	})

	t.Run("should return error for invalid connection string", func(t *testing.T) {
		instance, err := New("mongodb", map[string]any{"connectionString": "localhost"})
		require.Error(t, err)
		require.Nil(t, instance)
	})

	t.Run("should return new instance", func(t *testing.T) {
		uri, container := setupDatabase(t)
		defer gnomock.Stop(container)

		instance, err := New("mongodb", map[string]any{"connectionString": uri})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})
}
