package tags

import (
	"sort"
	"strings"
	"time"

	applicationv1 "github.com/kobsio/kobs/pkg/api/apis/application/v1"
)

// Cache is the structure which can be used for caching a list of loaded teams.
type Cache struct {
	LastFetch     time.Time
	CacheDuration time.Duration
	Tags          []string
}

// Unique returns all unique tags from a list of tags.
func Unique(tags []string) []string {
	keys := make(map[string]bool)
	uniqueTags := []string{}
	for _, tag := range tags {
		if _, value := keys[tag]; !value {
			keys[strings.ToLower(tag)] = true
			uniqueTags = append(uniqueTags, strings.ToLower(tag))
		}
	}

	sort.Slice(uniqueTags, func(i, j int) bool {
		return uniqueTags[i] < uniqueTags[j]
	})

	return uniqueTags
}

// FilterApplications filters a list of applications and only returns applications, which are containing a tag from the
// given list of tags. If the tags slice is empty we return all applications.
func FilterApplications(applications []applicationv1.ApplicationSpec, tags []string) []applicationv1.ApplicationSpec {
	if tags == nil {
		return applications
	}

	var filteredApplications []applicationv1.ApplicationSpec

	for _, application := range applications {
		for _, tag := range tags {
			if contains(application.Tags, tag) {
				filteredApplications = append(filteredApplications, application)
				break
			}
		}
	}

	return filteredApplications
}

// contains checks if a list of tags contains a specifc tag.
func contains(tags []string, tag string) bool {
	for _, t := range tags {
		if strings.ToLower(t) == strings.ToLower(tag) {
			return true
		}
	}

	return false
}
