package client

import (
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"

	"go.uber.org/zap"
	"helm.sh/helm/v3/pkg/action"
	"helm.sh/helm/v3/pkg/release"
)

// Release is the structure of a Helm release with an additional property for the cluster name.
type Release struct {
	Cluster string `json:"cluster"`
	*release.Release
}

// Client is the interface to interact with the Helm charts.
type Client interface {
	List() ([]Release, error)
	Get(name string, version int) (*Release, error)
	History(name string) ([]Release, error)
}

type client struct {
	name         string
	actionConfig *action.Configuration
}

// List lists all Helm releases.
func (c *client) List() ([]Release, error) {
	listAction := action.NewList(c.actionConfig)

	tmpReleases, err := listAction.Run()
	if err != nil {
		return nil, err
	}

	var releases []Release

	for _, release := range tmpReleases {
		releases = append(releases, Release{
			c.name,
			release,
		})
	}

	return releases, nil
}

// Get returns the all information for a single Helm release version.
func (c *client) Get(name string, version int) (*Release, error) {
	getAction := action.NewGet(c.actionConfig)
	getAction.Version = version

	tmpRelease, err := getAction.Run(name)
	if err != nil {
		return nil, err
	}

	return &Release{c.name, tmpRelease}, nil
}

// History returns the history of a single Helm release.
func (c *client) History(name string) ([]Release, error) {
	historyAction := action.NewHistory(c.actionConfig)

	tmpReleases, err := historyAction.Run(name)
	if err != nil {
		return nil, err
	}

	var releases []Release

	for _, release := range tmpReleases {
		releases = append(releases, Release{
			c.name,
			release,
		})
	}

	return releases, nil
}

// New returns a new client, which implements the Client interface. The client can then be used to interact with the
// Helm releases in the given cluster and namespace via the specified driver.
func New(cluster cluster.Client, namespace, driver string) Client {
	restClientGetter := cluster.GetRESTClientGetter()

	actionConfig := &action.Configuration{}
	actionConfig.Init(restClientGetter, namespace, driver, zap.S().Debugf)

	return &client{
		name:         cluster.GetName(),
		actionConfig: actionConfig,
	}
}
