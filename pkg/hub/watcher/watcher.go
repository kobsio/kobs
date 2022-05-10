package watcher

import (
	"context"
	"time"

	"github.com/kobsio/kobs/pkg/hub/satellites"
	"github.com/kobsio/kobs/pkg/hub/satellites/satellite"
	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/kobsio/kobs/pkg/hub/watcher/worker"
	"github.com/kobsio/kobs/pkg/log"

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

	for _, s := range c.satellitesClient.GetSatellites() {
		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, cancel := context.WithTimeout(log.ContextWithValue(context.Background(), zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				plugins, err := s.GetPlugins(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "plugins", err, startTime)
					return
				}

				err = c.storeClient.SavePlugins(ctx, s.GetName(), plugins)
				if err != nil {
					instrument(ctx, s.GetName(), "plugins", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "plugins", nil, startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, cancel := context.WithTimeout(log.ContextWithValue(context.Background(), zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				clusters, err := s.GetClusters(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "clusters", err, startTime)
					return
				}

				err = c.storeClient.SaveClusters(ctx, s.GetName(), clusters)
				if err != nil {
					instrument(ctx, s.GetName(), "clusters", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "clusters", nil, startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, cancel := context.WithTimeout(log.ContextWithValue(context.Background(), zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				namespaces, err := s.GetNamespaces(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "clusters", err, startTime)
					return
				}

				err = c.storeClient.SaveNamespaces(ctx, s.GetName(), namespaces)
				if err != nil {
					instrument(ctx, s.GetName(), "clusters", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "clusters", nil, startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, cancel := context.WithTimeout(log.ContextWithValue(context.Background(), zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				applications, err := s.GetApplications(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "applications", err, startTime)
					return
				}

				err = c.storeClient.SaveApplications(ctx, s.GetName(), applications)
				if err != nil {
					instrument(ctx, s.GetName(), "applications", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "applications", nil, startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, cancel := context.WithTimeout(log.ContextWithValue(context.Background(), zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				dashboards, err := s.GetDashboards(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "dashboards", err, startTime)
					return
				}

				err = c.storeClient.SaveDashboards(ctx, s.GetName(), dashboards)
				if err != nil {
					instrument(ctx, s.GetName(), "dashboards", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "dashboards", nil, startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, cancel := context.WithTimeout(log.ContextWithValue(context.Background(), zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				teams, err := s.GetTeams(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "teams", err, startTime)
					return
				}

				err = c.storeClient.SaveTeams(ctx, s.GetName(), teams)
				if err != nil {
					instrument(ctx, s.GetName(), "teams", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "teams", nil, startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				ctx, cancel := context.WithTimeout(log.ContextWithValue(context.Background(), zap.Time("startTime", startTime)), 30*time.Second)
				defer cancel()

				users, err := s.GetUsers(ctx)
				if err != nil {
					instrument(ctx, s.GetName(), "users", err, startTime)
					return
				}

				err = c.storeClient.SaveUsers(ctx, s.GetName(), users)
				if err != nil {
					instrument(ctx, s.GetName(), "users", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "users", nil, startTime)
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
	}

	go client.watch()

	return client, nil
}
