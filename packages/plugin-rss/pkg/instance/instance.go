package instance

import (
	"net/http"

	"github.com/mmcdole/gofeed"
)

type Instance interface {
	GetName() string
	GetFeed(url string) (*gofeed.Feed, error)
}

type instance struct {
	name   string
	client *http.Client
}

func (i *instance) GetName() string {
	return i.name
}

func (i *instance) GetFeed(url string) (*gofeed.Feed, error) {
	fp := gofeed.NewParser()
	fp.Client = i.client

	return fp.ParseURL(url)
}

// New returns a new Elasticsearch instance for the given configuration.
func New(name string, client *http.Client) Instance {
	return &instance{
		name:   name,
		client: client,
	}
}
