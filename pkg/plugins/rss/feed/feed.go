package feed

import (
	"sort"

	"github.com/mmcdole/gofeed"
)

// Item represents a single item in a feed. It is similar to the Item struct from the gofeed package, but contains some
// additional fields from the Feed struct and omit fields which we do not use.
type Item struct {
	FeedTitle string `json:"feedTitle,omitempty"`
	FeedImage string `json:"feedImage,omitempty"`
	FeedLink  string `json:"feedLink,omitempty"`

	Title       string            `json:"title,omitempty"`
	Description string            `json:"description,omitempty"`
	Content     string            `json:"content,omitempty"`
	Link        string            `json:"link,omitempty"`
	Links       []string          `json:"links,omitempty"`
	Updated     int64             `json:"updated,omitempty"`
	Published   int64             `json:"published,omitempty"`
	Image       string            `json:"image,omitempty"`
	Categories  []string          `json:"categories,omitempty"`
	Custom      map[string]string `json:"custom,omitempty"`
}

// Transform is used to convert the returned feeds from the gofeed package into a list of items.
func Transform(feeds []*gofeed.Feed, sortBy string) []Item {
	var items []Item

	for _, feed := range feeds {
		var feedImage string
		if feed.Image != nil {
			feedImage = feed.Image.URL
		}

		for _, item := range feed.Items {
			var image string
			if item.Image != nil {
				image = item.Image.URL
			}

			var published int64
			if item.PublishedParsed != nil {
				published = item.PublishedParsed.Unix()
			}

			var updated int64
			if item.UpdatedParsed != nil {
				updated = item.UpdatedParsed.Unix()
			} else {
				updated = published
			}

			items = append(items, Item{
				FeedTitle: feed.Title,
				FeedImage: feedImage,
				FeedLink:  feed.FeedLink,

				Title:       item.Title,
				Description: item.Description,
				Content:     item.Content,
				Link:        item.Link,
				Links:       item.Links,
				Updated:     updated,
				Published:   published,
				Image:       image,
				Categories:  item.Categories,
				Custom:      item.Custom,
			})
		}
	}

	if sortBy == "feed" {
		sort.Slice(items, func(i, j int) bool {
			return items[i].FeedTitle < items[j].FeedTitle
		})
	} else if sortBy == "title" {
		sort.Slice(items, func(i, j int) bool {
			return items[i].Title < items[j].Title
		})
	} else if sortBy == "updated" {
		sort.Slice(items, func(i, j int) bool {
			return items[i].Updated > items[j].Updated
		})
	} else {
		sort.Slice(items, func(i, j int) bool {
			return items[i].Published > items[j].Published
		})
	}

	return items
}
