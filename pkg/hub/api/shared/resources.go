package shared

import (
	"strings"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
)

type Resource struct {
	ID          string                 `json:"id"`
	IsCRD       bool                   `json:"isCRD"`
	Path        string                 `json:"path"`
	Resource    string                 `json:"resource"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Scope       string                 `json:"scope"`
	Colums      []kubernetes.CRDColumn `json:"columns"`
}

var resources = []Resource{
	{
		ID:          "cronjobs",
		Description: "A CronJob creates Jobs on a repeating schedule.",
		IsCRD:       false,
		Path:        "/apis/batch/v1beta1",
		Resource:    "cronjobs",
		Scope:       "Namespaced",
		Title:       "CronJobs",
	},
	{
		ID:          "daemonsets",
		Description: "A DaemonSet ensures that all (or some) Nodes run a copy of a Pod.",
		IsCRD:       false,
		Path:        "/apis/apps/v1",
		Resource:    "daemonsets",
		Scope:       "Namespaced",
		Title:       "DaemonSets",
	},
	{
		ID:          "deployments",
		Description: "A Deployment provides declarative updates for Pods and ReplicaSets.",
		IsCRD:       false,
		Path:        "/apis/apps/v1",
		Resource:    "deployments",
		Scope:       "Namespaced",
		Title:       "Deployments",
	},
	{
		ID:          "jobs",
		Description: "A Job creates one or more Pods and will continue to retry execution of the Pods until a specified number of them successfully terminate.",
		IsCRD:       false,
		Path:        "/apis/batch/v1",
		Resource:    "jobs",
		Scope:       "Namespaced",
		Title:       "Jobs",
	},
	{
		ID:          "pods",
		Description: "Pods are the smallest deployable units of computing that you can create and manage in Kubernetes.",
		IsCRD:       false,
		Path:        "/api/v1",
		Resource:    "pods",
		Scope:       "Namespaced",
		Title:       "Pods",
	},
	{
		ID:          "replicasets",
		Description: "A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time.",
		IsCRD:       false,
		Path:        "/apis/apps/v1",
		Resource:    "replicasets",
		Scope:       "Namespaced",
		Title:       "ReplicaSets",
	},
	{
		ID:          "statefulsets",
		Description: "StatefulSet is the workload API object used to manage stateful applications.",
		IsCRD:       false,
		Path:        "/apis/apps/v1",
		Resource:    "statefulsets",
		Scope:       "Namespaced",
		Title:       "StatefulSets",
	},
	{
		ID:          "endpoints",
		Description: "",
		IsCRD:       false,
		Path:        "/api/v1",
		Resource:    "endpoints",
		Scope:       "Namespaced",
		Title:       "Endpoints",
	},
	{
		ID:          "horizontalpodautoscalers",
		Description: "",
		IsCRD:       false,
		Path:        "/apis/autoscaling/v2beta1",
		Resource:    "horizontalpodautoscalers",
		Scope:       "Namespaced",
		Title:       "HorizontalPodAutoscalers",
	},
	{
		ID:          "ingresses",
		Description: "",
		IsCRD:       false,
		Path:        "/apis/extensions/v1beta1",
		Resource:    "ingresses",
		Scope:       "Namespaced",
		Title:       "Ingresses",
	},
	{
		ID:          "networkpolicies",
		Description: "",
		IsCRD:       false,
		Path:        "/apis/networking.k8s.io/v1",
		Resource:    "networkpolicies",
		Scope:       "Namespaced",
		Title:       "NetworkPolicies",
	},
	{
		ID:          "services",
		Description: "",
		IsCRD:       false,
		Path:        "/api/v1",
		Resource:    "services",
		Scope:       "Namespaced",
		Title:       "Services",
	},
	{
		ID:          "configmaps",
		Description: "",
		IsCRD:       false,
		Path:        "/api/v1",
		Resource:    "configmaps",
		Scope:       "Namespaced",
		Title:       "ConfigMaps",
	},
	{
		ID:          "persistentvolumeclaims",
		Description: "",
		IsCRD:       false,
		Path:        "/api/v1",
		Resource:    "persistentvolumeclaims",
		Scope:       "Namespaced",
		Title:       "PersistentVolumeClaims",
	},
	{
		ID:          "persistentvolumes",
		Description: "",
		IsCRD:       false,
		Path:        "/api/v1",
		Resource:    "persistentvolumes",
		Scope:       "Cluster",
		Title:       "PersistentVolumes",
	},
	{
		ID:          "poddisruptionbudgets",
		Description: "",
		IsCRD:       false,
		Path:        "/apis/policy/v1beta1",
		Resource:    "poddisruptionbudgets",
		Scope:       "Namespaced",
		Title:       "PodDisruptionBudgets",
	},
	{
		ID:          "secrets",
		Description: "",
		IsCRD:       false,
		Path:        "/api/v1",
		Resource:    "secrets",
		Scope:       "Namespaced",
		Title:       "Secrets",
	},
	{
		ID:          "serviceaccounts",
		Description: "",
		IsCRD:       false,
		Path:        "/api/v1",
		Resource:    "serviceaccounts",
		Scope:       "Namespaced",
		Title:       "ServiceAccounts",
	},
	{
		ID:          "storageclasses",
		Description: "",
		IsCRD:       false,
		Path:        "/apis/storage.k8s.io/v1",
		Resource:    "storageclasses",
		Scope:       "Cluster",
		Title:       "StorageClasses",
	},
	{
		ID:          "clusterrolebindings",
		Description: "",
		IsCRD:       false,
		Path:        "/apis/rbac.authorization.k8s.io/v1",
		Resource:    "clusterrolebindings",
		Scope:       "Cluster",
		Title:       "ClusterRoleBindings",
	},
	{
		ID:          "clusterroles",
		Description: "",
		IsCRD:       false,
		Path:        "/apis/rbac.authorization.k8s.io/v1",
		Resource:    "clusterroles",
		Scope:       "Cluster",
		Title:       "ClusterRoles",
	},
	{
		ID:          "rolebindings",
		Description: "",
		IsCRD:       false,
		Path:        "/apis/rbac.authorization.k8s.io/v1",
		Resource:    "rolebindings",
		Scope:       "Namespaced",
		Title:       "RoleBindings",
	},
	{
		ID:          "roles",
		Description: "",
		IsCRD:       false,
		Path:        "/apis/rbac.authorization.k8s.io/v1",
		Resource:    "roles",
		Scope:       "Namespaced",
		Title:       "Roles",
	},
	{
		ID:          "events",
		Description: "",
		IsCRD:       false,
		Path:        "/api/v1",
		Resource:    "events",
		Scope:       "Namespaced",
		Title:       "Events",
	},
	{
		ID:          "namespaces",
		Description: "",
		IsCRD:       false,
		Path:        "/api/v1",
		Resource:    "namespaces",
		Scope:       "Cluster",
		Title:       "Namespaces",
	},
	{
		ID:          "nodes",
		Description: "",
		IsCRD:       false,
		Path:        "/api/v1",
		Resource:    "nodes",
		Scope:       "Cluster",
		Title:       "Nodes",
	},
	{
		ID:          "podsecuritypolicies",
		Description: "",
		IsCRD:       false,
		Path:        "/apis/policy/v1beta1",
		Resource:    "podsecuritypolicies",
		Scope:       "Cluster",
		Title:       "PodSecurityPolicies",
	},
}

func GetResources(crds []kubernetes.CRD) []Resource {
	var tmpResources = resources

	for _, crd := range crds {
		tmpResources = append(tmpResources, CRDToResource(crd))
	}

	return tmpResources
}

func CRDToResource(crd kubernetes.CRD) Resource {
	scope := "Cluster"
	if strings.ToLower(crd.Scope) == "namespaced" {
		scope = "Namespaced"
	}

	return Resource{
		ID:          crd.ID,
		Description: crd.Description,
		IsCRD:       true,
		Path:        crd.Path,
		Resource:    crd.Resource,
		Scope:       scope,
		Title:       crd.Title,
		Colums:      crd.Columns,
	}
}

func GetResourceByID(id string) Resource {
	for _, resource := range resources {
		if id == resource.ID {
			return resource
		}
	}

	return Resource{}
}
