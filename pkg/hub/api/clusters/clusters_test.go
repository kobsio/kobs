package clusters

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/kobsio/kobs/pkg/hub/store/shared"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetClusters(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(t *testing.T, mockStoreClient *store.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "get clusters fails",
			url:                "/clusters",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get clusters: could not get clusters\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return(nil, fmt.Errorf("could not get clusters"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getClusters(w, req)
			},
		},
		{
			name:               "get clusters",
			url:                "/clusters",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"satellite1\":[{\"id\":\"\",\"cluster\":\"dev-de1\",\"satellite\":\"satellite1\",\"updatedAt\":0},{\"id\":\"\",\"cluster\":\"dev-us1\",\"satellite\":\"satellite1\",\"updatedAt\":0}],\"satellite2\":[{\"id\":\"\",\"cluster\":\"stage-de1\",\"satellite\":\"satellite2\",\"updatedAt\":0}]}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return([]shared.Cluster{
					{Cluster: "dev-de1", Satellite: "satellite1"},
					{Cluster: "dev-us1", Satellite: "satellite1"},
					{Cluster: "stage-de1", Satellite: "satellite2"},
				}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getClusters(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient}

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestGetNamespaces(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(t *testing.T, mockStoreClient *store.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "get namespaces fails",
			url:                "/namespaces",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get namespaces: could not get namespaces\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetNamespacesByClusterIDs", mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get namespaces"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getNamespaces(w, req)
			},
		},
		{
			name:               "get namespaces",
			url:                "/namespaces",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[\"default\",\"kube-system\"]\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetNamespacesByClusterIDs", mock.Anything, mock.Anything).Return([]shared.Namespace{
					{Namespace: "default", Cluster: "dev-de1", Satellite: "satellite1"},
					{Namespace: "kube-system", Cluster: "dev-de1", Satellite: "satellite1"},
					{Namespace: "default", Cluster: "stage-de1", Satellite: "satellite2"},
				}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getNamespaces(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient}

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestGetResources(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(t *testing.T, mockStoreClient *store.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "get crds fails",
			url:                "/crds",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get Custom Resource Definitions: could not get crds\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetCRDs", mock.Anything).Return(nil, fmt.Errorf("could not get crds"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getResources(w, req)
			},
		},
		{
			name:               "get resources",
			url:                "/resources",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"id\":\"cronjobs\",\"isCRD\":false,\"path\":\"/apis/batch/v1beta1\",\"resource\":\"cronjobs\",\"title\":\"CronJobs\",\"description\":\"A CronJob creates Jobs on a repeating schedule.\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"daemonsets\",\"isCRD\":false,\"path\":\"/apis/apps/v1\",\"resource\":\"daemonsets\",\"title\":\"DaemonSets\",\"description\":\"A DaemonSet ensures that all (or some) Nodes run a copy of a Pod.\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"deployments\",\"isCRD\":false,\"path\":\"/apis/apps/v1\",\"resource\":\"deployments\",\"title\":\"Deployments\",\"description\":\"A Deployment provides declarative updates for Pods and ReplicaSets.\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"jobs\",\"isCRD\":false,\"path\":\"/apis/batch/v1\",\"resource\":\"jobs\",\"title\":\"Jobs\",\"description\":\"A Job creates one or more Pods and will continue to retry execution of the Pods until a specified number of them successfully terminate.\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"pods\",\"isCRD\":false,\"path\":\"/api/v1\",\"resource\":\"pods\",\"title\":\"Pods\",\"description\":\"Pods are the smallest deployable units of computing that you can create and manage in Kubernetes.\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"replicasets\",\"isCRD\":false,\"path\":\"/apis/apps/v1\",\"resource\":\"replicasets\",\"title\":\"ReplicaSets\",\"description\":\"A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time.\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"statefulsets\",\"isCRD\":false,\"path\":\"/apis/apps/v1\",\"resource\":\"statefulsets\",\"title\":\"StatefulSets\",\"description\":\"StatefulSet is the workload API object used to manage stateful applications.\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"endpoints\",\"isCRD\":false,\"path\":\"/api/v1\",\"resource\":\"endpoints\",\"title\":\"Endpoints\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"horizontalpodautoscalers\",\"isCRD\":false,\"path\":\"/apis/autoscaling/v2beta1\",\"resource\":\"horizontalpodautoscalers\",\"title\":\"HorizontalPodAutoscalers\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"ingresses\",\"isCRD\":false,\"path\":\"/apis/extensions/v1beta1\",\"resource\":\"ingresses\",\"title\":\"Ingresses\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"networkpolicies\",\"isCRD\":false,\"path\":\"/apis/networking.k8s.io/v1\",\"resource\":\"networkpolicies\",\"title\":\"NetworkPolicies\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"services\",\"isCRD\":false,\"path\":\"/api/v1\",\"resource\":\"services\",\"title\":\"Services\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"configmaps\",\"isCRD\":false,\"path\":\"/api/v1\",\"resource\":\"configmaps\",\"title\":\"ConfigMaps\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"persistentvolumeclaims\",\"isCRD\":false,\"path\":\"/api/v1\",\"resource\":\"persistentvolumeclaims\",\"title\":\"PersistentVolumeClaims\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"persistentvolumes\",\"isCRD\":false,\"path\":\"/api/v1\",\"resource\":\"persistentvolumes\",\"title\":\"PersistentVolumes\",\"description\":\"\",\"scope\":\"Cluster\",\"columns\":null},{\"id\":\"poddisruptionbudgets\",\"isCRD\":false,\"path\":\"/apis/policy/v1beta1\",\"resource\":\"poddisruptionbudgets\",\"title\":\"PodDisruptionBudgets\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"secrets\",\"isCRD\":false,\"path\":\"/api/v1\",\"resource\":\"secrets\",\"title\":\"Secrets\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"serviceaccounts\",\"isCRD\":false,\"path\":\"/api/v1\",\"resource\":\"serviceaccounts\",\"title\":\"ServiceAccounts\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"storageclasses\",\"isCRD\":false,\"path\":\"/apis/storage.k8s.io/v1\",\"resource\":\"storageclasses\",\"title\":\"StorageClasses\",\"description\":\"\",\"scope\":\"Cluster\",\"columns\":null},{\"id\":\"clusterrolebindings\",\"isCRD\":false,\"path\":\"/apis/rbac.authorization.k8s.io/v1\",\"resource\":\"clusterrolebindings\",\"title\":\"ClusterRoleBindings\",\"description\":\"\",\"scope\":\"Cluster\",\"columns\":null},{\"id\":\"clusterroles\",\"isCRD\":false,\"path\":\"/apis/rbac.authorization.k8s.io/v1\",\"resource\":\"clusterroles\",\"title\":\"ClusterRoles\",\"description\":\"\",\"scope\":\"Cluster\",\"columns\":null},{\"id\":\"rolebindings\",\"isCRD\":false,\"path\":\"/apis/rbac.authorization.k8s.io/v1\",\"resource\":\"rolebindings\",\"title\":\"RoleBindings\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"roles\",\"isCRD\":false,\"path\":\"/apis/rbac.authorization.k8s.io/v1\",\"resource\":\"roles\",\"title\":\"Roles\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"events\",\"isCRD\":false,\"path\":\"/api/v1\",\"resource\":\"events\",\"title\":\"Events\",\"description\":\"\",\"scope\":\"Namespaced\",\"columns\":null},{\"id\":\"namespaces\",\"isCRD\":false,\"path\":\"/api/v1\",\"resource\":\"namespaces\",\"title\":\"Namespaces\",\"description\":\"\",\"scope\":\"Cluster\",\"columns\":null},{\"id\":\"nodes\",\"isCRD\":false,\"path\":\"/api/v1\",\"resource\":\"nodes\",\"title\":\"Nodes\",\"description\":\"\",\"scope\":\"Cluster\",\"columns\":null},{\"id\":\"podsecuritypolicies\",\"isCRD\":false,\"path\":\"/apis/policy/v1beta1\",\"resource\":\"podsecuritypolicies\",\"title\":\"PodSecurityPolicies\",\"description\":\"\",\"scope\":\"Cluster\",\"columns\":null}]\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetCRDs", mock.Anything).Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getResources(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient}

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestMount(t *testing.T) {
	router := Mount(nil)
	require.NotNil(t, router)
}
