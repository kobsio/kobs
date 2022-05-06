package watcher

import (
	"context"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/hub/satellites"
	"github.com/kobsio/kobs/pkg/hub/satellites/satellite"
	"github.com/kobsio/kobs/pkg/hub/store"
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
	interval         time.Duration
	workerPool       worker.Pool
	httpClient       *http.Client
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
	ctx := log.ContextWithValue(context.Background(), zap.Time("startTime", startTime))

	for _, s := range c.satellitesClient.GetSatellites() {
		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				plugins, err := doRequest[plugin.Instance](ctx, c.httpClient, s.GetAddress()+"/api/plugins", s.GetToken())
				if err != nil {
					instrument(ctx, s.GetName(), "plugins", err, startTime)
					return
				}

				err = c.storeClient.SavePlugins(s.GetName(), plugins)
				if err != nil {
					instrument(ctx, s.GetName(), "plugins", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "plugins", nil, startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				clusters, err := doRequest[string](ctx, c.httpClient, s.GetAddress()+"/api/clusters", s.GetToken())
				if err != nil {
					instrument(ctx, s.GetName(), "clusters", err, startTime)
					return
				}

				err = c.storeClient.SaveClusters(s.GetName(), clusters)
				if err != nil {
					instrument(ctx, s.GetName(), "clusters", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "clusters", nil, startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				applications, err := doRequest[applicationv1.ApplicationSpec](ctx, c.httpClient, s.GetAddress()+"/api/clusters/applications", s.GetToken())
				if err != nil {
					instrument(ctx, s.GetName(), "applications", err, startTime)
					return
				}

				err = c.storeClient.SaveApplications(s.GetName(), applications)
				if err != nil {
					instrument(ctx, s.GetName(), "applications", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "applications", nil, startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				dashboards, err := doRequest[dashboardv1.DashboardSpec](ctx, c.httpClient, s.GetAddress()+"/api/clusters/dashboards", s.GetToken())
				if err != nil {
					instrument(ctx, s.GetName(), "dashboards", err, startTime)
					return
				}

				err = c.storeClient.SaveDashboards(s.GetName(), dashboards)
				if err != nil {
					instrument(ctx, s.GetName(), "dashboards", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "dashboards", nil, startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				teams, err := doRequest[teamv1.TeamSpec](ctx, c.httpClient, s.GetAddress()+"/api/clusters/teams", s.GetToken())
				if err != nil {
					instrument(ctx, s.GetName(), "teams", err, startTime)
					return
				}

				err = c.storeClient.SaveTeams(s.GetName(), teams)
				if err != nil {
					instrument(ctx, s.GetName(), "teams", err, startTime)
					return
				}

				instrument(ctx, s.GetName(), "teams", nil, startTime)
			}))
		}(s)

		go func(s satellite.Client) {
			c.workerPool.RunTask(task(func() {
				users, err := doRequest[userv1.UserSpec](ctx, c.httpClient, s.GetAddress()+"/api/clusters/users", s.GetToken())
				if err != nil {
					instrument(ctx, s.GetName(), "users", err, startTime)
					return
				}

				err = c.storeClient.SaveUsers(s.GetName(), users)
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
		httpClient:       &http.Client{Timeout: 60 * time.Second},
		satellitesClient: satellitesClient,
		storeClient:      storeClient,
	}

	go client.watch()

	return client, nil
}
