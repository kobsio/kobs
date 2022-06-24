package helm

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-helm/pkg/client"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
)

func TestGetReleases(t *testing.T) {
	for _, tt := range []struct {
		name               string
		permissionsEnabled bool
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockHelmClient *client.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "no user context",
			permissionsEnabled: false,
			url:                "/releases",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to get the Helm releases: Unauthorized\"}\n",
			prepare:            func(mockHelmClient *client.MockClient) {},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getReleases(w, req)
			},
		},
		{
			name:               "invalid cluster name",
			permissionsEnabled: false,
			url:                "/releases?cluster=cluster2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
			prepare:            func(mockHelmClient *client.MockClient) {},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getReleases(w, req)
			},
		},
		{
			name:               "namespaces nil: could not list helm releases",
			permissionsEnabled: false,
			url:                "/releases?cluster=cluster1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not list Helm releases: could not list helm releases\"}\n",
			prepare: func(mockHelmClient *client.MockClient) {
				mockHelmClient.On("List", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not list helm releases"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getReleases(w, req)
			},
		},
		{
			name:               "namespaces: could not list helm releases",
			permissionsEnabled: false,
			url:                "/releases?cluster=cluster1&namespace=namespace1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not list Helm releases: could not list helm releases\"}\n",
			prepare: func(mockHelmClient *client.MockClient) {
				mockHelmClient.On("List", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not list helm releases"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getReleases(w, req)
			},
		},
		{
			name:               "namespaces nil: return releases",
			permissionsEnabled: false,
			url:                "/releases?cluster=cluster1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"name\":\"kobs\",\"version\":2,\"namespace\":\"kobs\"}]\n",
			prepare: func(mockHelmClient *client.MockClient) {
				mockHelmClient.On("List", mock.Anything, mock.Anything).Return([]*client.Release{{Name: "kobs", Namespace: "kobs", Version: 2, Cluster: "cluster1"}}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getReleases(w, req)
			},
		},
		{
			name:               "namespaces: return releases",
			permissionsEnabled: false,
			url:                "/releases?cluster=cluster1&namespace=namespace1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"name\":\"kobs\",\"version\":2,\"namespace\":\"kobs\"}]\n",
			prepare: func(mockHelmClient *client.MockClient) {
				mockHelmClient.On("List", mock.Anything, mock.Anything).Return([]*client.Release{{Name: "kobs", Namespace: "kobs", Version: 2, Cluster: "cluster1"}}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getReleases(w, req)
			},
		},
		{
			name:               "return filtered releases",
			permissionsEnabled: true,
			url:                "/releases?cluster=cluster1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"name\":\"kobs\",\"version\":2,\"namespace\":\"kobs\"}]\n",
			prepare: func(mockHelmClient *client.MockClient) {
				mockHelmClient.On("List", mock.Anything, mock.Anything).Return([]*client.Release{{Name: "kobs", Namespace: "kobs", Version: 2, Cluster: "cluster1"}, {Name: "prometheus", Namespace: "monitoring", Version: 1, Cluster: "cluster1"}}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "helm", Permissions: apiextensionsv1.JSON{Raw: []byte(`[{"clusters": ["*"], "namespaces": ["kobs"], "names": ["*"]}]`)}}}}}))
				router.getReleases(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", mock.Anything, "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", mock.Anything, "cluster2").Return(nil)

			mockHelmClient := &client.MockClient{}
			mockHelmClient.AssertExpectations(t)
			tt.prepare(mockHelmClient)

			testNewHelmClient := func(clusterClient cluster.Client) client.Client {
				return mockHelmClient
			}

			newHelmClient = testNewHelmClient

			router := Router{chi.NewRouter(), mockClustersClient, tt.permissionsEnabled}
			router.Get("/releases", router.getReleases)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetRelease(t *testing.T) {
	for _, tt := range []struct {
		name               string
		permissionsEnabled bool
		url                string
		expectedStatusCode int
		expectedBody       string
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "no user context",
			permissionsEnabled: false,
			url:                "/release",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to get the Helm release: Unauthorized\"}\n",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getRelease(w, req)
			},
		},
		{
			name:               "no permissions",
			permissionsEnabled: true,
			url:                "/release",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to get the Helm release: access forbidden\"}\n",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getRelease(w, req)
			},
		},
		{
			name:               "invalid version",
			permissionsEnabled: false,
			url:                "/release?cluster=cluster2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse version parameter: strconv.Atoi: parsing \\\"\\\": invalid syntax\"}\n",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getRelease(w, req)
			},
		},
		{
			name:               "invalid cluster name",
			permissionsEnabled: false,
			url:                "/release?cluster=cluster2&version=1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getRelease(w, req)
			},
		},
		{
			name:               "could not get release",
			url:                "/release?cluster=cluster1&namespace=namespace2&version=1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get Helm release: could not get helm release\"}\n",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getRelease(w, req)
			},
		},
		{
			name:               "return release",
			permissionsEnabled: false,
			url:                "/release?cluster=cluster1&namespace=namespace1&version=1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"cluster1\",\"name\":\"kobs\",\"version\":1,\"namespace\":\"kobs\"}\n",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getRelease(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", mock.Anything, "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", mock.Anything, "cluster2").Return(nil)

			mockHelmClient := &client.MockClient{}
			mockHelmClient.AssertExpectations(t)
			mockHelmClient.On("Get", mock.Anything, "namespace1", mock.Anything, mock.Anything).Return(&client.Release{Name: "kobs", Namespace: "kobs", Version: 1, Cluster: "cluster1"}, nil)
			mockHelmClient.On("Get", mock.Anything, "namespace2", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get helm release"))

			testNewHelmClient := func(clusterClient cluster.Client) client.Client {
				return mockHelmClient
			}

			newHelmClient = testNewHelmClient

			router := Router{chi.NewRouter(), mockClustersClient, tt.permissionsEnabled}
			router.Get("/release", router.getRelease)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetReleaseHistory(t *testing.T) {
	for _, tt := range []struct {
		name               string
		permissionsEnabled bool
		url                string
		expectedStatusCode int
		expectedBody       string
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "no user context",
			permissionsEnabled: false,
			url:                "/release/history",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to get the Helm release history: Unauthorized\"}\n",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getReleaseHistory(w, req)
			},
		},
		{
			name:               "no permissions",
			permissionsEnabled: true,
			url:                "/release/history",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to get the Helm release history: access forbidden\"}\n",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getReleaseHistory(w, req)
			},
		},
		{
			name:               "invalid cluster name",
			permissionsEnabled: false,
			url:                "/release/history?cluster=cluster2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getReleaseHistory(w, req)
			},
		},
		{
			name:               "could not get release",
			permissionsEnabled: false,
			url:                "/release?cluster=cluster1&namespace=namespace2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get Helm release: could not get helm release history\"}\n",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getReleaseHistory(w, req)
			},
		},
		{
			name:               "return release",
			permissionsEnabled: false,
			url:                "/release?cluster=cluster1&namespace=namespace1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"name\":\"kobs\",\"version\":1,\"namespace\":\"kobs\"},{\"cluster\":\"cluster1\",\"name\":\"kobs\",\"version\":2,\"namespace\":\"kobs\"}]\n",
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getReleaseHistory(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", mock.Anything, "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", mock.Anything, "cluster2").Return(nil)

			mockHelmClient := &client.MockClient{}
			mockHelmClient.AssertExpectations(t)
			mockHelmClient.On("History", mock.Anything, "namespace1", mock.Anything).Return([]*client.Release{{Name: "kobs", Namespace: "kobs", Version: 1, Cluster: "cluster1"}, {Name: "kobs", Namespace: "kobs", Version: 2, Cluster: "cluster1"}}, nil)
			mockHelmClient.On("History", mock.Anything, "namespace2", mock.Anything).Return(nil, fmt.Errorf("could not get helm release history"))

			testNewHelmClient := func(clusterClient cluster.Client) client.Client {
				return mockHelmClient
			}

			newHelmClient = testNewHelmClient

			router := Router{chi.NewRouter(), mockClustersClient, tt.permissionsEnabled}
			router.Get("/release/history", router.getReleaseHistory)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestMount(t *testing.T) {
	router1, err := Mount([]plugin.Instance{{Name: "helm", Options: map[string]interface{}{"permissionsEnabled": true}}}, nil)
	require.NoError(t, err)
	require.NotNil(t, router1)

	router2, err := Mount([]plugin.Instance{{Name: "helm1"}, {Name: "helm2"}}, nil)
	require.Error(t, err)
	require.Nil(t, router2)
}
