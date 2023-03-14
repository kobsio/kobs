package instance

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetProjects(t *testing.T) {
	t.Run("should return error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		projects, err := instance.GetProjects(context.Background(), "1", "10")
		require.Error(t, err)
		require.Nil(t, projects)
	})

	t.Run("should return projects", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Add("x-total-count", "1")
			w.Write([]byte(`[{"name": "private"}]`))
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		projects, err := instance.GetProjects(context.Background(), "1", "10")
		require.NoError(t, err)
		require.Equal(t, &ProjectsData{Total: 1, Projects: []Project{{Name: "private"}}}, projects)
	})
}

func TestGetRepositories(t *testing.T) {
	t.Run("should return error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		repositories, err := instance.GetRepositories(context.Background(), "private", "test", "1", "10")
		require.Error(t, err)
		require.Nil(t, repositories)
	})

	t.Run("should return repositories", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Add("x-total-count", "1")
			w.Write([]byte(`[{"name": "test"}]`))
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		repositories, err := instance.GetRepositories(context.Background(), "test", "test", "1", "10")
		require.NoError(t, err)
		require.Equal(t, &RepositoriesData{Total: 1, Repositories: []Repository{{Name: "test"}}}, repositories)
	})
}

func TestGetArtifacts(t *testing.T) {
	t.Run("should return error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		artifacts, err := instance.GetArtifacts(context.Background(), "private", "test", "dev", "1", "10")
		require.Error(t, err)
		require.Nil(t, artifacts)
	})

	t.Run("should return artifacts", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Add("x-total-count", "1")
			w.Write([]byte(`[{"id": 1234}]`))
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		artifacts, err := instance.GetArtifacts(context.Background(), "test", "test", "dev", "1", "10")
		require.NoError(t, err)
		require.Equal(t, &ArtifactsData{Total: 1, Artifacts: []Artifact{{ID: 1234}}}, artifacts)
	})
}

func TestGetArtifact(t *testing.T) {
	t.Run("should return error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		artifact, err := instance.GetArtifact(context.Background(), "private", "test", "dev")
		require.Error(t, err)
		require.Nil(t, artifact)
	})

	t.Run("should return artifact", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`{"id": 1234}`))
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		artifact, err := instance.GetArtifact(context.Background(), "test", "test", "dev")
		require.NoError(t, err)
		require.Equal(t, &Artifact{ID: 1234}, artifact)
	})
}

func TestGetVulnerabilities(t *testing.T) {
	t.Run("should return error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		vulnerabilities, err := instance.GetVulnerabilities(context.Background(), "private", "test", "dev")
		require.Error(t, err)
		require.Nil(t, vulnerabilities)
	})

	t.Run("should return vulnerabilities", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`{"test": {"severity": "low"}}`))
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		vulnerabilities, err := instance.GetVulnerabilities(context.Background(), "test", "test", "dev")
		require.NoError(t, err)
		require.Equal(t, map[string]Vulnerability{"test": {Severity: "low"}}, vulnerabilities)
	})
}

func TestGetBuildHistory(t *testing.T) {
	t.Run("should return error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		history, err := instance.GetBuildHistory(context.Background(), "private", "test", "dev")
		require.Error(t, err)
		require.Nil(t, history)
	})

	t.Run("should return history", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`[{"created_by": "user"}]`))
		}))
		defer ts.Close()

		instance, err := New("Test", map[string]any{"address": ts.URL})
		require.NoError(t, err)

		history, err := instance.GetBuildHistory(context.Background(), "test", "test", "dev")
		require.NoError(t, err)
		require.Equal(t, []BuildHistoryItem{{CreatedBy: "user"}}, history)
	})
}

func TestNew(t *testing.T) {
	t.Run("should return instance with basic auth", func(t *testing.T) {
		instance, err := New("Test", map[string]any{"address": "localhost", "username": "username", "password": "password"})
		require.NoError(t, err)
		require.NotNil(t, instance)
		require.Equal(t, "Test", instance.GetName())
	})

	t.Run("should return instance with token auth", func(t *testing.T) {
		instance, err := New("Test", map[string]any{"address": "localhost", "token": "token"})
		require.NoError(t, err)
		require.NotNil(t, instance)
		require.Equal(t, "Test", instance.GetName())
	})

	t.Run("should return error for invalid instance", func(t *testing.T) {
		router, err := New("Test", map[string]any{"address": []string{"localhost"}})
		require.Error(t, err)
		require.Nil(t, router)
	})
}
