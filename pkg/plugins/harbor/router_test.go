package harbor

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/plugins/harbor/instance"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	i, _ := instance.New("Test", nil)
	router := Router{
		chi.NewRouter(),
		[]instance.Instance{i},
	}

	require.Equal(t, "Test", router.getInstance("Test").GetName())
	require.Equal(t, "Test", router.getInstance("default").GetName())
	require.Equal(t, nil, router.getInstance("Invalid"))
}

func TestGetProjects(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		i := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{i}}

		return i, router
	}

	t.Run("should fail for invalid instance", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projects", nil)
		req.Header.Add("x-kobs-plugin", "Invalid")
		w := httptest.NewRecorder()

		router.getProjects(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid instance name"]}`)
	})

	t.Run("should fail on internal server error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetProjects(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projects", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getProjects(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get projects"]}`)
	})

	t.Run("should return projects", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetProjects(gomock.Any(), gomock.Any(), gomock.Any()).Return(&instance.ProjectsData{Total: 1, Projects: nil}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projects", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getProjects(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"total": 1, "projects": null}`)
	})
}

func TestGetRepositories(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		i := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{i}}

		return i, router
	}

	t.Run("should fail for invalid instance", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/repositories", nil)
		req.Header.Add("x-kobs-plugin", "Invalid")
		w := httptest.NewRecorder()

		router.getRepositories(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid instance name"]}`)
	})

	t.Run("should fail on internal server error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetRepositories(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/repositories", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getRepositories(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get repositories"]}`)
	})

	t.Run("should return repositories", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetRepositories(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(&instance.RepositoriesData{Total: 1, Repositories: nil}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/repositories", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getRepositories(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"total": 1, "repositories": null}`)
	})
}

func TestGetArtifacts(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		i := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{i}}

		return i, router
	}

	t.Run("should fail for invalid instance", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/artifacts", nil)
		req.Header.Add("x-kobs-plugin", "Invalid")
		w := httptest.NewRecorder()

		router.getArtifacts(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid instance name"]}`)
	})

	t.Run("should fail on internal server error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetArtifacts(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/artifacts", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getArtifacts(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get artifacts"]}`)
	})

	t.Run("should return artifacts", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetArtifacts(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(&instance.ArtifactsData{Total: 1, Artifacts: nil}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/artifacts", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getArtifacts(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"total": 1, "artifacts": null}`)
	})
}

func TestGetArtifact(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		i := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{i}}

		return i, router
	}

	t.Run("should fail for invalid instance", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/artifact", nil)
		req.Header.Add("x-kobs-plugin", "Invalid")
		w := httptest.NewRecorder()

		router.getArtifact(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid instance name"]}`)
	})

	t.Run("should fail on internal server error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetArtifact(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/artifact", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getArtifact(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get artifact"]}`)
	})

	t.Run("should return artifact", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetArtifact(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/artifact", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getArtifact(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetVulnerabilities(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		i := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{i}}

		return i, router
	}

	t.Run("should fail for invalid instance", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/vulnerabilities", nil)
		req.Header.Add("x-kobs-plugin", "Invalid")
		w := httptest.NewRecorder()

		router.getVulnerabilities(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid instance name"]}`)
	})

	t.Run("should fail on internal server error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetVulnerabilities(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/vulnerabilities", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getVulnerabilities(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get vulnerabilities"]}`)
	})

	t.Run("should return vulnerabilities", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetVulnerabilities(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/vulnerabilities", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getVulnerabilities(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetBuildHistory(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		i := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{i}}

		return i, router
	}

	t.Run("should fail for invalid instance", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/buildhistory", nil)
		req.Header.Add("x-kobs-plugin", "Invalid")
		w := httptest.NewRecorder()

		router.getBuildHistory(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid instance name"]}`)
	})

	t.Run("should fail on internal server error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetBuildHistory(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/buildhistory", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getBuildHistory(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get build history"]}`)
	})

	t.Run("should return buildhistory", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("Test")
		i.EXPECT().GetBuildHistory(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/buildhistory", nil)
		req.Header.Add("x-kobs-plugin", "Test")
		w := httptest.NewRecorder()

		router.getBuildHistory(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}
