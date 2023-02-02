package clusters

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/clusters/cluster"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"

	"github.com/go-chi/chi/v5"
)

func TestGetClusters(t *testing.T) {
	t.Run("can get clusters", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		clusterClient := clusters.NewMockClient(ctrl)
		cluster1 := cluster.NewMockClient(ctrl)
		cluster1.EXPECT().GetName().Return("cluster-1")
		cluster2 := cluster.NewMockClient(ctrl)
		cluster2.EXPECT().GetName().Return("cluster-2")
		clusterClient.EXPECT().GetClusters().Return([]cluster.Client{
			cluster1,
			cluster2,
		})
		router := Router{chi.NewRouter(), dbClient, clusterClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/clusters", nil)
		w := httptest.NewRecorder()
		router.getClusters(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t,
			`{
				"clusters": ["cluster-1", "cluster-2"]
			}`, w)
	})
}

func TestGetNamespaces(t *testing.T) {
	t.Run("get namespaces fails", func(t *testing.T) {
		cluster := "cluster-1"
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetNamespacesByClusters(gomock.Any(), []string{cluster}).Return(nil, fmt.Errorf("could not get namespaces"))
		clusterClient := clusters.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, clusterClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		path := fmt.Sprintf("/namespaces?clusterID=%s", cluster)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, path, nil)
		w := httptest.NewRecorder()
		router.getNamespaces(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t,
			`{"error": "could not get namespaces"}`, w)

	})

	t.Run("get namespaces fails", func(t *testing.T) {
		cluster := "cluster-1"
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetNamespacesByClusters(gomock.Any(), []string{cluster}).Return([]db.Namespace{
			{Namespace: "default", Cluster: "dev-de1"},
			{Namespace: "kube-system", Cluster: "dev-de1"},
			{Namespace: "default", Cluster: "stage-de1"},
		}, nil)
		clusterClient := clusters.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, clusterClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		path := fmt.Sprintf("/namespaces?clusterID=%s", cluster)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, path, nil)
		w := httptest.NewRecorder()
		router.getNamespaces(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t,
			`["default","kube-system"]`,
			w)
	})
}

func TestGetResources(t *testing.T) {
	t.Run("get crds fails", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetCRDs(gomock.Any()).Return(nil, fmt.Errorf("could not get crds"))
		clusterClient := clusters.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, clusterClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/crds", nil)
		w := httptest.NewRecorder()
		router.getResources(w, req)

		utils.AssertStatusEq(t, http.StatusInternalServerError, w)
		utils.AssertJSONEq(t, `{"error": "could not get Custom Resource Definitions"}`, w)
	})

	t.Run("can get crds", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetCRDs(gomock.Any()).Return(nil, nil)
		clusterClient := clusters.NewMockClient(ctrl)
		router := Router{chi.NewRouter(), dbClient, clusterClient}

		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/crds", nil)
		w := httptest.NewRecorder()
		router.getResources(w, req)
		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `[{"id":"cronjobs","isCRD":false,"path":"/apis/batch/v1beta1","resource":"cronjobs","title":"CronJobs","description":"A CronJob creates Jobs on a repeating schedule.","scope":"Namespaced","columns":null},{"id":"daemonsets","isCRD":false,"path":"/apis/apps/v1","resource":"daemonsets","title":"DaemonSets","description":"A DaemonSet ensures that all (or some) Nodes run a copy of a Pod.","scope":"Namespaced","columns":null},{"id":"deployments","isCRD":false,"path":"/apis/apps/v1","resource":"deployments","title":"Deployments","description":"A Deployment provides declarative updates for Pods and ReplicaSets.","scope":"Namespaced","columns":null},{"id":"jobs","isCRD":false,"path":"/apis/batch/v1","resource":"jobs","title":"Jobs","description":"A Job creates one or more Pods and will continue to retry execution of the Pods until a specified number of them successfully terminate.","scope":"Namespaced","columns":null},{"id":"pods","isCRD":false,"path":"/api/v1","resource":"pods","title":"Pods","description":"Pods are the smallest deployable units of computing that you can create and manage in Kubernetes.","scope":"Namespaced","columns":null},{"id":"replicasets","isCRD":false,"path":"/apis/apps/v1","resource":"replicasets","title":"ReplicaSets","description":"A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time.","scope":"Namespaced","columns":null},{"id":"statefulsets","isCRD":false,"path":"/apis/apps/v1","resource":"statefulsets","title":"StatefulSets","description":"StatefulSet is the workload API object used to manage stateful applications.","scope":"Namespaced","columns":null},{"id":"endpoints","isCRD":false,"path":"/api/v1","resource":"endpoints","title":"Endpoints","description":"","scope":"Namespaced","columns":null},{"id":"horizontalpodautoscalers","isCRD":false,"path":"/apis/autoscaling/v2beta1","resource":"horizontalpodautoscalers","title":"HorizontalPodAutoscalers","description":"","scope":"Namespaced","columns":null},{"id":"ingresses","isCRD":false,"path":"/apis/extensions/v1beta1","resource":"ingresses","title":"Ingresses","description":"","scope":"Namespaced","columns":null},{"id":"networkpolicies","isCRD":false,"path":"/apis/networking.k8s.io/v1","resource":"networkpolicies","title":"NetworkPolicies","description":"","scope":"Namespaced","columns":null},{"id":"services","isCRD":false,"path":"/api/v1","resource":"services","title":"Services","description":"","scope":"Namespaced","columns":null},{"id":"configmaps","isCRD":false,"path":"/api/v1","resource":"configmaps","title":"ConfigMaps","description":"","scope":"Namespaced","columns":null},{"id":"persistentvolumeclaims","isCRD":false,"path":"/api/v1","resource":"persistentvolumeclaims","title":"PersistentVolumeClaims","description":"","scope":"Namespaced","columns":null},{"id":"persistentvolumes","isCRD":false,"path":"/api/v1","resource":"persistentvolumes","title":"PersistentVolumes","description":"","scope":"Cluster","columns":null},{"id":"poddisruptionbudgets","isCRD":false,"path":"/apis/policy/v1beta1","resource":"poddisruptionbudgets","title":"PodDisruptionBudgets","description":"","scope":"Namespaced","columns":null},{"id":"secrets","isCRD":false,"path":"/api/v1","resource":"secrets","title":"Secrets","description":"","scope":"Namespaced","columns":null},{"id":"serviceaccounts","isCRD":false,"path":"/api/v1","resource":"serviceaccounts","title":"ServiceAccounts","description":"","scope":"Namespaced","columns":null},{"id":"storageclasses","isCRD":false,"path":"/apis/storage.k8s.io/v1","resource":"storageclasses","title":"StorageClasses","description":"","scope":"Cluster","columns":null},{"id":"clusterrolebindings","isCRD":false,"path":"/apis/rbac.authorization.k8s.io/v1","resource":"clusterrolebindings","title":"ClusterRoleBindings","description":"","scope":"Cluster","columns":null},{"id":"clusterroles","isCRD":false,"path":"/apis/rbac.authorization.k8s.io/v1","resource":"clusterroles","title":"ClusterRoles","description":"","scope":"Cluster","columns":null},{"id":"rolebindings","isCRD":false,"path":"/apis/rbac.authorization.k8s.io/v1","resource":"rolebindings","title":"RoleBindings","description":"","scope":"Namespaced","columns":null},{"id":"roles","isCRD":false,"path":"/apis/rbac.authorization.k8s.io/v1","resource":"roles","title":"Roles","description":"","scope":"Namespaced","columns":null},{"id":"events","isCRD":false,"path":"/api/v1","resource":"events","title":"Events","description":"","scope":"Namespaced","columns":null},{"id":"namespaces","isCRD":false,"path":"/api/v1","resource":"namespaces","title":"Namespaces","description":"","scope":"Cluster","columns":null},{"id":"nodes","isCRD":false,"path":"/api/v1","resource":"nodes","title":"Nodes","description":"","scope":"Cluster","columns":null},{"id":"podsecuritypolicies","isCRD":false,"path":"/apis/policy/v1beta1","resource":"podsecuritypolicies","title":"PodSecurityPolicies","description":"","scope":"Cluster","columns":null}]`, w)
	})
}

func TestMount(t *testing.T) {
	router := Mount(Config{}, nil, nil)
	require.NotNil(t, router)
}
