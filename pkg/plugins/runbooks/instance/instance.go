package instance

//go:generate mockgen -source=instance.go -destination=./instance_mock.go -package=instance Instance

import (
	"context"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"

	"github.com/mitchellh/mapstructure"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

// Config is the structure of the configuration for a single SonarQube instance.
type Config struct {
	Path     string `json:"path"`
	Resource string `json:"resource"`
}

// Instance is the interface which must be implemented by a single SonarQube instance.
type Instance interface {
	GetName() string
	GetRunbooks(ctx context.Context, query, alert, group string) ([]Runbook, error)
	SyncRunbooks(ctx context.Context) error
}

type instance struct {
	name           string
	config         Config
	clustersClient clusters.Client
	dbClient       db.Client
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) GetRunbooks(ctx context.Context, query, alert, group string) ([]Runbook, error) {
	var runbooks []Runbook

	filter := make(bson.M)
	if alert != "" && group != "" {
		filter["_id"] = bson.M{"$eq": fmt.Sprintf("/group/%s/alert/%s", group, alert)}
	} else if group != "" {
		filter["group"] = bson.M{"$eq": group}
	} else if query != "" {
		filter["$text"] = bson.M{"$search": query}
	}

	cursor, err := i.dbClient.DB().Database("kobs").Collection("runbooks").Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	err = cursor.All(ctx, &runbooks)
	if err != nil {
		return nil, err
	}

	sort.Slice(runbooks, func(i, j int) bool {
		return strings.ToLower(runbooks[i].ID) < strings.ToLower(runbooks[j].ID)
	})

	return runbooks, nil
}

func (i *instance) SyncRunbooks(ctx context.Context) error {
	var models []mongo.WriteModel
	updatedAt := time.Now().Unix()

	for _, clusterClient := range i.clustersClient.GetClusters() {
		res, err := clusterClient.Request(ctx, http.MethodGet, fmt.Sprintf("/api/resources?path=%s&resource=%s", i.config.Path, i.config.Resource), nil)
		if err != nil {
			log.Error(ctx, "Failed to sync runbooks", zap.Error(err), zap.String("cluster", clusterClient.GetName()))
		} else {
			var prometheusRuleList PrometheusRuleList
			err := mapstructure.Decode(res, &prometheusRuleList)
			if err != nil {
				log.Error(ctx, "Failed to decode runbooks", zap.Error(err), zap.String("cluster", clusterClient.GetName()))
			} else {
				for _, prometheusRule := range prometheusRuleList.Items {
					for _, ruleGroup := range prometheusRule.Spec.Groups {
						for _, rule := range ruleGroup.Rules {
							runbook := Runbook{
								ID:        fmt.Sprintf("/group/%s/alert/%s", ruleGroup.Name, rule.Alert),
								Alert:     rule.Alert,
								Group:     ruleGroup.Name,
								Expr:      rule.Expr,
								Severity:  rule.Labels["severity"],
								Message:   rule.Annotations["message"],
								Runbook:   rule.Annotations["runbook"],
								UpdatedAt: updatedAt,
							}

							models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.D{{Key: "_id", Value: runbook.ID}}).SetReplacement(runbook).SetUpsert(true))
						}
					}
				}
			}
		}
	}

	_, err := i.dbClient.DB().Database("kobs").Collection("runbooks").BulkWrite(ctx, models)
	if err != nil {
		return err
	}

	_, err = i.dbClient.DB().Database("kobs").Collection("runbooks").DeleteMany(ctx, bson.D{{Key: "updatedAt", Value: bson.D{{Key: "$lt", Value: updatedAt}}}})
	if err != nil {
		return err
	}

	_, err = i.dbClient.DB().Database("kobs").Collection("runbooks").Indexes().CreateOne(ctx, mongo.IndexModel{Keys: bson.D{{Key: "alert", Value: "text"}, {Key: "message", Value: "text"}, {Key: "runbook", Value: "text"}}})
	if err != nil {
		return err
	}

	return nil
}

func New(name string, options map[string]any, clustersClient clusters.Client, dbClient db.Client) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	return &instance{
		name:           name,
		config:         config,
		clustersClient: clustersClient,
		dbClient:       dbClient,
	}, nil
}
