package cluster

import (
	"context"
	"time"

	"github.com/sirupsen/logrus"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "cluster"})
)

// Cluster is a Kubernetes cluster. It contains all required fields to interact with the cluster and it's services.
type Cluster struct {
	cache     Cache
	clientset *kubernetes.Clientset
	options   Options
	name      string
}

// Options contains various options, which could be set for a cluster. For example a user can set the cache duration for
// loaded manifest files and the names of the datasources, which should be used within a cluster.
type Options struct {
	cacheDuration time.Duration
	datasources   Datasources
}

// Datasources contains the names of the datasources for metrics, logs and traces. This must be compatible to
// proto.Datasources, but it contains the yaml tags, so that we can parse the configuration file.
type Datasources struct {
	Metrics string `yaml:"metrics"`
	Logs    string `yaml:"logs"`
	Traces  string `yaml:"traces"`
}

// Cache implements a simple caching layer, for the loaded manifest files. The goal of the caching layer is to return
// the manifests faster to the user.
type Cache struct {
	namespaces          []string
	namespacesLastFetch time.Time
}

// SetOptions is used to set the options for a cluster. The options are not set during the creation of a cluster, so
// that we do not have to pass around the options through different functions.
// We also do not know the datasources befor the cluster name is determined, so that we loop through all loaded clusters
// and connect the datasource names with the correct cluster.
func (c *Cluster) SetOptions(cacheDuration time.Duration, datasources Datasources) {
	c.options = Options{
		cacheDuration: cacheDuration,
		datasources:   datasources,
	}
}

// GetName returns the name of the cluster.
func (c *Cluster) GetName() string {
	return c.name
}

// GetNamespaces returns all namespaces for the cluster. To reduce the latency and the number of API calls, we are
// "caching" the namespaces. This means that if a new namespace is created in a cluster, this namespaces is only shown
// after the configured cache duration.
func (c *Cluster) GetNamespaces(ctx context.Context) ([]string, error) {
	log.WithFields(logrus.Fields{"last fetch": c.cache.namespacesLastFetch}).Tracef("Last namespace fetch.")

	if c.cache.namespacesLastFetch.After(time.Now().Add(-1 * c.options.cacheDuration)) {
		log.WithFields(logrus.Fields{"cluster": c.name}).Debugf("Return namespaces from cache.")

		return c.cache.namespaces, nil
	}

	namespaceList, err := c.clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var namespaces []string

	for _, namespace := range namespaceList.Items {
		namespaces = append(namespaces, namespace.ObjectMeta.Name)
	}

	log.WithFields(logrus.Fields{"cluster": c.name}).Debugf("Return namespaces from Kubernetes API.")
	c.cache.namespaces = namespaces
	c.cache.namespacesLastFetch = time.Now()

	return namespaces, nil
}

// GetResources returns a list for the given resource in the given namespace. The resource is identified by the
// Kubernetes API path and the name of the resource.
func (c *Cluster) GetResources(ctx context.Context, namespace, path, resource, paramName, param string) (string, error) {
	res, err := c.clientset.RESTClient().Get().AbsPath(path).Namespace(namespace).Resource(resource).Param(paramName, param).DoRaw(ctx)
	if err != nil {
		return "", err
	}

	return string(res), nil
}

// NewCluster returns a new cluster. Each cluster must have a unique name and a client to make requests against the
// Kubernetes API server of this cluster.
func NewCluster(name string, restConfig *rest.Config) (*Cluster, error) {
	clientset, err := kubernetes.NewForConfig(restConfig)
	if err != nil {
		log.WithError(err).Debugf("Could not create clientset.")
		return nil, err
	}

	return &Cluster{
		clientset: clientset,
		name:      name,
	}, nil
}

func contains(namespace string, namespaces []string) bool {
	for _, n := range namespaces {
		if n == namespace {
			return true
		}
	}

	return false
}
