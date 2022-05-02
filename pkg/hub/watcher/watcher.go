package watcher

import (
	"context"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/kobsio/kobs/pkg/hub/watcher/satellite"
	"github.com/kobsio/kobs/pkg/hub/watcher/worker"
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

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
	client      *http.Client
	interval    time.Duration
	workerPool  worker.Pool
	satellites  []satellite.Config
	storeClient store.Client
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
	ctx := log.ContextWithValue(context.Background(), zap.Time("startTime", startTime))

	for _, s := range c.satellites {
		go func(s satellite.Config) {
			c.workerPool.RunTask(task(func() {
				plugins, err := doRequest[plugin.Instance](ctx, c.client, s.Address+"/api/plugins", s.Token)
				if err != nil {
					instrument(ctx, s.Name, "plugins", err, startTime)
					return
				}

				err = c.storeClient.SavePlugins(s.Name, plugins)
				if err != nil {
					instrument(ctx, s.Name, "plugins", err, startTime)
					return
				}

				instrument(ctx, s.Name, "plugins", nil, startTime)
			}))
		}(s)

		go func(s satellite.Config) {
			c.workerPool.RunTask(task(func() {
				clusters, err := doRequest[string](ctx, c.client, s.Address+"/api/clusters", s.Token)
				if err != nil {
					instrument(ctx, s.Name, "clusters", err, startTime)
					return
				}

				err = c.storeClient.SaveClusters(s.Name, clusters)
				if err != nil {
					instrument(ctx, s.Name, "clusters", err, startTime)
					return
				}

				instrument(ctx, s.Name, "clusters", nil, startTime)
			}))
		}(s)

		go func(s satellite.Config) {
			c.workerPool.RunTask(task(func() {
				applications, err := doRequest[applicationv1.ApplicationSpec](ctx, c.client, s.Address+"/api/clusters/applications", s.Token)
				if err != nil {
					instrument(ctx, s.Name, "applications", err, startTime)
					return
				}

				err = c.storeClient.SaveApplications(s.Name, applications)
				if err != nil {
					instrument(ctx, s.Name, "applications", err, startTime)
					return
				}

				instrument(ctx, s.Name, "applications", nil, startTime)
			}))
		}(s)

		go func(s satellite.Config) {
			c.workerPool.RunTask(task(func() {
				dashboards, err := doRequest[dashboardv1.DashboardSpec](ctx, c.client, s.Address+"/api/clusters/dashboards", s.Token)
				if err != nil {
					instrument(ctx, s.Name, "dashboards", err, startTime)
					return
				}

				err = c.storeClient.SaveDashboards(s.Name, dashboards)
				if err != nil {
					instrument(ctx, s.Name, "dashboards", err, startTime)
					return
				}

				instrument(ctx, s.Name, "dashboards", nil, startTime)
			}))
		}(s)

		go func(s satellite.Config) {
			c.workerPool.RunTask(task(func() {
				teams, err := doRequest[teamv1.TeamSpec](ctx, c.client, s.Address+"/api/clusters/teams", s.Token)
				if err != nil {
					instrument(ctx, s.Name, "teams", err, startTime)
					return
				}

				err = c.storeClient.SaveTeams(s.Name, teams)
				if err != nil {
					instrument(ctx, s.Name, "teams", err, startTime)
					return
				}

				instrument(ctx, s.Name, "teams", nil, startTime)
			}))
		}(s)

		go func(s satellite.Config) {
			c.workerPool.RunTask(task(func() {
				users, err := doRequest[userv1.UserSpec](ctx, c.client, s.Address+"/api/clusters/users", s.Token)
				if err != nil {
					instrument(ctx, s.Name, "users", err, startTime)
					return
				}

				err = c.storeClient.SaveUsers(s.Name, users)
				if err != nil {
					instrument(ctx, s.Name, "users", err, startTime)
					return
				}

				instrument(ctx, s.Name, "users", nil, startTime)
			}))
		}(s)
	}
}

// NewClient returns a new watcher. To create the watcher a interval, the number of workers in the worker pool, the
// satellites and a store is needed.
func NewClient(interval time.Duration, numberOfWorker int64, satellites []satellite.Config, storeClient store.Client) (Client, error) {
	workerPool, err := worker.NewPool(numberOfWorker)
	if err != nil {
		return nil, err
	}

	client := &client{
		client: &http.Client{
			Timeout: 60 * time.Second,
		},
		interval:    interval,
		workerPool:  workerPool,
		satellites:  satellites,
		storeClient: storeClient,
	}

	go client.watch()

	return client, nil
}
