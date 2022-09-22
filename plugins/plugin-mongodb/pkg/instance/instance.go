package instance

import (
	"context"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/mitchellh/mapstructure"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	mongoOptions "go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"go.uber.org/zap"
	"time"
)

type Config struct {
	DatabaseName          string `json:"databaseName"`
	MongoConnectionString string `json:"mongoConnectionString"`
}

type Instance interface {
	GetName() string
	GetDbStats(context.Context) (DbStats, error)
	GetDbCollectionNames(context.Context) ([]string, error)
	GetDbCollectionStats(context.Context, string) (CollectionStats, error)
	Find(context.Context, string, []byte) ([]bson.D, error)
}

type instance struct {
	name        string
	mongoClient *mongo.Client
	config      Config
}

func (i *instance) GetName() string {
	return i.name
}

type DbStats struct {
	Db                   string  `bson:"db" json:"db"`
	Collections          int64   `bson:"collections" json:"collections"`
	Views                int64   `bson:"views" json:"views"`
	Objects              int64   `bson:"objects" json:"objects"`
	AvgObjSize           float64 `bson:"avgObjSize" json:"avgObjSize"`
	DataSize             int64   `bson:"dataSize" json:"dataSize"`
	StorageSize          int64   `bson:"storageSize" json:"storageSize"`
	FreeStorageSize      int64   `bson:"freeStorageSize" json:"freeStorageSize"`
	Indexes              int64   `bson:"indexes" json:"indexes"`
	IndexSize            int64   `bson:"indexSize" json:"indexSize"`
	IndexFreeStorageSize int64   `bson:"indexFreeStorageSize" json:"indexFreeStorageSize"`
	TotalSize            int64   `bson:"totalSize" json:"totalSize"`
	TotalFreeStorageSize int64   `bson:"totalFreeStorageSize" json:"totalFreeStorageSize"`
	ScaleFactor          int64   `bson:"scaleFactor" json:"scaleFactor"`
	FsUsedSize           int64   `bson:"fsUsedSize" json:"fsUsedSize"`
	FsTotalSize          int64   `bson:"fsTotalSize" json:"fsTotalSize"`
}

type CollectionStats struct {
	Ns              string  `bson:"ns" json:"ns"`
	Size            int64   `bson:"size" json:"size"`
	Count           int64   `bson:"count" json:"count"`
	AvgObjSize      float64 `bson:"avgObjSize" json:"avgObjSize"`
	NumOrphanDocs   int64   `bson:"numOrphanDocs" json:"numOrphanDocs"`
	StorageSize     int64   `bson:"storageSize" json:"storageSize"`
	FreeStorageSize int64   `bson:"freeStorageSize" json:"freeStorageSize"`
	Nindexes        int64   `bson:"nindexes" json:"nindexes"`
	TotalIndexSize  int64   `bson:"totalIndexSize" json:"totalIndexSize"`
	TotalSize       int64   `bson:"totalSize" json:"totalSize"`
}

func (i *instance) GetDbStats(ctx context.Context) (DbStats, error) {
	stats := i.mongoClient.Database(i.config.DatabaseName).RunCommand(ctx, bson.D{
		{"dbStats", 1},
		{"scale", 1},
	})

	if stats.Err() != nil {
		log.Error(ctx, "Could not get db stats", zap.Error(stats.Err()))
		return DbStats{}, stats.Err()
	}

	var dbStats DbStats
	if err := stats.Decode(&dbStats); err != nil {
		log.Error(ctx, "Could not decode db stats", zap.Error(stats.Err()))
		return DbStats{}, err
	}

	return dbStats, nil
}

func (i *instance) GetDbCollectionNames(ctx context.Context) ([]string, error) {
	names, err := i.mongoClient.Database(i.config.DatabaseName).ListCollectionNames(ctx, bson.D{}, nil)

	if err != nil {
		log.Error(ctx, "Could not get collection names", zap.Error(err))
		return []string{}, err
	}

	return names, nil
}

func (i *instance) GetDbCollectionStats(ctx context.Context, collName string) (CollectionStats, error) {
	stats := i.mongoClient.Database(i.config.DatabaseName).RunCommand(ctx, bson.D{
		{"collStats", collName},
		{"scale", 1},
	})

	if stats.Err() != nil {
		log.Error(ctx, "Could not get db stats", zap.Error(stats.Err()))
		return CollectionStats{}, stats.Err()
	}

	var collStats CollectionStats
	if err := stats.Decode(&collStats); err != nil {
		log.Error(ctx, "Could not decode db stats", zap.Error(stats.Err()))
		return CollectionStats{}, err
	}

	return collStats, nil
}

func (i *instance) Find(ctx context.Context, collName string, query []byte) ([]bson.D, error) {
	var bsonQuery interface{}
	err := bson.UnmarshalExtJSON(query, false, &bsonQuery)
	if err != nil {
		log.Error(ctx, "Cannot unmarshall Query", zap.Error(err))
		return nil, err
	}

	cursor, err := i.mongoClient.Database(i.config.DatabaseName).Collection(collName).Find(ctx, bsonQuery, &mongoOptions.FindOptions{
		AllowDiskUse:        nil,
		AllowPartialResults: nil,
		BatchSize:           nil,
		Collation:           nil,
		Comment:             nil,
		CursorType:          nil,
		Hint:                nil,
		Limit:               func() *int64 { i := int64(50); return &i }(),
		Max:                 nil,
		MaxAwaitTime:        nil,
		Min:                 nil,
		NoCursorTimeout:     nil,
		Projection:          nil,
		ReturnKey:           nil,
		ShowRecordID:        nil,
		Skip:                nil,
		Sort:                nil,
		Let:                 nil,
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

func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	initCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(
		initCtx,
		mongoOptions.Client().
			ApplyURI(config.MongoConnectionString).
			SetAppName("kobs"),
	)

	if err != nil {
		log.Error(nil, "Could not initialize database connection", zap.Error(err))
		return nil, err
	}

	if err := client.Ping(initCtx, readpref.Primary()); err != nil {
		log.Error(nil, "Cannot ping mongodb primary node", zap.Error(err))
		return nil, err
	}

	log.Info(nil, "Successfully connected and pinged mongodb")

	return &instance{
		name:        name,
		mongoClient: client,
		config:      config,
	}, nil
}
