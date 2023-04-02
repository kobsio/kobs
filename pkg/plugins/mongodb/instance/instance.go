package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"context"
	"time"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"go.uber.org/zap"

	"github.com/mitchellh/mapstructure"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	mongoOptions "go.mongodb.org/mongo-driver/mongo/options"
)

type Config struct {
	ConnectionString string `json:"connectionString"`
	DatabaseName     string `json:"databaseName"`
}

type Instance interface {
	GetName() string
	GetDBStats(ctx context.Context) (*DBStats, error)
	GetDBCollectionNames(ctx context.Context) ([]string, error)
	GetDBCollectionStats(ctx context.Context, collectionName string) (*CollectionStats, error)
	Find(ctx context.Context, collectionName string, filter string, sort string, limit int64) ([]bson.D, error)
	Count(ctx context.Context, collectionName string, filter string) (int64, error)
	FindOne(ctx context.Context, collectionName, filter string) (*bson.M, error)
}

type instance struct {
	name        string
	mongoClient *mongo.Client
	config      Config
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) GetDBStats(ctx context.Context) (*DBStats, error) {
	stats := i.mongoClient.Database(i.config.DatabaseName).RunCommand(ctx, bson.D{
		{Key: "dbStats", Value: 1},
		{Key: "scale", Value: 1},
	})
	if stats.Err() != nil {
		log.Error(ctx, "Could not get db stats", zap.Error(stats.Err()))
		return nil, stats.Err()
	}

	var dbStats DBStats
	if err := stats.Decode(&dbStats); err != nil {
		log.Error(ctx, "Could not decode db stats", zap.Error(stats.Err()))
		return nil, err
	}

	return &dbStats, nil
}

func (i *instance) GetDBCollectionNames(ctx context.Context) ([]string, error) {
	names, err := i.mongoClient.Database(i.config.DatabaseName).ListCollectionNames(ctx, bson.D{}, nil)
	if err != nil {
		log.Error(ctx, "Could not get collection names", zap.Error(err))
		return nil, err
	}

	return names, nil
}

func (i *instance) GetDBCollectionStats(ctx context.Context, collectionName string) (*CollectionStats, error) {
	stats := i.mongoClient.Database(i.config.DatabaseName).RunCommand(ctx, bson.D{
		{Key: "collStats", Value: collectionName},
		{Key: "scale", Value: 1},
	})
	if stats.Err() != nil {
		log.Error(ctx, "Could not get db stats", zap.Error(stats.Err()))
		return nil, stats.Err()
	}

	var collStats CollectionStats
	if err := stats.Decode(&collStats); err != nil {
		log.Error(ctx, "Could not decode db stats", zap.Error(stats.Err()))
		return nil, err
	}

	return &collStats, nil
}

func (i *instance) Find(ctx context.Context, collectionName string, filter string, sort string, limit int64) ([]bson.D, error) {
	var bsonFilter any
	err := bson.UnmarshalExtJSON([]byte(filter), false, &bsonFilter)
	if err != nil {
		log.Error(ctx, "Could not unmarshall query", zap.Error(err))
		return nil, err
	}

	var bsonSort any
	err = bson.UnmarshalExtJSON([]byte(sort), false, &bsonSort)
	if err != nil {
		log.Error(ctx, "Could not unmarshall sort", zap.Error(err))
		return nil, err
	}

	cursor, err := i.mongoClient.Database(i.config.DatabaseName).Collection(collectionName).Find(ctx, bsonFilter, &mongoOptions.FindOptions{
		Limit: &limit,
		Skip:  nil,
		Sort:  bsonSort,
	})
	if err != nil {
		log.Error(ctx, "Could not get db stats", zap.Error(err))
		return nil, err
	}

	var results = make([]bson.D, 0)

	for cursor.Next(ctx) {
		var elem bson.D
		err := cursor.Decode(&elem)
		if err != nil {
			log.Error(ctx, "Cannot decode find result", zap.Error(err))
			return nil, err
		}

		results = append(results, elem)
	}

	return results, nil
}

func (i *instance) Count(ctx context.Context, collectionName string, filter string) (int64, error) {
	var bsonFilter any
	err := bson.UnmarshalExtJSON([]byte(filter), false, &bsonFilter)
	if err != nil {
		log.Error(ctx, "Could not unmarshall query", zap.Error(err))
		return 0, err
	}

	return i.mongoClient.Database(i.config.DatabaseName).Collection(collectionName).CountDocuments(ctx, bsonFilter)
}

func (i *instance) FindOne(ctx context.Context, collectionName, filter string) (*bson.M, error) {
	var bsonFilter any
	err := bson.UnmarshalExtJSON([]byte(filter), false, &bsonFilter)
	if err != nil {
		log.Error(ctx, "Could not unmarshall query", zap.Error(err))
		return nil, err
	}

	res := i.mongoClient.Database(i.config.DatabaseName).Collection(collectionName).FindOne(ctx, bsonFilter)
	if res.Err() != nil {
		log.Error(ctx, "Could not get document", zap.Error(err))
		return nil, err
	}

	var document bson.M

	err = res.Decode(&document)
	if err != nil {
		log.Error(ctx, "Could not decode document", zap.Error(err))
		return nil, err
	}

	return &document, nil
}

func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, mongoOptions.Client().ApplyURI(config.ConnectionString).SetAppName("kobs"))
	if err != nil {
		log.Error(nil, "Could not initialize database connection", zap.Error(err))
		return nil, err
	}

	return &instance{
		name:        name,
		mongoClient: client,
		config:      config,
	}, nil
}
