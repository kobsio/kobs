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
		name: "sonarqube",
	}

	require.Equal(t, "sonarqube", instance.GetName())
}

func TestGetProjects(t *testing.T) {
	t.Run("should return request error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/components/search" {
				w.WriteHeader(http.StatusBadRequest)
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "sonarqube",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetProjects(context.Background(), "", "", "")
		require.Error(t, err)
	})

	t.Run("should return error for invalid json", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/components/search" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`[]`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "sonarqube",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetProjects(context.Background(), "", "", "")
		require.Error(t, err)
	})

	t.Run("should return projects", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/components/search" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{"paging": {"pageIndex": 1, "pageSize": 1, "total": 1}}`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "sonarqube",
			address: ts.URL,
			client:  ts.Client(),
		}

		projects, err := instance.GetProjects(context.Background(), "", "", "")
		require.NoError(t, err)
		require.Equal(t, &ResponseProjects{Paging: Paging{PageIndex: 1, PageSize: 1, Total: 1}, Components: nil}, projects)
	})
}

func TestGetProjectMeasures(t *testing.T) {
	t.Run("should return request error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/measures/component" {
				w.WriteHeader(http.StatusBadRequest)
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "sonarqube",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetProjectMeasures(context.Background(), "", nil)
		require.Error(t, err)
	})

	t.Run("should return error for invalid json", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/measures/component" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`[]`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "sonarqube",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetProjectMeasures(context.Background(), "", nil)
		require.Error(t, err)
	})

	t.Run("should return measures", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api/measures/component" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{}`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "sonarqube",
			address: ts.URL,
			client:  ts.Client(),
		}

		measures, err := instance.GetProjectMeasures(context.Background(), "", nil)
		require.NoError(t, err)
		require.Equal(t, &ResponseProjectMeasures{Metrics: nil, Component: ProjectMeasures{Key: "", Name: "", Description: "", Qualifier: "", Measures: nil}}, measures)
	})
}

func TestNew(t *testing.T) {
	t.Run("should return error for invalid options", func(t *testing.T) {
		instance, err := New("sonarqube", map[string]any{"address": []string{"localhost"}})
		require.Error(t, err)
		require.Nil(t, instance)
	})

	t.Run("should return instance with default metrics", func(t *testing.T) {
		instance, err := New("sonarqube", map[string]any{"address": "localhost"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})

	t.Run("should return instance with custom metrics", func(t *testing.T) {
		instance, err := New("sonarqube", map[string]any{"address": "localhost", "metricKeys": []string{"alert_status"}})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})
}
