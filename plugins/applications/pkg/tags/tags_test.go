package tags

import (
	"testing"

	application "github.com/kobsio/kobs/pkg/api/apis/application/v1beta1"

	"github.com/stretchr/testify/require"
)

func TestUnique(t *testing.T) {
	require.Equal(t, []string{"tag1", "tag2", "tag3", "tag4", "tag5"}, Unique([]string{"tag1", "tag2", "tag3", "tag3", "tag4", "tag5", "tag1"}))
}

func TestFilterApplications(t *testing.T) {
	applicationsList := []application.ApplicationSpec{
		{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Tags: []string{"tag1", "tag2", "tag3"}},
		{Cluster: "cluster1", Namespace: "namespace1", Name: "application2", Tags: []string{"tag1", "tag4", "tag5"}},
		{Cluster: "cluster1", Namespace: "namespace1", Name: "application3", Tags: []string{"tag2"}},
		{Cluster: "cluster1", Namespace: "namespace1", Name: "application4", Tags: []string{"tag2", "tag3"}},
		{Cluster: "cluster1", Namespace: "namespace1", Name: "application5", Tags: []string{"tag3", "tag4", "tag5"}},
	}

	t.Run("empty tags", func(t *testing.T) {
		actualApplications := FilterApplications(applicationsList, nil)
		require.Equal(t, applicationsList, actualApplications)
	})

	t.Run("filter applications", func(t *testing.T) {
		actualApplications := FilterApplications(applicationsList, []string{"tag1", "tag5"})
		require.Equal(t, []application.ApplicationSpec{applicationsList[0], applicationsList[1], applicationsList[4]}, actualApplications)
	})
}

func TestContains(t *testing.T) {
	require.Equal(t, true, contains([]string{"tag1", "tag2", "tag3"}, "tag2"))
	require.Equal(t, false, contains([]string{"tag1", "tag2", "tag3"}, "tag4"))
}
