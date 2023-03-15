package helm

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/plugins/helm/client"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
)

func TestGetReleases(t *testing.T) {
	var newRouter = func(t *testing.T) (*client.MockClient, Router) {
		ctrl := gomock.NewController(t)
		helmClient := client.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), nil}

		testNewHelmClient := func(name string, kubernetesClient kubernetes.Client) client.Client {
			return helmClient
		}
		newHelmClient = testNewHelmClient

		return helmClient, router
	}

	t.Run("should fail on helm client error for all namespaces", func(t *testing.T) {
		helmClient, router := newRouter(t)
		helmClient.EXPECT().List(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/releases", nil)
		req.Header.Add("x-kobs-cluster", "cluster")
		w := httptest.NewRecorder()

		router.getReleases(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to list Helm releases"]}`)
	})

	t.Run("should fail on helm client error for specific namespaces", func(t *testing.T) {
		helmClient, router := newRouter(t)
		helmClient.EXPECT().List(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/releases?namespace=default", nil)
		req.Header.Add("x-kobs-cluster", "cluster")
		w := httptest.NewRecorder()

		router.getReleases(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to list Helm releases"]}`)
	})

	t.Run("should return helm releases for all namespaces", func(t *testing.T) {
		helmClient, router := newRouter(t)
		helmClient.EXPECT().List(gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/releases", nil)
		req.Header.Add("x-kobs-cluster", "cluster")
		w := httptest.NewRecorder()

		router.getReleases(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})

	t.Run("should return helm releases for a specific namespace", func(t *testing.T) {
		helmClient, router := newRouter(t)
		helmClient.EXPECT().List(gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/releases?namespace=default", nil)
		req.Header.Add("x-kobs-cluster", "cluster")
		w := httptest.NewRecorder()

		router.getReleases(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetRelease(t *testing.T) {
	var newRouter = func(t *testing.T) (*client.MockClient, Router) {
		ctrl := gomock.NewController(t)
		helmClient := client.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), nil}

		testNewHelmClient := func(name string, kubernetesClient kubernetes.Client) client.Client {
			return helmClient
		}
		newHelmClient = testNewHelmClient

		return helmClient, router
	}

	t.Run("should fail for invalid version parameter", func(t *testing.T) {
		_, router := newRouter(t)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/release", nil)
		req.Header.Add("x-kobs-cluster", "cluster")
		w := httptest.NewRecorder()

		router.getRelease(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse 'version' parameter"]}`)
	})

	t.Run("should fail on helm client error", func(t *testing.T) {
		helmClient, router := newRouter(t)
		helmClient.EXPECT().Get(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/release?version=1", nil)
		req.Header.Add("x-kobs-cluster", "cluster")
		w := httptest.NewRecorder()

		router.getRelease(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get Helm release"]}`)
	})

	t.Run("should return helm release", func(t *testing.T) {
		helmClient, router := newRouter(t)
		helmClient.EXPECT().Get(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/release?version=1", nil)
		req.Header.Add("x-kobs-cluster", "cluster")
		w := httptest.NewRecorder()

		router.getRelease(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetReleaseHistory(t *testing.T) {
	var newRouter = func(t *testing.T) (*client.MockClient, Router) {
		ctrl := gomock.NewController(t)
		helmClient := client.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), nil}

		testNewHelmClient := func(name string, kubernetesClient kubernetes.Client) client.Client {
			return helmClient
		}
		newHelmClient = testNewHelmClient

		return helmClient, router
	}

	t.Run("should fail on helm client error", func(t *testing.T) {
		helmClient, router := newRouter(t)
		helmClient.EXPECT().History(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/release/history", nil)
		req.Header.Add("x-kobs-cluster", "cluster")
		w := httptest.NewRecorder()

		router.getReleaseHistory(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get Helm release history"]}`)
	})

	t.Run("should return helm release", func(t *testing.T) {
		helmClient, router := newRouter(t)
		helmClient.EXPECT().History(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/release/history", nil)
		req.Header.Add("x-kobs-cluster", "cluster")
		w := httptest.NewRecorder()

		router.getReleaseHistory(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}
