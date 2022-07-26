package mongodb

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/hub/store/shared"
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

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

type client struct {
	store  *mongo.Client
	tracer trace.Tracer
}

func NewClient(uri string) (*client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	store, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	if err := store.Ping(ctx, readpref.Primary()); err != nil {
		return nil, err
	}

	return &client{
		store:  store,
		tracer: otel.Tracer("store"),
	}, nil
}

func (c *client) save(ctx context.Context, collection string, models []mongo.WriteModel, satellite string, updatedAt int64) error {
	_, err := c.store.Database("kobs").Collection(collection).BulkWrite(ctx, models)
	if err != nil {
		return err
	}

	filter := bson.D{{Key: "updatedat", Value: bson.D{{Key: "$lt", Value: updatedAt}}}}
	if satellite != "" {
		filter = bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "satellite", Value: bson.D{{Key: "$eq", Value: satellite}}}}, filter}}}
	}

	_, err = c.store.Database("kobs").Collection(collection).DeleteMany(ctx, filter)
	if err != nil {
		return err
	}

	return nil
}

func (c *client) SavePlugins(ctx context.Context, satellite string, plugins []plugin.Instance) error {
	ctx, span := c.tracer.Start(ctx, "store.SavePlugins")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("satellite").String(satellite))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, p := range plugins {
		p.ID = fmt.Sprintf("/satellite/%s/type/%s/name/%s", satellite, p.Type, p.Name)
		p.Satellite = satellite
		p.UpdatedAt = updatedAt

		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: p.ID}}).SetReplacement(p).SetUpsert(true))
	}

	err := c.save(ctx, "plugins", models, satellite, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveClusters(ctx context.Context, satellite string, clusters []string) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveClusters")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("satellite").String(satellite))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, clusterName := range clusters {
		cluster := shared.Cluster{
			ID:        fmt.Sprintf("/satellite/%s/cluster/%s", satellite, clusterName),
			Cluster:   clusterName,
			Satellite: satellite,
			UpdatedAt: updatedAt,
		}

		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: cluster.ID}}).SetReplacement(cluster).SetUpsert(true))
	}

	err := c.save(ctx, "clusters", models, satellite, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveNamespaces(ctx context.Context, satellite string, namespaces map[string][]string) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveNamespaces")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("satellite").String(satellite))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for k, v := range namespaces {
		for _, n := range v {
			namespace := shared.Namespace{
				ID:        fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s", satellite, k, n),
				Namespace: n,
				Cluster:   k,
				Satellite: satellite,
				ClusterID: fmt.Sprintf("/satellite/%s/cluster/%s", satellite, k),
				UpdatedAt: updatedAt,
			}

			models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: namespace.ID}}).SetReplacement(namespace).SetUpsert(true))
		}
	}

	err := c.save(ctx, "namespaces", models, satellite, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveCRDs(ctx context.Context, crds []cluster.CRD) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveCRDs")
	span.SetAttributes(attribute.Key("store").String("bolt"))
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

func (c *client) SaveApplications(ctx context.Context, satellite string, applications []applicationv1.ApplicationSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveApplications")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("satellite").String(satellite))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, a := range applications {
		a.ID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s/name/%s", satellite, a.Cluster, a.Namespace, a.Name)
		a.Satellite = satellite
		a.UpdatedAt = updatedAt
		a.ClusterID = fmt.Sprintf("/satellite/%s/cluster/%s", satellite, a.Cluster)
		a.NamespaceID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s", satellite, a.Cluster, a.Namespace)

		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: a.ID}}).SetReplacement(shared.SetSatelliteForApplication(a, satellite)).SetUpsert(true))
	}

	err := c.save(ctx, "applications", models, satellite, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveDashboards(ctx context.Context, satellite string, dashboards []dashboardv1.DashboardSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveDashboards")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("satellite").String(satellite))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, d := range dashboards {
		d.ID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s/name/%s", satellite, d.Cluster, d.Namespace, d.Name)
		d.Satellite = satellite
		d.UpdatedAt = updatedAt
		d.ClusterID = fmt.Sprintf("/satellite/%s/cluster/%s", satellite, d.Cluster)
		d.NamespaceID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s", satellite, d.Cluster, d.Namespace)

		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: d.ID}}).SetReplacement(shared.SetSatelliteForDashboard(d, satellite)).SetUpsert(true))
	}

	err := c.save(ctx, "dashboards", models, satellite, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveTeams(ctx context.Context, satellite string, teams []teamv1.TeamSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveTeams")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("satellite").String(satellite))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, t := range teams {
		t.ID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s/name/%s", satellite, t.Cluster, t.Namespace, t.Name)
		t.Satellite = satellite
		t.UpdatedAt = updatedAt
		t.ClusterID = fmt.Sprintf("/satellite/%s/cluster/%s", satellite, t.Cluster)
		t.NamespaceID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s", satellite, t.Cluster, t.Namespace)

		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: t.ID}}).SetReplacement(shared.SetSatelliteForTeam(t, satellite)).SetUpsert(true))
	}

	err := c.save(ctx, "teams", models, satellite, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveUsers(ctx context.Context, satellite string, users []userv1.UserSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveUsers")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("satellite").String(satellite))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, u := range users {
		u.ID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s/name/%s", satellite, u.Cluster, u.Namespace, u.Name)
		u.Satellite = satellite
		u.UpdatedAt = updatedAt
		u.ClusterID = fmt.Sprintf("/satellite/%s/cluster/%s", satellite, u.Cluster)
		u.NamespaceID = fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s", satellite, u.Cluster, u.Namespace)

		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: u.ID}}).SetReplacement(shared.SetSatelliteForUser(u, satellite)).SetUpsert(true))
	}

	err := c.save(ctx, "users", models, satellite, updatedAt)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) SaveTags(ctx context.Context, applications []applicationv1.ApplicationSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveTags")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	defer span.End()

	var models []mongo.WriteModel
	updatedAtTime := time.Now()
	updatedAt := updatedAtTime.Unix()

	for _, a := range applications {
		for _, t := range a.Tags {
			tag := shared.Tag{
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

func (c *client) SaveTopology(ctx context.Context, satellite string, applications []applicationv1.ApplicationSpec) error {
	ctx, span := c.tracer.Start(ctx, "store.SaveTopology")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("satellite").String(satellite))
	defer span.End()

	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, a := range applications {
		for _, dependency := range a.Topology.Dependencies {
			dependencySatellite := dependency.Satellite
			if dependencySatellite == "" {
				dependencySatellite = satellite
			}

			sourceID := fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s/name/%s", satellite, a.Cluster, a.Namespace, a.Name)
			targetID := fmt.Sprintf("/satellite/%s/cluster/%s/namespace/%s/name/%s", dependencySatellite, dependency.Cluster, dependency.Namespace, dependency.Name)

			t := shared.Topology{
				ID:                  fmt.Sprintf("%s---%s", sourceID, targetID),
				SourceID:            sourceID,
				SourceSatellite:     satellite,
				SourceCluster:       a.Cluster,
				SourceNamespace:     a.Namespace,
				SourceName:          a.Name,
				TargetID:            targetID,
				TargetSatellite:     dependencySatellite,
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

	_, err := c.store.Database("kobs").Collection("topology").BulkWrite(ctx, models)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	_, err = c.store.Database("kobs").Collection("topology").DeleteMany(ctx, bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "sourcesatellite", Value: bson.D{{Key: "$eq", Value: satellite}}}}, bson.D{{Key: "updatedat", Value: bson.D{{Key: "$lt", Value: updatedAt}}}}}}})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

func (c *client) GetPlugins(ctx context.Context) ([]plugin.Instance, error) {
	_, span := c.tracer.Start(ctx, "store.GetPlugins")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	defer span.End()

	var plugins []plugin.Instance

	cursor, err := c.store.Database("kobs").Collection("plugins").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
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

func (c *client) GetClusters(ctx context.Context) ([]shared.Cluster, error) {
	_, span := c.tracer.Start(ctx, "store.GetClusters")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	defer span.End()

	var clusters []shared.Cluster

	cursor, err := c.store.Database("kobs").Collection("clusters").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	err = cursor.All(ctx, &clusters)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return clusters, nil
}

func (c *client) GetNamespaces(ctx context.Context) ([]shared.Namespace, error) {
	_, span := c.tracer.Start(ctx, "store.GetNamespaces")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	defer span.End()

	var namespaces []shared.Namespace

	cursor, err := c.store.Database("kobs").Collection("namespaces").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
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

func (c *client) GetCRDs(ctx context.Context) ([]cluster.CRD, error) {
	_, span := c.tracer.Start(ctx, "store.GetCRDs")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	defer span.End()

	var crds []cluster.CRD

	cursor, err := c.store.Database("kobs").Collection("crds").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
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

func (c *client) GetCRDByID(ctx context.Context, id string) (*cluster.CRD, error) {
	_, span := c.tracer.Start(ctx, "store.GetCRDByID")
	span.SetAttributes(attribute.Key("id").String(id))
	span.SetAttributes(attribute.Key("store").String("bolt"))
	defer span.End()

	var crd cluster.CRD

	result := c.store.Database("kobs").Collection("crds").FindOne(ctx, bson.D{{Key: "_id", Value: id}})
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

func (c *client) GetNamespacesByClusterIDs(ctx context.Context, clusterIDs []string) ([]shared.Namespace, error) {
	_, span := c.tracer.Start(ctx, "store.GetNamespacesByClusterIDs")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("clusterIDs").StringSlice(clusterIDs))
	defer span.End()

	if len(clusterIDs) == 0 {
		return nil, nil
	}

	var namespaces []shared.Namespace

	cursor, err := c.store.Database("kobs").Collection("namespaces").Find(ctx, bson.D{{Key: "clusterid", Value: bson.D{{Key: "$in", Value: clusterIDs}}}}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
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

func (c *client) GetApplications(ctx context.Context) ([]applicationv1.ApplicationSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetApplications")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	defer span.End()

	var applications []applicationv1.ApplicationSpec

	cursor, err := c.store.Database("kobs").Collection("applications").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
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

func (c *client) GetApplicationsByFilter(ctx context.Context, teams, clusterIDs, namespaceIDs, tags []string, searchTerm, external string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetApplicationsByFilter")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("teams").StringSlice(teams))
	span.SetAttributes(attribute.Key("clusterIDs").StringSlice(clusterIDs))
	span.SetAttributes(attribute.Key("namespaceIDs").StringSlice(namespaceIDs))
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

	if len(clusterIDs) > 0 {
		filter["clusterid"] = bson.M{"$in": clusterIDs}
	}

	if len(namespaceIDs) > 0 {
		filter["namespaceid"] = bson.M{"$in": namespaceIDs}
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

	cursor, err := c.store.Database("kobs").Collection("applications").Find(ctx, filter, options.Find().SetSort(bson.M{"name": 1}).SetLimit(int64(limit)).SetSkip(int64(offset)))
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

func (c *client) GetApplicationsByFilterCount(ctx context.Context, teams, clusterIDs, namespaceIDs, tags []string, searchTerm, external string) (int, error) {
	_, span := c.tracer.Start(ctx, "store.GetApplicationsByFilterCount")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("teams").StringSlice(teams))
	span.SetAttributes(attribute.Key("clusterIDs").StringSlice(clusterIDs))
	span.SetAttributes(attribute.Key("namespaceIDs").StringSlice(namespaceIDs))
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

	if len(clusterIDs) > 0 {
		filter["clusterid"] = bson.M{"$in": clusterIDs}
	}

	if len(namespaceIDs) > 0 {
		filter["namespaceid"] = bson.M{"$in": namespaceIDs}
	}

	if len(tags) > 0 {
		filter["tags"] = bson.M{"$in": tags}
	}

	if external == "exclude" {
		filter["topology.external"] = bson.M{"$eq": false}
	} else if external == "only" {
		filter["topology.external"] = bson.M{"$eq": true}
	}

	count, err := c.store.Database("kobs").Collection("applications").CountDocuments(ctx, filter)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return 0, err
	}

	return int(count), nil
}

func (c *client) GetApplicationByID(ctx context.Context, id string) (*applicationv1.ApplicationSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetApplicationByID")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("id").String(id))
	defer span.End()

	var application applicationv1.ApplicationSpec

	result := c.store.Database("kobs").Collection("applications").FindOne(ctx, bson.D{{Key: "_id", Value: id}})
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
	span.SetAttributes(attribute.Key("store").String("bolt"))
	defer span.End()

	var dashboards []dashboardv1.DashboardSpec

	cursor, err := c.store.Database("kobs").Collection("dashboards").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
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
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("id").String(id))
	defer span.End()

	var dashboard dashboardv1.DashboardSpec

	result := c.store.Database("kobs").Collection("dashboards").FindOne(ctx, bson.D{{Key: "_id", Value: id}})
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
	span.SetAttributes(attribute.Key("store").String("bolt"))
	defer span.End()

	var teams []teamv1.TeamSpec

	cursor, err := c.store.Database("kobs").Collection("teams").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "group", Value: 1}}))
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

func (c *client) GetTeamsByGroups(ctx context.Context, groups []string) ([]teamv1.TeamSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetTeamsByGroups")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("groups").StringSlice(groups))
	defer span.End()

	if len(groups) == 0 {
		return nil, nil
	}

	var teams []teamv1.TeamSpec

	cursor, err := c.store.Database("kobs").Collection("teams").Find(ctx, bson.D{{Key: "group", Value: bson.D{{Key: "$in", Value: groups}}}}, options.Find().SetSort(bson.D{{Key: "group", Value: 1}}))
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

func (c *client) GetTeamByGroup(ctx context.Context, group string) (*teamv1.TeamSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetTeamByGroup")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("group").String(group))
	defer span.End()

	var teams []teamv1.TeamSpec

	cursor, err := c.store.Database("kobs").Collection("teams").Find(ctx, bson.D{{Key: "group", Value: group}})
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

	if len(teams) == 0 {
		span.RecordError(fmt.Errorf("team was not found"))
		span.SetStatus(codes.Error, "team was not found")
		return nil, fmt.Errorf("team was not found")
	}

	if len(teams) == 1 {
		return &teams[0], nil
	}

	team := teams[0]
	for i := 1; i < len(teams); i++ {
		team.Dashboards = append(team.Dashboards, teams[i].Dashboards...)
	}

	return &team, nil
}

func (c *client) GetUsers(ctx context.Context) ([]userv1.UserSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetUsers")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	defer span.End()

	var users []userv1.UserSpec

	cursor, err := c.store.Database("kobs").Collection("users").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
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

func (c *client) GetUsersByEmail(ctx context.Context, email string) ([]userv1.UserSpec, error) {
	_, span := c.tracer.Start(ctx, "store.GetUsersByEmail")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("email").String(email))
	defer span.End()

	var users []userv1.UserSpec

	cursor, err := c.store.Database("kobs").Collection("users").Find(ctx, bson.D{{Key: "email", Value: email}})
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

func (c *client) GetTags(ctx context.Context) ([]shared.Tag, error) {
	_, span := c.tracer.Start(ctx, "store.GetTags")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	defer span.End()

	var tags []shared.Tag

	cursor, err := c.store.Database("kobs").Collection("tags").Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: "tag", Value: 1}}))
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

func (c *client) GetTopologyByIDs(ctx context.Context, field string, ids []string) ([]shared.Topology, error) {
	_, span := c.tracer.Start(ctx, "store.GetTopologyByTargetIDs")
	span.SetAttributes(attribute.Key("store").String("bolt"))
	span.SetAttributes(attribute.Key("field").String(field))
	span.SetAttributes(attribute.Key("ids").StringSlice(ids))
	defer span.End()

	var topology []shared.Topology

	cursor, err := c.store.Database("kobs").Collection("topology").Find(ctx, bson.D{{Key: strings.ToLower(field), Value: bson.D{{Key: "$in", Value: ids}}}})
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
