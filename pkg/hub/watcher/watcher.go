package watcher

import (
	"context"
	"time"

	"github.com/kobsio/kobs/pkg/hub/satellites"
	"github.com/kobsio/kobs/pkg/hub/satellites/satellite"
	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/kobsio/kobs/pkg/hub/watcher/worker"
	"github.com/kobsio/kobs/pkg/log"

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

// Client is the interface which must be implemented by a watcher client.
type Client interface {
	Watch()
	Stop() error
}

// client implements the Client interface. It contains a http client which can be used to make the requests to the
// satellites, an interval which defines the time between each sync with the satellites, a worker pool and a store, to
// save the requested resources.
type client struct {
	interval         time.Duration
	workerPool       worker.Pool
	satellitesClient satellites.Client
	storeClient      store.Client
	tracer           trace.Tracer
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

// watch is the internal watch method of the watcher. It loops through all configured satellites and adds a task for
// each resource (clusters, plugins, applications, dashboards, teams and users) to the worker pool.
func (c *client) watch() {
	startTime := time.Now()
	ss := c.satellitesClient.GetSatellites()

	ctx, span := c.tracer.Start(context.Background(), "watcher")
	defer span.End()

	for _, s := range ss {
		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.plugins")
				span.SetAttributes(attribute.Key("satellite").String(s.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				plugins, err := s.GetPlugins(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "plugins", err, len(plugins), startTime)
					return
				}

				err = c.storeClient.SavePlugins(ctx, s.GetName(), plugins)
				if err != nil {
					instrument(ctx, s.GetName(), "plugins", err, len(plugins), startTime)
					return
				}

				instrument(ctx, s.GetName(), "plugins", nil, len(plugins), startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.clusters")
				span.SetAttributes(attribute.Key("satellite").String(s.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				clusters, err := s.GetClusters(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "clusters", err, len(clusters), startTime)
					return
				}

				err = c.storeClient.SaveClusters(ctx, s.GetName(), clusters)
				if err != nil {
					instrument(ctx, s.GetName(), "clusters", err, len(clusters), startTime)
					return
				}

				instrument(ctx, s.GetName(), "clusters", nil, len(clusters), startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.namespaces")
				span.SetAttributes(attribute.Key("satellite").String(s.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				namespaces, err := s.GetNamespaces(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "namespaces", err, len(namespaces), startTime)
					return
				}

				err = c.storeClient.SaveNamespaces(ctx, s.GetName(), namespaces)
				if err != nil {
					instrument(ctx, s.GetName(), "namespaces", err, len(namespaces), startTime)
					return
				}

				instrument(ctx, s.GetName(), "namespaces", nil, len(namespaces), startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.crds")
				span.SetAttributes(attribute.Key("satellite").String(s.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				crds, err := s.GetCRDs(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "crds", err, len(crds), startTime)
					return
				}

				err = c.storeClient.SaveCRDs(ctx, crds)
				if err != nil {
					instrument(ctx, s.GetName(), "crds", err, len(crds), startTime)
					return
				}

				instrument(ctx, s.GetName(), "crds", nil, len(crds), startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.applications")
				span.SetAttributes(attribute.Key("satellite").String(s.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				applications, err := s.GetApplications(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "applications", err, len(applications), startTime)
					return
				}

				err = c.storeClient.SaveApplications(ctx, s.GetName(), applications)
				if err != nil {
					instrument(ctx, s.GetName(), "applications", err, len(applications), startTime)
					return
				}

				err = c.storeClient.SaveTags(ctx, applications)
				if err != nil {
					instrument(ctx, s.GetName(), "tags", err, len(applications), startTime)
					return
				}

				instrument(ctx, s.GetName(), "applications", nil, len(applications), startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.dashboards")
				span.SetAttributes(attribute.Key("satellite").String(s.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				dashboards, err := s.GetDashboards(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "dashboards", err, len(dashboards), startTime)
					return
				}

				err = c.storeClient.SaveDashboards(ctx, s.GetName(), dashboards)
				if err != nil {
					instrument(ctx, s.GetName(), "dashboards", err, len(dashboards), startTime)
					return
				}

				instrument(ctx, s.GetName(), "dashboards", nil, len(dashboards), startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.teams")
				span.SetAttributes(attribute.Key("satellite").String(s.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				teams, err := s.GetTeams(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "teams", err, len(teams), startTime)
					return
				}

				err = c.storeClient.SaveTeams(ctx, s.GetName(), teams)
				if err != nil {
					instrument(ctx, s.GetName(), "teams", err, len(teams), startTime)
					return
				}

				instrument(ctx, s.GetName(), "teams", nil, len(teams), startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, span := c.tracer.Start(ctx, "watcher.users")
				span.SetAttributes(attribute.Key("satellite").String(s.GetName()))
				defer span.End()

				ctx, cancel := context.WithTimeout(log.ContextWithValue(ctx, zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				users, err := s.GetUsers(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "users", err, len(users), startTime)
					return
				}

				err = c.storeClient.SaveUsers(ctx, s.GetName(), users)
				if err != nil {
					instrument(ctx, s.GetName(), "users", err, len(users), startTime)
					return
				}

				instrument(ctx, s.GetName(), "users", nil, len(users), startTime)
			}))
		}(s)
	}
}

// NewClient returns a new watcher. To create the watcher a interval, the number of workers in the worker pool, the
// satellites and a store is needed.
func NewClient(interval time.Duration, numberOfWorker int64, satellitesClient satellites.Client, storeClient store.Client) (Client, error) {
	workerPool, err := worker.NewPool(numberOfWorker)
	if err != nil {
		return nil, err
	}

	client := &client{
		interval:         interval,
		workerPool:       workerPool,
		satellitesClient: satellitesClient,
		storeClient:      storeClient,
		tracer:           otel.Tracer("watcher"),
	}

	go client.watch()

	return client, nil
}
