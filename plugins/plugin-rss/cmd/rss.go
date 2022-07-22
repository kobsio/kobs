package rss

import (
	"net/http"
	"sync"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/middleware/roundtripper"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-rss/pkg/feed"
	"github.com/kobsio/kobs/plugins/plugin-rss/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/mmcdole/gofeed"
	"go.uber.org/zap"
)

// PluginType is the type which must be used for the RSS plugin.
const PluginType = "rss"

// Router implements the router for the rss plugin, which can be registered in the router for our rest api. It contains
// the api routes for the rss plugin and it's configuration.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a rss instance by it's name. If we couldn't found an instance with the provided name and the
// provided name is "default" we return the first instance from the list. The first instance in the list is also the
// first one configured by the user and can be used as default one.
func (router *Router) getInstance(name string) instance.Instance {
	for _, i := range router.instances {
		if i.GetName() == name {
			return i
		}
	}

	if name == "default" && len(router.instances) > 0 {
		return router.instances[0]
	}

	return nil
}

// getFeed returns a feed with the retrieved items from the given links. A user can specify multiple urls of rss feeds
// and an optional sortBy parameter. We try to get the items form all the specified fields in parallel and then
// converting them to our custom feed item structure.
func (router *Router) getFeed(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	urls := r.URL.Query()["url"]
	sortBy := r.URL.Query().Get("sortBy")

	log.Debug(r.Context(), "Get feed parameters", zap.String("name", name), zap.Int("urlCount", len(urls)), zap.String("sortBy", sortBy))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	var feeds []*gofeed.Feed

	mu := &sync.Mutex{}
	var wg sync.WaitGroup
	wg.Add(len(urls))

	for _, url := range urls {
		go func(url string) {
			defer wg.Done()
			feed, err := i.GetFeed(url)

			if err != nil {
				log.Error(r.Context(), "Error while getting feed", zap.Error(err))
			}

			if feed != nil {
				mu.Lock()
				feed.FeedLink = url
				feeds = append(feeds, feed)
				mu.Unlock()
			}
		}(url)
	}

	wg.Wait()

	items := feed.Transform(feeds, sortBy)

	log.Debug(r.Context(), "Get feed result", zap.Int("itemsCount", len(items)))
	render.JSON(w, r, items)
}

// Mount mounts the rss plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
	var rssInstances []instance.Instance

	for _, i := range instances {
		rssInstance := instance.New(i.Name, &http.Client{
			Transport: roundtripper.DefaultRoundTripper,
		})
		rssInstances = append(rssInstances, rssInstance)
	}

	router := Router{
		chi.NewRouter(),
		rssInstances,
	}

	router.Get("/feed", router.getFeed)

	return router, nil
}
