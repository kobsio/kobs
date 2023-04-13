package github

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/go-github/github"
	"github.com/kobsio/kobs/pkg/plugins/github/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils"
	"golang.org/x/oauth2"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("github")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("github")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("github")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("github")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestOauthLogin(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("github")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/oauth/login", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.oauthLogin(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should return login url", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("github")
		i.EXPECT().OAuthLoginURL().Return("https://github.com")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/oauth/login", nil)
		req.Header.Set("x-kobs-plugin", "github")
		w := httptest.NewRecorder()

		router.oauthLogin(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"url": "https://github.com"}`)
	})
}

func TestOauthCallback(t *testing.T) {
	login := "kobsio"

	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("github")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/oauth/callback", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.oauthCallback(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error for OAuthCallback call", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("github")
		i.EXPECT().OAuthCallback(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/oauth/callback", nil)
		req.Header.Set("x-kobs-plugin", "github")
		w := httptest.NewRecorder()

		router.oauthCallback(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to finish login"]}`)
	})

	t.Run("should fail when instance returns an error for TokenToCookie call", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("github")
		i.EXPECT().OAuthCallback(gomock.Any(), gomock.Any(), gomock.Any()).Return(&oauth2.Token{AccessToken: "accesstoken"}, &github.User{Login: &login}, nil)
		i.EXPECT().TokenToCookie(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/oauth/callback", nil)
		req.Header.Set("x-kobs-plugin", "github")
		w := httptest.NewRecorder()

		router.oauthCallback(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to create authentication cookie"]}`)
	})

	t.Run("should return auth response", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("github")
		i.EXPECT().OAuthCallback(gomock.Any(), gomock.Any(), gomock.Any()).Return(&oauth2.Token{AccessToken: "accesstoken"}, &github.User{Login: &login}, nil)
		i.EXPECT().TokenToCookie(gomock.Any()).Return(&http.Cookie{}, nil)
		i.EXPECT().GetOrganization().Return("kobsio")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/oauth/callback", nil)
		req.Header.Set("x-kobs-plugin", "github")
		w := httptest.NewRecorder()

		router.oauthCallback(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"organization":"kobsio", "token":"accesstoken", "username":"kobsio"}`)
	})
}

func TestOauthToken(t *testing.T) {
	login := "kobsio"

	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("github")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/oauth", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.oauthToken(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error for TokenFromCookie call", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("github")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/oauth", nil)
		req.Header.Set("x-kobs-plugin", "github")
		w := httptest.NewRecorder()

		router.oauthToken(w, req)

		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get authentication token from cookie"]}`)
	})

	t.Run("should fail when instance returns an error for OAuthIsAuthenticated call", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("github")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(&oauth2.Token{AccessToken: "accesstoken"}, nil)
		i.EXPECT().OAuthIsAuthenticated(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/oauth", nil)
		req.Header.Set("x-kobs-plugin", "github")
		w := httptest.NewRecorder()

		router.oauthToken(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get user"]}`)
	})

	t.Run("should return auth response", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("github")
		i.EXPECT().TokenFromCookie(gomock.Any()).Return(&oauth2.Token{AccessToken: "accesstoken"}, nil)
		i.EXPECT().OAuthIsAuthenticated(gomock.Any(), gomock.Any()).Return(&github.User{Login: &login}, nil)
		i.EXPECT().GetOrganization().Return("kobsio")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/oauth", nil)
		req.Header.Set("x-kobs-plugin", "github")
		w := httptest.NewRecorder()

		router.oauthToken(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"organization":"kobsio", "token":"accesstoken", "username":"kobsio"}`)
	})
}

func TestMount(t *testing.T) {
	t.Run("should return error for invalid instance", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "github", Options: map[string]any{"organization": []string{"invalid"}}}})
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should work", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "github"}})
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
