package db

//go:generate mockgen -source=db.go -destination=./db_mock.go -package=db Client

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	"github.com/kobsio/kobs/pkg/plugins/plugin"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

type Config struct {
	URI string `json:"uri" env:"URI" default:"mongodb://localhost:27017" help:"The connection uri for MongoDB"`
}

// Client is the interface with all the methods to interact with the store.
type Client interface {
	SavePlugins(ctx context.Context, cluster string, plugins []plugin.Instance) error
	SaveNamespaces(ctx context.Context, cluster string, namespaces []string) error
	SaveCRDs(ctx context.Context, crds []kubernetes.CRD) error
	SaveApplications(ctx context.Context, cluster string, applications []applicationv1.ApplicationSpec) error
	SaveDashboards(ctx context.Context, cluster string, dashboards []dashboardv1.DashboardSpec) error
	SaveTeams(ctx context.Context, cluster string, teams []teamv1.TeamSpec) error
	SaveUsers(ctx context.Context, cluster string, users []userv1.UserSpec) error
	SaveTags(ctx context.Context, applications []applicationv1.ApplicationSpec) error
	SaveTopology(ctx context.Context, cluster string, applications []applicationv1.ApplicationSpec) error
	GetPlugins(ctx context.Context) ([]plugin.Instance, error)
	GetNamespaces(ctx context.Context) ([]Namespace, error)
	GetNamespacesByClusters(ctx context.Context, clusters []string) ([]Namespace, error)
	GetCRDs(ctx context.Context) ([]kubernetes.CRD, error)
	GetCRDByID(ctx context.Context, id string) (*kubernetes.CRD, error)
	GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByFilter(ctx context.Context, teams, clusters, namespaces, tags []string, searchTerm, external string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByFilterCount(ctx context.Context, teams, clusters, namespaces, tags []string, searchTerm, external string) (int, error)
	GetApplicationByID(ctx context.Context, id string) (*applicationv1.ApplicationSpec, error)
	GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error)
	GetDashboardByID(ctx context.Context, id string) (*dashboardv1.DashboardSpec, error)
	GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error)
	GetTeamsByIDs(ctx context.Context, ids []string) ([]teamv1.TeamSpec, error)
	GetTeamByID(ctx context.Context, id string) (*teamv1.TeamSpec, error)
	GetUsers(ctx context.Context) ([]userv1.UserSpec, error)
	GetUserByID(ctx context.Context, id string) (*userv1.UserSpec, error)
	GetTags(ctx context.Context) ([]Tag, error)
	GetTopologyByIDs(ctx context.Context, field string, ids []string) ([]Topology, error)
}

type client struct {
	db     *mongo.Client
	tracer trace.Tracer
}

// NewClient creates a new MongoDB client which implements our store interface and can be used instead of Bolt. To
// create a local MongoDB for testing the following commands can be used:
//
//	docker run --name mongodb -d -p 27017:27017 mongo
//	docker stop mongodb
//	docker rm mongodb
func NewClient(config Config) (Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := mongo.Connect(ctx, options.Client().ApplyURI(config.URI))
	if err != nil {
		return nil, err
	}

	if err := db.Ping(ctx, readpref.Primary()); err != nil {
		return nil, err
	}

	return &client{
		db:     db,
		tracer: otel.Tracer("db"),
	}, nil
}

func (c *client) save(ctx context.Context, collection string, models []mongo.WriteModel, cluster string, updatedAt int64) error {
	_, err := c.db.Database("kobs").Collection(collection).BulkWrite(ctx, models)
	if err != nil {
		return err
	}

	filter := bson.D{{Key: "updatedat", Value: bson.D{{Key: "$lt", Value: updatedAt}}}}
	if cluster != "" {
		filter = bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "cluster", Value: bson.D{{Key: "$eq", Value: cluster}}}}, filter}}}
	}

	_, err = c.db.Database("kobs").Collection(collection).DeleteMany(ctx, filter)
	if err != nil {
		return err
	}

	return nil
}

func (c *client) SavePlugins(ctx context.Context, cluster string, plugins []plugin.Instance) error {
	ctx, span := c.tracer.Start(ctx, "store.SavePlugins")
	span.SetAttributes(attribute.Key("cluster").String(cluster))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, p := range plugins {
		p.ID = fmt.Sprintf("/cluster/%s/type/%s/name/%s", cluster, p.Type, p.Name)
		p.Cluster = cluster
		p.UpdatedAt = updatedAt
		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: p.ID}}).SetReplacement(p).SetUpsert(true))
	}

	err := c.save(ctx, "plugins", models, cluster, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveNamespaces(ctx context.Context, cluster string, namespaces []string) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveNamespaces")
	span.SetAttributes(attribute.Key("cluster").String(cluster))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, n := range namespaces {
		namespace := Namespace{
			ID:        fmt.Sprintf("/cluster/%s/namespace/%s", cluster, n),
			Namespace: n,
			Cluster:   cluster,
			UpdatedAt: updatedAt,
		}

		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: namespace.ID}}).SetReplacement(namespace).SetUpsert(true))
	}

	err := c.save(ctx, "namespaces", models, cluster, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveCRDs(ctx context.Context, crds []kubernetes.CRD) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveCRDs")
	defer span.End()

	var models []mongo.WriteModel
	updatedAtTime := time.Now()
	updatedAt := updatedAtTime.Unix()

	for _, crd := range crds {
		crd.UpdatedAt = updatedAt
		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: crd.ID}}).SetReplacement(crd).SetUpsert(true))
	}

	err := c.save(ctx, "crds", models, "", updatedAtTime.Add(time.Duration(-72*time.Hour)).Unix())
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveApplications(ctx context.Context, cluster string, applications []applicationv1.ApplicationSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveApplications")
	span.SetAttributes(attribute.Key("cluster").String(cluster))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, a := range applications {
		a.UpdatedAt = updatedAt
		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: a.ID}}).SetReplacement(a).SetUpsert(true))
	}

	err := c.save(ctx, "applications", models, cluster, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveDashboards(ctx context.Context, cluster string, dashboards []dashboardv1.DashboardSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveDashboards")
	span.SetAttributes(attribute.Key("cluster").String(cluster))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, d := range dashboards {
		d.UpdatedAt = updatedAt
		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: d.ID}}).SetReplacement(d).SetUpsert(true))
	}

	err := c.save(ctx, "dashboards", models, cluster, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveTeams(ctx context.Context, cluster string, teams []teamv1.TeamSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveTeams")
	span.SetAttributes(attribute.Key("cluster").String(cluster))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, t := range teams {
		t.UpdatedAt = updatedAt
		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: t.ID}}).SetReplacement(t).SetUpsert(true))
	}

	err := c.save(ctx, "teams", models, cluster, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveUsers(ctx context.Context, cluster string, users []userv1.UserSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveUsers")
	span.SetAttributes(attribute.Key("cluster").String(cluster))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, u := range users {
		u.UpdatedAt = updatedAt
		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: u.ID}}).SetReplacement(u).SetUpsert(true))
	}

	err := c.save(ctx, "users", models, cluster, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveTags(ctx context.Context, applications []applicationv1.ApplicationSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveTags")
	defer span.End()

	var models []mongo.WriteModel
	updatedAtTime := time.Now()
	updatedAt := updatedAtTime.Unix()

	for _, a := range applications {
		for _, t := range a.Tags {
			tag := Tag{
				ID:        fmt.Sprintf("/tag/%s", t),
				Tag:       t,
				UpdatedAt: updatedAt,
			}

			models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: tag.ID}}).SetReplacement(tag).SetUpsert(true))
		}
	}

	err := c.save(ctx, "tags", models, "", updatedAtTime.Add(time.Duration(-72*time.Hour)).Unix())
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveTopology(ctx context.Context, cluster string, applications []applicationv1.ApplicationSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveTopology")
	span.SetAttributes(attribute.Key("cluster").String(cluster))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, a := range applications {
		for _, dependency := range a.Topology.Dependencies {
			sourceID := fmt.Sprintf("/cluster/%s/namespace/%s/name/%s", a.Cluster, a.Namespace, a.Name)
			targetID := fmt.Sprintf("/cluster/%s/namespace/%s/name/%s", dependency.Cluster, dependency.Namespace, dependency.Name)

			t := Topology{
				ID:                  fmt.Sprintf("%s---%s", sourceID, targetID),
				SourceID:            sourceID,
				SourceCluster:       a.Cluster,
				SourceNamespace:     a.Namespace,
				SourceName:          a.Name,
				TargetID:            targetID,
				TargetCluster:       dependency.Cluster,
				TargetNamespace:     dependency.Namespace,
				TargetName:          dependency.Name,
				TopologyExternal:    a.Topology.External,
				TopologyDescription: dependency.Description,
				UpdatedAt:           updatedAt,
			}

			models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: t.ID}}).SetReplacement(t).SetUpsert(true))
		}
	}

	_, err := c.db.Database("kobs").Collection("topology").BulkWrite(ctx, models)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	_, err = c.db.Database("kobs").Collection("topology").DeleteMany(ctx, bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "sourcecluster", Value: bson.D{{Key: "$eq", Value: cluster}}}}, bson.D{{Key: "updatedat", Value: bson.D{{Key: "$lt", Value: updatedAt}}}}}}})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) GetPlugins(ctx context.Context) ([]plugin.Instance, error) {
	_, span := c.tracer.Start(ctx, "store.GetPlugins")
	defer span.End()

	var plugins []plugin.Instance

	cursor, err := c.db.Database("kobs").Collection("plugins").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &plugins)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return plugins, nil
}

func (c *client) GetNamespaces(ctx context.Context) ([]Namespace, error) {
	_, span := c.tracer.Start(ctx, "store.GetNamespaces")
	defer span.End()

	var namespaces []Namespace

	cursor, err := c.db.Database("kobs").Collection("namespaces").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &namespaces)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return namespaces, nil
}

func (c *client) GetNamespacesByClusters(ctx context.Context, clusters []string) ([]Namespace, error) {
	_, span := c.tracer.Start(ctx, "store.GetNamespacesByClusters")
	span.SetAttributes(attribute.Key("clusters").StringSlice(clusters))
	defer span.End()

	if len(clusters) == 0 {
		return nil, nil
	}

	var namespaces []Namespace

	cursor, err := c.db.Database("kobs").Collection("namespaces").Find(ctx, bson.D{{Key: "cluster", Value: bson.D{{Key: "$in", Value: clusters}}}}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &namespaces)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return namespaces, nil
}

func (c *client) GetCRDs(ctx context.Context) ([]kubernetes.CRD, error) {
	_, span := c.tracer.Start(ctx, "store.GetCRDs")
	defer span.End()

	var crds []kubernetes.CRD

	cursor, err := c.db.Database("kobs").Collection("crds").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &crds)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return crds, nil
}

func (c *client) GetCRDByID(ctx context.Context, id string) (*kubernetes.CRD, error) {
	_, span := c.tracer.Start(ctx, "store.GetCRDByID")
	span.SetAttributes(attribute.Key("id").String(id))
	defer span.End()

	var crd kubernetes.CRD

	result := c.db.Database("kobs").Collection("crds").FindOne(ctx, bson.D{{Key: "_id", Value: id}})
	if err := result.Err(); err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err := result.Decode(&crd)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return &crd, nil
}

func (c *client) GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetApplications")
	defer span.End()

	var applications []applicationv1.ApplicationSpec

	cursor, err := c.db.Database("kobs").Collection("applications").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &applications)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return applications, nil
}

func (c *client) GetApplicationsByFilter(ctx context.Context, teams, clusters, namespaces, tags []string, searchTerm, external string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetApplicationsByFilter")
	span.SetAttributes(attribute.Key("teams").StringSlice(teams))
	span.SetAttributes(attribute.Key("clusters").StringSlice(clusters))
	span.SetAttributes(attribute.Key("namespaces").StringSlice(namespaces))
	span.SetAttributes(attribute.Key("tags").StringSlice(tags))
	span.SetAttributes(attribute.Key("searchTerm").String(searchTerm))
	span.SetAttributes(attribute.Key("external").String(external))
	span.SetAttributes(attribute.Key("limit").Int(limit))
	span.SetAttributes(attribute.Key("offset").Int(offset))
	defer span.End()

	var filter bson.M
	filter = make(bson.M)

	if searchTerm != "" {
		filter["name"] = bson.M{"$regex": primitive.Regex{Pattern: searchTerm, Options: "i"}}
	}

	if len(teams) > 0 {
		filter["teams"] = bson.M{"$in": teams}
	}

	if len(clusters) > 0 {
		filter["cluster"] = bson.M{"$in": clusters}
	}

	if len(namespaces) > 0 {
		filter["namespace"] = bson.M{"$in": namespaces}
	}

	if len(tags) > 0 {
		filter["tags"] = bson.M{"$in": tags}
	}

	if external == "exclude" {
		filter["topology.external"] = bson.M{"$eq": false}
	} else if external == "only" {
		filter["topology.external"] = bson.M{"$eq": true}
	}

	var applications []applicationv1.ApplicationSpec

	cursor, err := c.db.Database("kobs").Collection("applications").Find(ctx, filter, options.Find().SetSort(bson.M{"name": 1}).SetLimit(int64(limit)).SetSkip(int64(offset)))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &applications)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return applications, nil
}

func (c *client) GetApplicationsByFilterCount(ctx context.Context, teams, clusters, namespaces, tags []string, searchTerm, external string) (int, error) {
	_, span := c.tracer.Start(ctx, "store.GetApplicationsByFilterCount")
	span.SetAttributes(attribute.Key("teams").StringSlice(teams))
	span.SetAttributes(attribute.Key("clusters").StringSlice(clusters))
	span.SetAttributes(attribute.Key("namespaces").StringSlice(namespaces))
	span.SetAttributes(attribute.Key("tags").StringSlice(tags))
	span.SetAttributes(attribute.Key("searchTerm").String(searchTerm))
	span.SetAttributes(attribute.Key("external").String(external))
	defer span.End()

	var filter bson.M
	filter = make(bson.M)

	if searchTerm != "" {
		filter["name"] = bson.M{"$regex": primitive.Regex{Pattern: searchTerm, Options: "i"}}
	}

	if len(teams) > 0 {
		filter["teams"] = bson.M{"$in": teams}
	}

	if len(clusters) > 0 {
		filter["cluster"] = bson.M{"$in": clusters}
	}

	if len(namespaces) > 0 {
		filter["namespace"] = bson.M{"$in": namespaces}
	}

	if len(tags) > 0 {
		filter["tags"] = bson.M{"$in": tags}
	}

	if external == "exclude" {
		filter["topology.external"] = bson.M{"$eq": false}
	} else if external == "only" {
		filter["topology.external"] = bson.M{"$eq": true}
	}

	count, err := c.db.Database("kobs").Collection("applications").CountDocuments(ctx, filter)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return 0, err
	}

	return int(count), nil
}

func (c *client) GetApplicationByID(ctx context.Context, id string) (*applicationv1.ApplicationSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetApplicationByID")
	span.SetAttributes(attribute.Key("id").String(id))
	defer span.End()

	var application applicationv1.ApplicationSpec

	result := c.db.Database("kobs").Collection("applications").FindOne(ctx, bson.D{{Key: "_id", Value: id}})
	if err := result.Err(); err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err := result.Decode(&application)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return &application, nil
}

func (c *client) GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetDashboards")
	defer span.End()

	var dashboards []dashboardv1.DashboardSpec

	cursor, err := c.db.Database("kobs").Collection("dashboards").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &dashboards)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return dashboards, nil
}

func (c *client) GetDashboardByID(ctx context.Context, id string) (*dashboardv1.DashboardSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetDashboardByID")
	span.SetAttributes(attribute.Key("id").String(id))
	defer span.End()

	var dashboard dashboardv1.DashboardSpec

	result := c.db.Database("kobs").Collection("dashboards").FindOne(ctx, bson.D{{Key: "_id", Value: id}})
	if err := result.Err(); err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err := result.Decode(&dashboard)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return &dashboard, nil
}

func (c *client) GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetTeams")
	defer span.End()

	var teams []teamv1.TeamSpec

	cursor, err := c.db.Database("kobs").Collection("teams").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "group", Value: 1}}))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &teams)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return teams, nil
}

func (c *client) GetTeamsByIDs(ctx context.Context, ids []string) ([]teamv1.TeamSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetTeamsByIDs")
	span.SetAttributes(attribute.Key("ids").StringSlice(ids))
	defer span.End()

	if len(ids) == 0 {
		return nil, nil
	}

	var teams []teamv1.TeamSpec

	cursor, err := c.db.Database("kobs").Collection("teams").Find(ctx, bson.D{{Key: "_id", Value: bson.D{{Key: "$in", Value: ids}}}}, options.Find().SetSort(bson.D{{Key: "group", Value: 1}}))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &teams)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return teams, nil
}

func (c *client) GetTeamByID(ctx context.Context, id string) (*teamv1.TeamSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetTeamByID")
	span.SetAttributes(attribute.Key("id").String(id))
	defer span.End()

	var team teamv1.TeamSpec

	result := c.db.Database("kobs").Collection("teams").FindOne(ctx, bson.D{{Key: "_id", Value: id}})
	if err := result.Err(); err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err := result.Decode(&team)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return &team, nil
}

func (c *client) GetUsers(ctx context.Context) ([]userv1.UserSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetUsers")
	defer span.End()

	var users []userv1.UserSpec

	cursor, err := c.db.Database("kobs").Collection("users").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &users)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return users, nil
}

func (c *client) GetUserByID(ctx context.Context, id string) (*userv1.UserSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetUserByID")
	span.SetAttributes(attribute.Key("id").String(id))
	defer span.End()

	var user userv1.UserSpec

	result := c.db.Database("kobs").Collection("users").FindOne(ctx, bson.D{{Key: "_id", Value: id}})
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err := result.Decode(&user)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return &user, nil
}

func (c *client) GetTags(ctx context.Context) ([]Tag, error) {
	_, span := c.tracer.Start(ctx, "store.GetTags")
	defer span.End()

	var tags []Tag

	cursor, err := c.db.Database("kobs").Collection("tags").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "tag", Value: 1}}))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &tags)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return tags, nil
}

func (c *client) GetTopologyByIDs(ctx context.Context, field string, ids []string) ([]Topology, error) {
	_, span := c.tracer.Start(ctx, "store.GetTopologyByIDs")
	span.SetAttributes(attribute.Key("field").String(field))
	span.SetAttributes(attribute.Key("ids").StringSlice(ids))
	defer span.End()

	var topology []Topology

	cursor, err := c.db.Database("kobs").Collection("topology").Find(ctx, bson.D{{Key: strings.ToLower(field), Value: bson.D{{Key: "$in", Value: ids}}}})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &topology)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return topology, nil
}
