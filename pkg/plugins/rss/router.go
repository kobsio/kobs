package rss

import (
	"net/http"
	"sync"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/plugins/rss/feed"
	"github.com/kobsio/kobs/pkg/plugins/rss/instance"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/utils/middleware/roundtripper"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/mmcdole/gofeed"
	"go.uber.org/zap"
)

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

func (router *Router) getFeed(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	urls := r.URL.Query()["url"]
	sortBy := r.URL.Query().Get("sortBy")

	log.Debug(r.Context(), "getFeed", zap.String("name", name), zap.Int("urlCount", len(urls)), zap.String("sortBy", sortBy))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
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

	log.Debug(r.Context(), "getFeed", zap.Int("itemsCount", len(items)))
	render.JSON(w, r, items)
}

func Mount(instances []plugin.Instance) (chi.Router, error) {
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
