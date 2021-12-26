package rss

import (
	"net/http"
	"sync"
	"time"

	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/rss/pkg/feed"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/mmcdole/gofeed"
	"go.uber.org/zap"
)

// Route is the route under which the plugin should be registered in our router for the rest api.
const Route = "/rss"

// Config is the structure of the configuration for the rss plugin.
type Config struct{}

// Router implements the router for the rss plugin, which can be registered in the router for our rest api. It contains
// the api routes for the rss plugin and it's configuration.
type Router struct {
	*chi.Mux
	config Config
	client *http.Client
}

// getFeed returns a feed with the retrieved items from the given links. A user can specify multiple urls of rss feeds
// and an optional sortBy parameter. We try to get the items form all the specified fields in parallel and then
// converting them to our custom feed item structure.
func (router *Router) getFeed(w http.ResponseWriter, r *http.Request) {
	urls := r.URL.Query()["url"]
	sortBy := r.URL.Query().Get("sortBy")

	log.Debug(r.Context(), "Get feed parameters.", zap.Int("urlCount", len(urls)), zap.String("sortBy", sortBy))

	var feeds []*gofeed.Feed
	var wg sync.WaitGroup
	wg.Add(len(urls))

	for _, url := range urls {
		go func(url string) {
			fp := gofeed.NewParser()
			fp.Client = router.client

			feed, err := fp.ParseURL(url)
			if err != nil {
				log.Error(r.Context(), "Error while getting feed.", zap.Error(err))
			}

			if feed != nil {
				feeds = append(feeds, feed)
			}

			wg.Done()
		}(url)
	}

	wg.Wait()

	items := feed.Transform(feeds, sortBy)

	log.Debug(r.Context(), "Get feed result.", zap.Int("itemsCount", len(items)))
	render.JSON(w, r, items)
}

// Register returns a new router which can be used in the router for the kobs rest api. The configuration for the rss
// plugin is always the same and can not be changed by the user.
func Register(plugins *plugin.Plugins, config Config) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "rss",
		DisplayName: "RSS",
		Description: "Get the latest status updates of your third party services.",
		Type:        "rss",
	})

	router := Router{
		chi.NewRouter(),
		config,
		&http.Client{
			Timeout: 30 * time.Second,
		},
	}

	router.Get("/feed", router.getFeed)

	return router
}
