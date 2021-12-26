package instance

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestDoRequest(t *testing.T) {
	t.Run("no context", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.doRequest(nil, "/")
		require.Error(t, err)
	})

	t.Run("invalid request", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: "",
			client:  ts.Client(),
		}

		_, err := instance.doRequest(context.Background(), "/")
		require.Error(t, err)
	})

	t.Run("request", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`[{"id":19,"uid":"6Lk9wMHik","title":"MongoDB Overview","uri":"db/mongodb-overview","url":"/d/6Lk9wMHik/mongodb-overview","slug":"","type":"dash-db","tags":[],"isStarred":false,"folderId":13,"folderUid":"0iZfYbBGz","folderTitle":"Databases","folderUrl":"/dashboards/f/0iZfYbBGz/databases","sortMeta":0}]`))
		}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: ts.URL,
			client:  ts.Client(),
		}

		res, err := instance.doRequest(context.Background(), "/")
		require.NoError(t, err)
		require.Equal(t, []byte(`[{"id":19,"uid":"6Lk9wMHik","title":"MongoDB Overview","uri":"db/mongodb-overview","url":"/d/6Lk9wMHik/mongodb-overview","slug":"","type":"dash-db","tags":[],"isStarred":false,"folderId":13,"folderUid":"0iZfYbBGz","folderTitle":"Databases","folderUrl":"/dashboards/f/0iZfYbBGz/databases","sortMeta":0}]`), res)
	})

	t.Run("json decode failure", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`[{"id":19,"uid":"6Lk9wMHik","title":"MongoDB Overview"]`))
		}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.doRequest(context.Background(), "/")
		require.Error(t, err)
	})

	t.Run("error with message", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"message":"request failed"}`))
		}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.doRequest(context.Background(), "/")
		require.Error(t, err)
		require.Equal(t, "request failed", err.Error())
	})

	t.Run("error without message", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"msg":"request failed"}`))
		}))
		defer ts.Close()

		instance := &instance{
			name:    "grafana",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.doRequest(context.Background(), "/")
		require.Error(t, err)
		require.Equal(t, "an unknown error occured", err.Error())
	})
}

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
		name   string
		config Config
	}{
		{
			name:   "invalid instance name",
			config: Config{Name: "grafana"},
		},
		{
			name:   "get dashboards failed",
			config: Config{Name: "grafana", Username: "admin", Password: "admin"},
		},
		{
			name:   "get dashboards succeeded",
			config: Config{Name: "grafana", Token: "token"},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			instance := New(tt.config)
			require.NotNil(t, instance)
		})
	}
}
