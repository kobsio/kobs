package instance

import (
	"net/url"

	"github.com/mitchellh/mapstructure"
	"github.com/signalsciences/go-sigsci"
)

// Config is the structure of the configuration for a single GitHub instance.
type Config struct {
	CorpName string `json:"corpName"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

type Instance interface {
	GetName() string
	GetOverview(query url.Values) ([]sigsci.OverviewSite, error)
	GetSites() ([]sigsci.Site, error)
	GetAgents(siteName string) ([]sigsci.Agent, error)
	GetRequests(siteName string, query url.Values) (next string, requests []sigsci.Request, err error)
}

type instance struct {
	name   string
	config Config
	client sigsci.Client
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) GetOverview(query url.Values) ([]sigsci.OverviewSite, error) {
	return i.client.GetOverviewReport(i.config.CorpName, query)
}

func (i *instance) GetSites() ([]sigsci.Site, error) {
	return i.client.ListSites(i.config.CorpName)
}

func (i *instance) GetAgents(siteName string) ([]sigsci.Agent, error) {
	return i.client.ListAgents(i.config.CorpName, siteName)
}

func (i *instance) GetRequests(siteName string, query url.Values) (next string, requests []sigsci.Request, err error) {
	return i.client.SearchRequests(i.config.CorpName, siteName, query)
}

// New returns a new Signal Sciences instance for the given configuration.
func New(name string, options map[string]any) (Instance, error) {
	var config Config
	err := mapstructure.Decode(options, &config)
	if err != nil {
		return nil, err
	}

	return &instance{
		name:   name,
		config: config,
		client: sigsci.NewTokenClient(config.Email, config.Token),
	}, nil
}
