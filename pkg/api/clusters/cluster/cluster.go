package cluster

import (
	"context"
	"regexp"
	"strings"
	"time"

	kobsClientsetVersioned "github.com/kobsio/kobs/pkg/generated/clientset/versioned"
	"github.com/kobsio/kobs/pkg/generated/proto"

	"github.com/sirupsen/logrus"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

var (
	log       = logrus.WithFields(logrus.Fields{"package": "cluster"})
	slugifyRe = regexp.MustCompile("[^a-z0-9]+")
)

// Cluster is a Kubernetes cluster. It contains all required fields to interact with the cluster and it's services.
type Cluster struct {
	cache         Cache
	clientset     *kubernetes.Clientset
	kobsClientset *kobsClientsetVersioned.Clientset
	options       Options
	name          string
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

// GetApplications returns a list of applications gor the given namespace. It also adds the cluster, namespace and
// application name to the application CR, so that this information must not be specified by the user in the CR.
func (c *Cluster) GetApplications(ctx context.Context, namespace string) ([]*proto.Application, error) {
	applicationsList, err := c.kobsClientset.KobsV1alpha1().Applications(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var applications []*proto.Application

	for _, app := range applicationsList.Items {
		if app.Spec == nil {
			continue
		}

		application := app.Spec
		application.Cluster = c.name
		application.Namespace = app.Namespace
		application.Name = app.Name

		if application.Metrics != nil && application.Metrics.Datasource == "" {
			application.Metrics.Datasource = c.options.datasources.Metrics
		}

		if application.Logs != nil && application.Logs.Datasource == "" {
			application.Logs.Datasource = c.options.datasources.Logs
		}

		applications = append(applications, application)
	}

	return applications, nil
}

// GetApplication returns a application for the given namespace and name. After the application is retrieved we replace,
// the cluster, namespace and name in the spec of the Application CR. This is needed, so that the user doesn't have to,
// provide these fields.
func (c *Cluster) GetApplication(ctx context.Context, namespace, name string) (*proto.Application, error) {
	applicationCR, err := c.kobsClientset.KobsV1alpha1().Applications(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	application := applicationCR.Spec
	application.Cluster = c.name
	application.Namespace = namespace
	application.Name = name

	if application.Metrics != nil && application.Metrics.Datasource == "" {
		application.Metrics.Datasource = c.options.datasources.Metrics
	}

	if application.Logs != nil && application.Logs.Datasource == "" {
		application.Logs.Datasource = c.options.datasources.Logs
	}

	return application, nil
}

// NewCluster returns a new cluster. Each cluster must have a unique name and a client to make requests against the
// Kubernetes API server of this cluster.
func NewCluster(name string, restConfig *rest.Config) (*Cluster, error) {
	clientset, err := kubernetes.NewForConfig(restConfig)
	if err != nil {
		log.WithError(err).Debugf("Could not create Kubernetes clientset.")
		return nil, err
	}

	kobsClientset, err := kobsClientsetVersioned.NewForConfig(restConfig)
	if err != nil {
		log.WithError(err).Debugf("Could not create kobs clientset.")
		return nil, err
	}

	name = strings.Trim(slugifyRe.ReplaceAllString(strings.ToLower(name), "-"), "-")

	return &Cluster{
		clientset:     clientset,
		kobsClientset: kobsClientset,
		name:          name,
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
