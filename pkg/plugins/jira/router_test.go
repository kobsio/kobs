package jira

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/andygrunwald/go-jira"
	"github.com/kobsio/kobs/pkg/plugins/jira/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("jira")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("jira")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("jira")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("jira")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestAuthLogin(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/auth/login", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.authLogin(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail for invalid request body", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/auth/login", strings.NewReader("invalid"))
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.authLogin(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to decode request body"]}`)
	})

	t.Run("should fail for invalid credentials", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().GetSelf(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/auth/login", strings.NewReader(`{"email": "admin@kobs.io", "token": "token"}`))
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.authLogin(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid credentials"]}`)
	})

	t.Run("should fail when cookie can not be created", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().GetSelf(gomock.Any(), gomock.Any()).Return(&jira.User{}, nil)
		i.EXPECT().TokenToCookie(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/auth/login", strings.NewReader(`{"email": "admin@kobs.io", "token": "token"}`))
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.authLogin(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to create authentication cookie"]}`)
	})

	t.Run("should fail when cookie can not be created", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().GetSelf(gomock.Any(), gomock.Any()).Return(&jira.User{}, nil)
		i.EXPECT().TokenToCookie(gomock.Any()).Return(&http.Cookie{}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/auth/login", strings.NewReader(`{"email": "admin@kobs.io", "token": "token"}`))
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.authLogin(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestAuthToken(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/auth", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.authToken(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail if there is no cookie", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/auth", nil)
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.authToken(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get authentication token from cookie"]}`)
	})

	t.Run("should fail for invalid credentials", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(&instance.Token{Email: "admin@kobs.io", Token: "token"}, nil)
		i.EXPECT().GetSelf(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/auth", nil)
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.authToken(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid credentials"]}`)
	})

	t.Run("should return url", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(&instance.Token{Email: "admin@kobs.io", Token: "token"}, nil)
		i.EXPECT().GetSelf(gomock.Any(), gomock.Any()).Return(nil, nil)
		i.EXPECT().GetURL().Return("jira.com")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/auth", nil)
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.authToken(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"url": "jira.com"}`)
	})
}

func TestGetProjects(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projects", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getProjects(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail if there is no cookie", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projects", nil)
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.getProjects(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get authentication token from cookie"]}`)
	})

	t.Run("should fail when instance returns error for projects", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(&instance.Token{Email: "admin@kobs.io", Token: "token"}, nil)
		i.EXPECT().GetProjects(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projects", nil)
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.getProjects(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get projects"]}`)
	})

	t.Run("should return projects", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(&instance.Token{Email: "admin@kobs.io", Token: "token"}, nil)
		i.EXPECT().GetProjects(gomock.Any(), gomock.Any()).Return(&jira.ProjectList{{Name: "test"}}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/projects", nil)
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.getProjects(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `[{
			"avatarUrls": {},
			"expand": "",
			"id": "",
			"key": "",
			"name": "test",
			"projectCategory": {
				"description": "",
				"id": "",
				"name": "",
				"self": ""
			},
			"projectTypeKey": "",
			"self": ""
		}]`)
	})
}

func TestGetIssues(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/issues", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getIssues(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail if there is no cookie", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/issues", nil)
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.getIssues(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get authentication token from cookie"]}`)
	})

	t.Run("should fail for invalid startAt parameter", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(&instance.Token{Email: "admin@kobs.io", Token: "token"}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/issues", nil)
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.getIssues(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse 'startAt' parameter"]}`)
	})

	t.Run("should fail for invalid maxResults parameter", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(&instance.Token{Email: "admin@kobs.io", Token: "token"}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/issues?startAt=1", nil)
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.getIssues(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse 'maxResults' parameter"]}`)
	})

	t.Run("should fail when instance returns error for issues", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(&instance.Token{Email: "admin@kobs.io", Token: "token"}, nil)
		i.EXPECT().GetIssues(gomock.Any(), gomock.Any(), gomock.Any(), 1, 1).Return(nil, 0, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/issues?startAt=1&maxResults=1", nil)
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.getIssues(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get issues"]}`)
	})

	t.Run("should return projects", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("jira")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(&instance.Token{Email: "admin@kobs.io", Token: "token"}, nil)
		i.EXPECT().GetIssues(gomock.Any(), gomock.Any(), gomock.Any(), 1, 1).Return([]jira.Issue{{ID: "test"}}, 1, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/issues?startAt=1&maxResults=1", nil)
		req.Header.Set("x-kobs-plugin", "jira")
		w := httptest.NewRecorder()

		router.getIssues(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"total": 1, "issues": [{"id": "test"}]}`)
	})
}

func TestMount(t *testing.T) {
	t.Run("should return error for invalid instance", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "jira", Options: map[string]any{"url": []string{"localhost"}}}})
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should work", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "jira"}})
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
