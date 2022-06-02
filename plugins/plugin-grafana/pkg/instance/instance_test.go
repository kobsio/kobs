package instance

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetName(t *testing.T) {
	instance := &instance{
		name: "grafana",
	}

	require.Equal(t, "grafana", instance.GetName())
}

func TestGetDashboards(t *testing.T) {
	t.Run("request error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/search" {
				w.WriteHeader(http.StatusBadRequest)
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetDashboards(context.Background(), "/")
		require.Error(t, err)
	})

	t.Run("json unmarshal fails", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/search" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`[{"id":19,"uid":"6Lk9wMHik","title":"MongoDB Overview"]`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetDashboards(context.Background(), "mongodb")
		require.Error(t, err)
	})

	t.Run("get dashboards", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/search" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`[{"id":19,"uid":"6Lk9wMHik","title":"MongoDB Overview","uri":"db/mongodb-overview","url":"/d/6Lk9wMHik/mongodb-overview","slug":"","type":"dash-db","tags":[],"isStarred":false,"folderId":13,"folderUid":"0iZfYbBGz","folderTitle":"Databases","folderUrl":"/dashboards/f/0iZfYbBGz/databases","sortMeta":0}]`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: ts.URL,
			client:  ts.Client(),
		}

		dashboards, err := instance.GetDashboards(context.Background(), "mongodb")
		require.NoError(t, err)
		require.Equal(t, []Dashboard{{
			DashboardData:     DashboardData{ID: 19, UID: "6Lk9wMHik", Title: "MongoDB Overview", Tags: []string{}},
			DashboardMetadata: DashboardMetadata{URL: "/d/6Lk9wMHik/mongodb-overview", FolderID: 13, FolderUID: "0iZfYbBGz", FolderTitle: "Databases", FolderURL: "/dashboards/f/0iZfYbBGz/databases"},
			Type:              "dash-db",
		}}, dashboards)
	})
}

func TestGetDashboard(t *testing.T) {
	t.Run("request error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/dashboards/uid/6Lk9wMHik" {
				w.WriteHeader(http.StatusBadRequest)
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetDashboard(context.Background(), "6Lk9wMHik")
		require.Error(t, err)
	})

	t.Run("json unmarshal fails", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/dashboards/uid/6Lk9wMHik" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{"meta":{"type":"db","canSave":true,"canEdit":true,"canAdmin":false,"canStar":false,"slug":"mongodb-overview","url":"/d/6Lk9wMHik/mongodb-overview"`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetDashboard(context.Background(), "6Lk9wMHik")
		require.Error(t, err)
	})

	t.Run("get dashboard", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/dashboards/uid/6Lk9wMHik" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{"meta":{"type":"db","canSave":true,"canEdit":true,"canAdmin":false,"canStar":false,"slug":"mongodb-overview","url":"/d/6Lk9wMHik/mongodb-overview","expires":"0001-01-01T00:00:00Z","created":"2021-01-20T12:47:28Z","updated":"2021-12-13T17:41:40Z","updatedBy":"Anonymous","createdBy":"Anonymous","version":4,"hasAcl":false,"isFolder":false,"folderId":13,"folderUid":"0iZfYbBGz","folderTitle":"Databases","folderUrl":"/dashboards/f/0iZfYbBGz/databases","provisioned":true,"provisionedExternalId":"mongodb-overview.json"},"dashboard":{"editable":true,"gnetId":null,"graphTooltip":1,"id":19,"iteration":1582200082615,"links":[],"title":"MongoDB Overview","uid":"6Lk9wMHik","version":4}}`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: ts.URL,
			client:  ts.Client(),
		}

		dashboards, err := instance.GetDashboard(context.Background(), "6Lk9wMHik")
		require.NoError(t, err)
		require.Equal(t, &Dashboard{
			DashboardData:     DashboardData{ID: 19, UID: "6Lk9wMHik", Title: "MongoDB Overview", Tags: nil},
			DashboardMetadata: DashboardMetadata{URL: "/d/6Lk9wMHik/mongodb-overview", FolderID: 13, FolderUID: "0iZfYbBGz", FolderTitle: "Databases", FolderURL: "/dashboards/f/0iZfYbBGz/databases"},
		}, dashboards)
	})
}

func TestNew(t *testing.T) {
	for _, tt := range []struct {
		name    string
		options map[string]interface{}
		isError bool
	}{
		{
			name:    "instance without auth",
			options: map[string]interface{}{},
			isError: false,
		},
		{
			name:    "instance with basic auth",
			options: map[string]interface{}{"username": "admin", "password": "admin"},
			isError: false,
		},
		{
			name:    "instance with token auth",
			options: map[string]interface{}{"token": "token"},
			isError: false,
		},
		{
			name:    "fail to parse options",
			options: map[string]interface{}{"token": []string{"token"}},
			isError: true,
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			instance, err := New("grafana", tt.options)
			if tt.isError {
				require.Error(t, err)
				require.Nil(t, instance)
			} else {
				require.NoError(t, err)
				require.NotNil(t, instance)
			}
		})
	}
}
