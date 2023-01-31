package watcher

import (
	"context"
	"time"

	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/clusters/cluster"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/hub/watcher/worker"
	"github.com/kobsio/kobs/pkg/instrument/log"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

// task implements the Task interface from the worker.
type task func()

func (r task) Do() {
	r()
}

type Config struct {
	Interval time.Duration `env:"INTERVAL" default:"300s" help:"Set the interval to sync all resources from the clusters to the hub."`
	Workers  int64         `env:"WORKERS" default:"10" help:"The number of workers (goroutines) to spawn for the sync process."`
}

// Client is the interface which must be implemented by a watcher client.
type Client interface {
	Watch()
	Stop() error
}

// client implements the Client interface. It contains a http client which can be used to make the requests to the
// clusters, an interval which defines the time between each sync with the clusters, a worker pool and a db client to
// save the requested resources.
type client struct {
	interval       time.Duration
	workerPool     worker.Pool
	clustersClient clusters.Client
	dbClient       db.Client
	tracer         trace.Tracer
}

// Watch triggers the internal watch function in the specified interval. This should be called in a new go routine.
func (c *client) Watch() {
	ticker := time.NewTicker(c.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			c.watch()
		}
	}
}

// Stop stops the worker pool of the watcher. If stopping the worker pool fails it returns an error.
func (c *client) Stop() error {
	return c.workerPool.Stop()
}

// watch is the internal watch method of the watcher. It loops through all configured clusters and adds a task for
// each resource (clusters, plugins, applications, dashboards, teams and users) to the worker pool.
func (c *client) watch() {
	startTime := time.Now()
	ctx, span := c.tracer.Start(context.Background(), "watcher")
	defer span.End()

	for _, cl := range c.clustersClient.GetClusters() {
		go func(cl cluster.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.plugins")
				span.SetAttributes(attribute.Key("cluster").String(cl.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				plugins, err := cl.GetPlugins(ctx)
				if err != nil {
					instrument(ctx, cl.GetName(), "plugins", err, len(plugins), startTime)
					return
				}

				err = c.dbClient.SavePlugins(ctx, cl.GetName(), plugins)
				if err != nil {
					instrument(ctx, cl.GetName(), "plugins", err, len(plugins), startTime)
					return
				}

				instrument(ctx, cl.GetName(), "plugins", nil, len(plugins), startTime)
			}))
		}(cl)

		go func(cl cluster.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.namespaces")
				span.SetAttributes(attribute.Key("cluster").String(cl.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				namespaces, err := cl.GetNamespaces(ctx)
				if err != nil {
					instrument(ctx, cl.GetName(), "namespaces", err, len(namespaces), startTime)
					return
				}

				err = c.dbClient.SaveNamespaces(ctx, cl.GetName(), namespaces)
				if err != nil {
					instrument(ctx, cl.GetName(), "namespaces", err, len(namespaces), startTime)
					return
				}

				instrument(ctx, cl.GetName(), "namespaces", nil, len(namespaces), startTime)
			}))
		}(cl)

		go func(cl cluster.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.crds")
				span.SetAttributes(attribute.Key("cluster").String(cl.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				crds, err := cl.GetCRDs(ctx)
				if err != nil {
					instrument(ctx, cl.GetName(), "crds", err, len(crds), startTime)
					return
				}

				err = c.dbClient.SaveCRDs(ctx, crds)
				if err != nil {
					instrument(ctx, cl.GetName(), "crds", err, len(crds), startTime)
					return
				}

				instrument(ctx, cl.GetName(), "crds", nil, len(crds), startTime)
			}))
		}(cl)

		go func(cl cluster.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.applications")
				span.SetAttributes(attribute.Key("cluster").String(cl.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				applications, err := cl.GetApplications(ctx)
				if err != nil {
					instrument(ctx, cl.GetName(), "applications", err, len(applications), startTime)
					return
				}

				err = c.dbClient.SaveApplications(ctx, cl.GetName(), applications)
				if err != nil {
					instrument(ctx, cl.GetName(), "applications", err, len(applications), startTime)
					return
				}

				err = c.dbClient.SaveTags(ctx, applications)
				if err != nil {
					instrument(ctx, cl.GetName(), "tags", err, len(applications), startTime)
					return
				}

				err = c.dbClient.SaveTopology(ctx, cl.GetName(), applications)
				if err != nil {
					instrument(ctx, cl.GetName(), "tags", err, len(applications), startTime)
					return
				}

				instrument(ctx, cl.GetName(), "applications", nil, len(applications), startTime)
			}))
		}(cl)

		go func(cl cluster.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.dashboards")
				span.SetAttributes(attribute.Key("cluster").String(cl.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				dashboards, err := cl.GetDashboards(ctx)
				if err != nil {
					instrument(ctx, cl.GetName(), "dashboards", err, len(dashboards), startTime)
					return
				}

				err = c.dbClient.SaveDashboards(ctx, cl.GetName(), dashboards)
				if err != nil {
					instrument(ctx, cl.GetName(), "dashboards", err, len(dashboards), startTime)
					return
				}

				instrument(ctx, cl.GetName(), "dashboards", nil, len(dashboards), startTime)
			}))
		}(cl)

		go func(cl cluster.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.teams")
				span.SetAttributes(attribute.Key("cluster").String(cl.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				teams, err := cl.GetTeams(ctx)
				if err != nil {
					instrument(ctx, cl.GetName(), "teams", err, len(teams), startTime)
					return
				}

				err = c.dbClient.SaveTeams(ctx, cl.GetName(), teams)
				if err != nil {
					instrument(ctx, cl.GetName(), "teams", err, len(teams), startTime)
					return
				}

				instrument(ctx, cl.GetName(), "teams", nil, len(teams), startTime)
			}))
		}(cl)

		go func(cl cluster.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.users")
				span.SetAttributes(attribute.Key("cluster").String(cl.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				users, err := cl.GetUsers(ctx)
				if err != nil {
					instrument(ctx, cl.GetName(), "users", err, len(users), startTime)
					return
				}

				err = c.dbClient.SaveUsers(ctx, cl.GetName(), users)
				if err != nil {
					instrument(ctx, cl.GetName(), "users", err, len(users), startTime)
					return
				}

				instrument(ctx, cl.GetName(), "users", nil, len(users), startTime)
			}))
		}(cl)
	}
}

// NewClient returns a new watcher. To create the watcher a interval, the number of workers in the worker pool, the
// clusters and a database client is needed.
func NewClient(config Config, clustersClient clusters.Client, dbClient db.Client) (Client, error) {
	workerPool, err := worker.NewPool(config.Workers)
	if err != nil {
		return nil, err
	}

	client := &client{
		interval:       config.Interval,
		workerPool:     workerPool,
		clustersClient: clustersClient,
		dbClient:       dbClient,
		tracer:         otel.Tracer("watcher"),
	}

	go client.watch()

	return client, nil
}
